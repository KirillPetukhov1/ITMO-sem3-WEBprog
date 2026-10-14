"use strict";

import { AUTH_BASE_URL } from "./constants.js";
import { ApiError, request } from "./http.js";

const STORAGE_KEY = "students.auth";
let session = readSession();
let refreshPromise = null;
let version = 0;
let exiting = false;

function claims(token) {
    try {
        const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const bytes = Uint8Array.from(atob(part.padEnd(Math.ceil(part.length / 4) * 4, "=")), c => c.charCodeAt(0));
        return JSON.parse(new TextDecoder().decode(bytes));
    } catch { return null; }
}

function validPair(value) {
    const payload = claims(value?.accessToken || "");
    return typeof value?.refreshToken === "string" && value.refreshToken.length > 0
        && typeof payload?.sub === "string" && Number.isFinite(payload.exp)
        && Array.isArray(payload.roles);
}

function readSession() {
    try {
        const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
        return validPair(value) ? value : null;
    } catch { return null; }
}

function saveSession(value, reason) {
    session = value;
    try {
        if (value) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        else sessionStorage.removeItem(STORAGE_KEY);
    } catch { /* Without browser storage, this tab still works until reloaded. */ }
    window.dispatchEvent(new CustomEvent("auth-changed", { detail: { reason } }));
}

export function getUser() {
    if (!session) return null;
    const payload = claims(session.accessToken);
    // Claims are used only to display controls. The backend verifies the token and permissions.
    return payload ? { username: payload.sub, roles: payload.roles } : null;
}

export function isAdmin() { return Boolean(getUser()?.roles.includes("ADMIN")); }
export function getSessionVersion() { return version; }

function expired() {
    return !session || claims(session.accessToken).exp * 1000 <= Date.now() + 5000;
}

function endSession(reason) {
    version += 1;
    saveSession(null, reason);
}

export async function login(username, password) {
    const pair = await request(`${AUTH_BASE_URL}/login`, {
        method: "POST", body: JSON.stringify({ username, password })
    });
    if (!validPair(pair)) throw new ApiError(200, "INVALID_RESPONSE", "Некорректный ответ авторизации.");
    version += 1;
    saveSession(pair, "login");
}

export function register(data) {
    return request(`${AUTH_BASE_URL}/register`, { method: "POST", body: JSON.stringify(data) });
}

async function refresh() {
    if (refreshPromise) return refreshPromise;
    if (!session) throw new ApiError(401, "UNAUTHORIZED", "Войдите в аккаунт.");
    const currentVersion = version;
    const token = session.refreshToken;
    const pending = (async () => {
        try {
            const pair = await request(`${AUTH_BASE_URL}/refresh`, {
                method: "POST", body: JSON.stringify({ refreshToken: token })
            });
            if (version !== currentVersion) throw new ApiError(401, "SESSION_CHANGED", "Вход изменился.");
            if (!validPair(pair)) throw new ApiError(200, "INVALID_RESPONSE", "Некорректный ответ авторизации.");
            saveSession(pair, "refresh");
        } catch (error) {
            if (version === currentVersion) endSession("expired");
            throw error;
        }
    })();
    refreshPromise = pending;
    try { await pending; }
    finally { if (refreshPromise === pending) refreshPromise = null; }
}

export async function authorizedRequest(url, options = {}) {
    if (!session || exiting) throw new ApiError(401, "UNAUTHORIZED", "Войдите в аккаунт.");
    const startedVersion = version;
    if (expired()) await refresh();
    if (!session || version !== startedVersion || exiting) throw new ApiError(401, "SESSION_CHANGED", "Вход изменился.");
    let usedToken = session.accessToken;
    const send = () => request(url, {
        ...options, headers: { ...options.headers, Authorization: `Bearer ${usedToken}` }
    });
    let result;
    try { result = await send(); }
    catch (error) {
        if (version !== startedVersion || exiting) throw new ApiError(401, "SESSION_CHANGED", "Вход изменился.");
        if (error.status !== 401) throw error;
        // Concurrent 401s share one refresh. A late 401 reuses the already renewed token.
        if (session?.accessToken === usedToken) await refresh();
        if (!session || version !== startedVersion || exiting) throw new ApiError(401, "SESSION_CHANGED", "Вход изменился.");
        usedToken = session.accessToken;
        try { result = await send(); }
        catch (retryError) {
            if (retryError.status === 401 && version === startedVersion) endSession("expired");
            throw retryError;
        }
    }
    if (version !== startedVersion || exiting) throw new ApiError(401, "SESSION_CHANGED", "Вход изменился.");
    return result;
}

export async function logout() {
    exiting = true;
    try {
        // Wait for rotation, then revoke the newest refresh token, not its old value.
        if (refreshPromise) await refreshPromise.catch(() => {});
        const token = session?.refreshToken;
        endSession("logout");
        if (token) await request(`${AUTH_BASE_URL}/logout`, {
            method: "POST", body: JSON.stringify({ refreshToken: token })
        });
    } finally { exiting = false; }
}
