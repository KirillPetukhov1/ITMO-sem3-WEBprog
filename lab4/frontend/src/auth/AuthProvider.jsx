import { useCallback, useEffect, useRef, useState } from 'react'

import { createAuthFetch, getErrorMessage } from '../api/httpClient.js'
import { refreshSession, logout, getCurrentUser } from '../api/authApi.js'

import { AuthContext } from './AuthContext.js'

export function AuthProvider({ children }) {
  const [tokens, updateTokens] = useState(null)
  const [restoring, setRestoring] = useState(true)
  const [sessionMessage, setSessionMessage] = useState('')
  const [user, setUser] = useState(null)
  const [userMessage, setUserMessage] = useState('')

  const sessionRef = useRef(null)
  const generationRef = useRef(0)
  const sessionIdRef = useRef(0)
  const refreshingRef = useRef(null)

  const setTokens = useCallback((next, clearUser = true) => {
    generationRef.current += 1
    sessionRef.current = next
    updateTokens(next)
    if (clearUser) {
      sessionIdRef.current += 1
      setUser(null)
      setUserMessage('')
    }
  }, [])

  const refresh = useCallback(() => {
    // обновлялка уже идёт, вторую не плодим
    if (refreshingRef.current !== null) {
      return refreshingRef.current
    }

    const generation = generationRef.current
    const operation = (async () => {
      const response = refreshSession()

      if (generationRef.current !== generation) {
        return sessionRef.current
      }

      if (response.status === 401) {
        setTokens(null)
        setSessionMessage('Сессия истекла. Войдите снова')
        return null
      }

      if (!response.ok) {
        throw new Error('токен не обновился: ' + response.status)
      }

      const next = await response.json()

      if (generationRef.current !== generation) {
        return sessionRef.current
      }

      // токен новый, а форму и права не сносим
      setTokens(next, false)
      return next
    })().finally(() => {
      refreshingRef.current = null
    })

    refreshingRef.current = operation
    return operation
  }, [setTokens])

  useEffect(() => {
    let active = true

    refresh()
      .catch(() => {
        if (active) {
          setSessionMessage('вход не вспомнился, проверь связь')
        }
      })
      .finally(() => {
        if (active) {
          setRestoring(false)
        }
      })

    return () => {
      active = false
    }
  }, [refresh])

  const authFetch = useMemo(() => createAuthFetch({
    getSession: () => sessionRef.current,
    getSessionId: () => sessionIdRef.current,
    refresh,
    expire: () => {
      setTokens(null)
      setSessionMessage('Сессия истекла. Войдите снова.')
    }
  }), [refresh, setTokens])

  const signOut = useCallback(async () => {
    if (refreshingRef.current !== null) {
      try {
        await refreshingRef.current
      }
      catch {
        // обновление упало, но выйти всё равно пробуем
      }
    }

    await logout()

    setTokens(null)
    setSessionMessage('')
  }, [setTokens])

  useEffect(() => {
    if (!tokens?.accessToken) {
      return
    }

    let active = true

    async function loadUser() {
      // профиль один на все вкладки
      try {
        const result = await getCurrentUser(authFetch)
        if (active) {
          setUser(result)
          setUserMessage('')
        }
      }
      catch (error) {
        if (active && error.name !== 'AbortError') {
          setUserMessage(getErrorMessage(error))
        }
      }
    }

    loadUser()
    return () => {
      active = false
    }
  }, [tokens?.accessToken, authFetch])

  return (
    <AuthContext.Provider value={{ tokens, setTokens, restoring, sessionMessage, setSessionMessage, user, userMessage, authFetch, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
