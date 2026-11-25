import 'server-only'
import { API_URL, REQUEST_TIMEOUT } from './config.js'
import { ApiError } from './errors.js'

function buildUrl(path, query) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) {
      params.set(key, String(value))
    }
  }

  const search = params.size > 0 ? `?${params}` : ''

  return API_URL + path + search
}

function responseError(response, data) {
  let code = response.status >= 500 ? 'INTERNAL_ERROR' : 'HTTP_ERROR'
  let message = `Ошибка HTTP ${response.status}`
  let details = {}
  if (data?.error?.code) {
    code = data.error.code
  }

  if (data?.error?.message) {
    message = data.error.message
  }

  if (data?.error?.details) {
    details = data.error.details
  }

  return new ApiError(message, response.status, code, details)
}

async function readResponse(response) {
  const text = response.status === 204 ? '' : await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      if (response.ok) {
        throw new ApiError(
          'Некорректный JSON ответа',
          response.status,
          'INVALID_RESPONSE',
        )
      }
    }
  }

  if (!response.ok) {
    throw responseError(response, data)
  }

  return data
}

export async function backendFetch(
  path,
  { method = 'GET', query, body, token, cache = 'no-store', next } = {},
) {
  const headers = {
    Accept: 'application/json',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const options = {
    method,
    headers,
    cache,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  }
  if (next) {
    options.next = next
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(buildUrl(path, query), options)
  } catch (error) {
    if (error?.name === 'TimeoutError') {
      throw new ApiError('Время ожидания истекло', 0, 'TIMEOUT')
    }
    throw new ApiError('Не удалось связаться с сервером', 0, 'NETWORK_ERROR')
  }

  return readResponse(response)
}
