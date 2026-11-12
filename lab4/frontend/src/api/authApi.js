import { ApiError } from '../shared/errors.js'

export function createAuthApi(request) {
  const post = (operation, body) =>
    request(`/api/auth/${operation}`, {
      method: 'POST',
      body,
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
  const credentials = (values, registration) => {
    const { username, password, email } = values
    const details = {}
    let minPasswordLength = 1
    if (registration) {
      minPasswordLength = 8
    }
    if (
      typeof username !== 'string' ||
      !username.trim() ||
      username.length > 50 ||
      (registration && !/^[A-Za-z0-9_.-]{3,50}$/.test(username))
    ) {
      details.username = ['Некорректный логин']
    }
    if (
      typeof password !== 'string' ||
      password.length < minPasswordLength ||
      password.length > 72 ||
      new TextEncoder().encode(password).length > 72
    ) {
      details.password = ['Некорректная длина пароля: максимум 72 байта UTF-8']
    }
    if (
      registration &&
      (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      details.email = ['Некорректный email.']
    }
    if (Object.keys(details).length) {
      throw new ApiError('Проверьте данные.', 422, 'VALIDATION_ERROR', details)
    }
    if (registration) {
      return {
        username,
        password,
        email
      }
    } else {
      return {
        username,
        password
      }
    }
  }
  return {
    login: (values) => post('session/login', credentials(values, false)),
    register: (values) => post('register', credentials(values, true)),
    refresh: () => post('session/refresh'),
    logout: () => post('session/logout')
  }
}
