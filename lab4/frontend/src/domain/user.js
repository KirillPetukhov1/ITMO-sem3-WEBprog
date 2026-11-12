import { ApiError } from '../shared/errors.js'

export function userFromToken(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error()
    }
    const raw = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = raw.padEnd(Math.ceil(raw.length / 4) * 4, '=')
    const decodedPayload = atob(paddedPayload)
    const bytes = Uint8Array.from(decodedPayload, (character) => character.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    const value = JSON.parse(json)
    if (typeof value.sub !== 'string' || !value.sub.trim() || !Array.isArray(value.roles)) {
      throw new Error()
    }
    const role = value.roles.includes('ADMIN') ? 'ADMIN' :
      value.roles.includes('USER') ? 'USER' : null
    if (!role) throw new Error()
    return { username: value.sub, role }
  } catch {
    throw new ApiError('Некорректный JWT.', 0, 'INVALID_TOKEN')
  }
}
