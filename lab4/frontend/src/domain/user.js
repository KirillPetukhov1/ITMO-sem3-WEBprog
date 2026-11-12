import { ApiError } from '../shared/errors.js'

export function userFromToken(token) {
  try {
    const parts = token.split('.')

    if (parts.length !== 3) {
      throw new Error('JWT должен состоять из трёх частей')
    }

    const raw = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = raw.padEnd(Math.ceil(raw.length / 4) * 4, '=')
    const decodedPayload = atob(paddedPayload)

    const bytes = Uint8Array.from(decodedPayload, (character) => {
      return character.charCodeAt(0)
    })

    const json = new TextDecoder().decode(bytes)
    const payload = JSON.parse(json)

    if (typeof payload.sub !== 'string' || payload.sub.trim() === '') {
      throw new Error('В токене отсутствует имя пользователя')
    }

    if (!Array.isArray(payload.roles)) {
      throw new Error('В токене отсутствует массив ролей')
    }

    let role

    if (payload.roles.includes('ADMIN')) {
      role = 'ADMIN'
    } else if (payload.roles.includes('USER')) {
      role = 'USER'
    } else {
      throw new Error('В токене отсутствует поддерживаемая роль')
    }

    return {
      username: payload.sub,
      role
    }
  } catch {
    throw new ApiError('Некорректный JWT', 0, 'INVALID_TOKEN')
  }
}