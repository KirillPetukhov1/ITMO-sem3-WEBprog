import { errorText } from './errors.js'

export class ApiError extends Error {
  constructor(message, status = 0, code = '', details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function getErrorMessage(error) {
  return error instanceof ApiError ? error.message : 'Не удалось выполнить операцию. Повторите попытку'
}

export async function requestJson(url, options = {}, send = fetch, parse = true) {
  let response
  try {
    response = await send(url, options)
  }
  catch (error) {
    if (error.name === 'AbortError' || error instanceof ApiError) throw error
    if (error instanceof TypeError) {
      throw new ApiError('Не удалось связаться с сервером. Повторите попытку', 0, 'NETWORK_ERROR')
    }
    throw error
  }

  if (!response.ok) {
    const body = await response.clone().json().catch(() => null)
    throw new ApiError(await errorText(response), response.status,
      body?.error?.code || '', body?.error?.details || null)
  }
  if (!parse || response.status === 204) return null
  try {
    return await response.json()
  }
  catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('Сервер вернул некорректный ответ', response.status, 'INVALID_RESPONSE')
  }
}

export function createAuthFetch({ getSession, getSessionId, refresh, expire }) {
  return async (url, options = {}) => {
    const sessionId = getSessionId()
    const checkSession = () => {
      options.signal?.throwIfAborted()
      if (getSessionId() !== sessionId) {
        throw new DOMException('Сессия изменилась', 'AbortError')
      }
    }
    const send = (token) => {
      checkSession()
      const headers = new Headers(options.headers)
      headers.set('Authorization', 'Bearer ' + token)
      return fetch(url, { ...options, headers })
    }

    checkSession()
    let token = getSession()?.accessToken
    if (!token) {
      await refresh()
      checkSession()
      token = getSession()?.accessToken
    }
    if (!token) throw new ApiError('Войдите в систему.', 401, 'UNAUTHORIZED')

    let response = await send(token)
    checkSession()
    if (response.status !== 401) return response

    if (getSession()?.accessToken === token) await refresh()
    if (getSessionId() !== sessionId) {
      if (!getSession()?.accessToken) return response
      checkSession()
    }
    checkSession()
    token = getSession()?.accessToken
    if (token) {
      response = await send(token)
      checkSession()
    }
    if (response.status === 401) expire()
    return response
  }
}
