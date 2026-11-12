export class ApiError extends Error {
  constructor(message, status = 0, code = 'NETWORK_ERROR', details = {}) {
    super(message)
    this.name = 'ApiError'
    Object.assign(this, {
      status,
      code,
      details
    })
  }
}
const messages = {
  UNAUTHORIZED: 'Сессия истекла. Войдите снова',
  INVALID_CREDENTIALS: 'Неверный логин или пароль',
  INVALID_REFRESH_TOKEN: 'Сессия истекла. Войдите снова',
  ACCESS_DENIED: 'Недостаточно прав',
  STUDENT_NOT_FOUND: 'Студент удалён или не существует',
  PAGE_NOT_FOUND: 'Страница больше не существует',
  ISU_CONFLICT: 'Студент с таким ИСУ уже существует',
  USERNAME_CONFLICT: 'Логин уже занят',
  EMAIL_CONFLICT: 'Email уже занят',
  USER_CONFLICT: 'Пользователь уже существует',
  NETWORK_ERROR: 'Не удалось связаться с сервером',
  TIMEOUT: 'Сервер не ответил вовремя',
  INTERNAL_ERROR: 'Внутренняя ошибка сервера',
  INVALID_RESPONSE: 'Сервер вернул некорректный ответ',
  INVALID_TOKEN: 'Некорректные данные пользователя в токене'
}

export function getErrorMessage(error) {
  if (error?.name === 'AbortError') {
    return ''
  }

  let details = error?.details
  if (!details) {
    details = {}
  }
  const fields = Object.entries(details)
    .filter(([, value]) => Array.isArray(value))
    .map(([field, value]) => `${field}: ${value.join(' ')}`)
    .join(' ')

  if (fields) {
    return fields
  }
  const message = messages[error?.code]
  if (message) {
    return message
  }
  if (error?.message) {
    return error.message
  }
  return 'Не удалось выполнить операцию'
}
