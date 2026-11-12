import { ApiError } from '../../shared/errors.js'
import { fetchTransport } from './fetchTransport.js'

function buildUrl(baseUrl, path, query) {
  const params = new URLSearchParams()
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        params.set(key, String(value))
      }
    }
  }
  let url = baseUrl.replace(/\/$/, '') + path
  if (params.size > 0) {
    url += `?${params}`
  }
  return url
}

function buildOptions(method, body, signal, headers) {
  const requestHeaders = {
    Accept: 'application/json'
  }
  const options = {
    method,
    signal,
    cache: 'no-store',
    headers: requestHeaders
  }
  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }
  Object.assign(requestHeaders, headers)
  return options
}

function responseError(response, data) {
  let message = `Ошибка HTTP ${response.status}`
  let code = 'HTTP_ERROR'
  let details = {}
  if (response.status >= 500) {
    code = 'INTERNAL_ERROR'
  }
  if (data?.error?.message) {
    message = data.error.message
  }
  if (data?.error?.code) {
    code = data.error.code
  }
  if (data?.error?.details) {
    details = data.error.details
  }
  return new ApiError(message, response.status, code, details)
}
async function readResponse(response) {
  let text = ''
  if (response.status !== 204) {
    text = await response.text()
  }
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      if (response.ok) {
        throw new ApiError('Некорректный JSON ответа', response.status, 'INVALID_RESPONSE')
      }
    }
  }
  if (!response.ok) {
    throw responseError(response, data)
  }
  return data
}

function normalizeRequestError(error, signal, timedOut) {
  if (signal?.aborted) {
    return new DOMException('Запрос отменён', 'AbortError')
  }
  if (timedOut) {
    return new ApiError('Время ожидания истекло', 0, 'TIMEOUT')
  }
  if (error instanceof ApiError || error.name === 'AbortError') {
    return error
  }
  return new ApiError('Не удалось связаться с сервером', 0, 'NETWORK_ERROR')
}

export function createHttpClient({
  baseUrl = '',
  timeout = 15000,
  transport = fetchTransport
} = {}) {
  return async function request(path, { method = 'GET', query, body, signal, headers = {} } = {}) {
    const url = buildUrl(baseUrl, path, query)
    const controller = new AbortController()
    const abort = () => controller.abort(signal?.reason)
    if (signal?.aborted) {
      abort()
    }
    signal?.addEventListener('abort', abort, {
      once: true
    })
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, timeout)
    try {
      const options = buildOptions(method, body, controller.signal, headers)
      const response = await transport(url, options)
      return await readResponse(response)
    } catch (error) {
      throw normalizeRequestError(error, signal, timedOut)
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
    }
  }
}
