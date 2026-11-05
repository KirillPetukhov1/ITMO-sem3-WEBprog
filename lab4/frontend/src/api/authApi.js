import { ApiError, requestJson } from './httpClient.js'

const sessionOptions = {
  method: 'POST',
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
  credentials: 'same-origin'
}

export async function login(credentials) {
  try {
    return await requestJson('/api/auth/session/login', {
      ...sessionOptions,
      headers: { ...sessionOptions.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
  }
  catch (error) {
    if (error.status === 401) {
      throw new ApiError('Неверное имя пользователя или пароль', 401, 'UNAUTHORIZED')
    }
    throw error
  }
}

export function register(values) {
  return requestJson('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values)
  }, fetch, false)
}

export function refreshSession() {
  return fetch('/api/auth/session/refresh', sessionOptions)
}

export function logout() {
  return requestJson('/api/auth/session/logout', sessionOptions, fetch, false)
}

export function getCurrentUser(authFetch) {
  return requestJson('/api/auth/session/me', {}, authFetch)
}
