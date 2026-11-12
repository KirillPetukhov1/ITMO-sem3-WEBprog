import { userFromToken } from '../domain/user.js'
import { ApiError } from '../shared/errors.js'

const EXPIRED_MESSAGE = 'Сессия истекла. Войдите снова'
const endedSession = (error) =>
  ['NO_SESSION', 'INVALID_REFRESH_TOKEN', 'INVALID_TOKEN'].includes(error.code)

export function createSessionService(store, api) {
  let queue = Promise.resolve()
  let refreshing = null
  let restoration = null
  let mutations = 0
  let bootstrapping = false

  function enqueue(operation) {
    const result = queue.then(operation)
    queue = result.catch(() => {})
    return result
  }

  function updateBusy() {
    store.setState({ restoring: bootstrapping || mutations > 0 })
  }

  function accept(response, newSession = true) {
    if (typeof response?.accessToken !== 'string' || !response.accessToken) {
      throw new ApiError('Некорректный access-токен.', 0, 'INVALID_TOKEN')
    }
    const user = userFromToken(response.accessToken)
    const tokens = {
      accessToken: response.accessToken,
      tokenType: response.tokenType,
      expiresIn: response.expiresIn
    }
    store.setState((state) => ({
      tokens, user, userMessage: '', sessionMessage: '',
      generation: state.generation + (newSession ? 1 : 0)
    }))
    return tokens
  }

  function clear(message = '') {
    store.setState((state) => ({
      tokens: null, user: null, userMessage: '', sessionMessage: message,
      generation: state.generation + 1
    }))
  }

  function refresh() {
    if (mutations > 0) {
      return Promise.reject(new DOMException('Сессия изменяется', 'AbortError'))
    }
    const generation = store.getState().generation
    if (refreshing?.generation === generation) return refreshing.promise
    const entry = { generation }
    entry.promise = enqueue(async () => {
      try {
        if (store.getState().generation !== generation) {
          throw new DOMException('Сессия изменена', 'AbortError')
        }
        const response = await api.refresh()
        if (store.getState().generation !== generation) {
          throw new DOMException('Сессия изменена', 'AbortError')
        }
        return accept(response, false)
      } catch (error) {
        if (store.getState().generation === generation && endedSession(error)) {
          clear(EXPIRED_MESSAGE)
        }
        throw error
      } finally {
        if (refreshing === entry) refreshing = null
      }
    })
    refreshing = entry
    return entry.promise
  }

  function restore() {
    if (!restoration) {
      bootstrapping = true
      updateBusy()
      restoration = refresh().catch((error) => {
        if (endedSession(error)) {
          store.setState({ sessionMessage: '' })
        } else if (error.name !== 'AbortError') {
          store.setState({
            sessionMessage: 'Не удалось восстановить сессию. Проверьте подключение или войдите снова'
          })
        }
      }).finally(() => {
        bootstrapping = false
        updateBusy()
      })
    }
    return restoration
  }

  function changeSession(operation) {
    mutations += 1
    clear()
    updateBusy()
    const generation = store.getState().generation
    return enqueue(() => operation(generation)).finally(() => {
      mutations -= 1
      updateBusy()
    })
  }

  function signIn(values) {
    return changeSession(async (generation) => {
      const response = await api.login(values)
      if (store.getState().generation !== generation) {
        throw new DOMException('Сессия изменена', 'AbortError')
      }
      return accept(response, false)
    })
  }

  function signOut() {
    return changeSession(async (generation) => {
      try {
        await api.logout()
      } catch (error) {
        if (store.getState().generation === generation) {
          store.setState({
            sessionMessage: 'Локальный выход выполнен, но сервер не подтвердил удаление сессии. После перезагрузки вход может восстановиться'
          })
        }
        throw error
      }
    })
  }

  return {
    accept, clear, refresh, restore, signIn, signOut,
    tokens: () => mutations > 0 ? null : store.getState().tokens,
    generation: () => store.getState().generation,
    expire: () => clear(EXPIRED_MESSAGE)
  }
}
