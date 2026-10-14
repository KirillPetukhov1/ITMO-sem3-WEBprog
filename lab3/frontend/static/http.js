"use strict";

export class ApiError extends Error {
    constructor(status, code, message, details = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

export async function request(url, options = {}) {
    const headers = {
        Accept: "application/json",
        ...options.headers
    };

    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let response;

    try {
        response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
            credentials: "omit"
        });
    } catch (error) {
        throw new ApiError(0, "NETWORK_ERROR", error.name === "AbortError"
            ? "Сервер не ответил вовремя. Повторите попытку." : "Не удалось подключиться к серверу.");
    } finally {
        clearTimeout(timeout);
    }

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type") || "";
    let data = null;
    if (contentType.includes("application/json")) {
        try {
            data = await response.json();
        } catch {
            throw new ApiError(response.status, "INVALID_RESPONSE", "Сервер вернул некорректный JSON.");
        }
    }

    if (!response.ok) {
        const error = data?.error || {};
        throw new ApiError(
            response.status,
            error.code || "API_ERROR",
            error.message || `Ошибка сервера: ${response.status}.`,
            error.details || {}
        );
    }

    if (data === null) {
        throw new ApiError(response.status, "INVALID_RESPONSE", "Ожидался JSON-ответ сервера.");
    }
    return data;
}
