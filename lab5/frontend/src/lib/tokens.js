// общие для proxy и сервера функции работы с токенами (без server-only:
// proxy тоже их импортирует)
import { API_URL, COOKIE_SECURE, REQUEST_TIMEOUT } from './config.js';
import { userFromToken } from './domain/user.js';

export const ACCESS_COOKIE = 'lab5_access';
export const REFRESH_COOKIE = 'lab5_refresh';

// refresh-токен живёт 7 дней на бэкенде
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;
// обновляем access заранее, чтобы он не истёк посреди рендера
const EXPIRY_MARGIN = 30;

const baseCookie = {
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: 'lax',
  path: '/',
};

function payload(token) {
  try {
    const raw = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = raw.padEnd(Math.ceil(raw.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

// подпись тут не проверяем - это делает java. нам нужно только понять,
// не пора ли обновить токен и кого показывать в шапке
export function isAccessFresh(token) {
  if (!token) {
    return false;
  }
  const exp = payload(token)?.exp;
  return typeof exp === 'number' && exp - EXPIRY_MARGIN > Date.now() / 1000;
}

export function userFromAccess(token) {
  if (!token) {
    return null;
  }
  try {
    return userFromToken(token);
  } catch {
    return null;
  }
}

export function accessCookie(pair) {
  return {
    ...baseCookie,
    name: ACCESS_COOKIE,
    value: pair.accessToken,
    maxAge: Math.max(1, Number(pair.expiresIn) || 900),
  };
}

export function refreshCookie(pair) {
  return { ...baseCookie, name: REFRESH_COOKIE, value: pair.refreshToken, maxAge: REFRESH_MAX_AGE };
}

// обмен refresh-токена на новую пару; вернёт null, если сессия умерла
export async function refreshTokens(refreshToken) {
  if (!refreshToken) {
    return null;
  }
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
    if (!response.ok) {
      return null;
    }
    const pair = await response.json();
    if (typeof pair?.accessToken !== 'string' || typeof pair?.refreshToken !== 'string') {
      return null;
    }
    return pair;
  } catch {
    return null;
  }
}
