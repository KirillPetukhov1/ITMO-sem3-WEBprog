import { useCallback, useEffect, useRef, useState } from 'react'
import { AuthContext } from './AuthContext.js'

export function AuthProvider({ children })
{
  const [tokens, updateTokens] = useState(null)
  const [restoring, setRestoring] = useState(true)
  const [sessionMessage, setSessionMessage] = useState('')
  const [user, setUser] = useState(null)
  const [userMessage, setUserMessage] = useState('')

  const sessionRef = useRef(null)
  const generationRef = useRef(0)
  const refreshingRef = useRef(null)

  const setTokens = useCallback((next, clearUser = true) =>
  {
    generationRef.current += 1
    sessionRef.current = next
    updateTokens(next)
    if (clearUser)
    {
      setUser(null)
      setUserMessage('')
    }
  }, [])

  const refresh = useCallback(() =>
  {
    // обновлялка уже идёт, вторую не плодим
    if (refreshingRef.current !== null)
    {
      return refreshingRef.current
    }

    const generation = generationRef.current
    const operation = (async () =>
    {
      const response = await fetch('/api/auth/session/refresh',
      {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin'
      })

      if (generationRef.current !== generation)
      {
        return sessionRef.current
      }

      if (response.status === 401)
      {
        setTokens(null)
        return null
      }

      if (!response.ok)
      {
        throw new Error('токен не обновился: ' + response.status)
      }

      const next = await response.json()

      if (generationRef.current !== generation)
      {
        return sessionRef.current
      }

      // токен новый, а форму и права не сносим
      setTokens(next, false)
      return next
    })().finally(() =>
    {
      refreshingRef.current = null
    })

    refreshingRef.current = operation
    return operation
  }, [setTokens])

  useEffect(() =>
  {
    let active = true

    refresh()
      .catch(() =>
      {
        if (active)
        {
          setSessionMessage('вход не вспомнился, проверь связь')
        }
      })
      .finally(() =>
      {
        if (active)
        {
          setRestoring(false)
        }
      })

    return () =>
    {
      active = false
    }
  }, [refresh])

  const authFetch = useCallback(async (url, options = {}) =>
  {
    const send = (accessToken) =>
    {
      const headers = new Headers(options.headers)
      headers.set('Authorization', 'Bearer ' + accessToken)
      return fetch(url, { ...options, headers })
    }

    let sentToken = sessionRef.current?.accessToken

    if (!sentToken)
    {
      const session = await refresh()
      sentToken = session?.accessToken
    }

    if (!sentToken)
    {
      throw new Error('сначала зайди в аккаунт')
    }

    const response = await send(sentToken)

    // токен стух — обновляем и пробуем запрос ещё разок
    if (response.status !== 401)
    {
      return response
    }

    let nextToken = sessionRef.current?.accessToken

    if (nextToken === sentToken)
    {
      const session = await refresh()
      nextToken = session?.accessToken
    }

    if (!nextToken)
    {
      setSessionMessage('сессия всё, зайди ещё раз')
      return response
    }

    return send(nextToken)
  }, [refresh])

  const signOut = useCallback(async () =>
  {
    if (refreshingRef.current !== null)
    {
      try
      {
        await refreshingRef.current
      }
      catch
      {
        // обновление упало, но выйти всё равно пробуем
      }
    }

    const response = await fetch('/api/auth/session/logout',
    {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'same-origin'
    })

    if (!response.ok)
    {
      throw new Error('выход не вышел: ' + response.status)
    }

    setTokens(null)
    setSessionMessage('')
  }, [setTokens])

  useEffect(() =>
  {
    if (!tokens?.accessToken)
    {
      return
    }

    let active = true

    async function loadUser()
    {
      // профиль один на все вкладки, не таскаем его по кругу
      try
      {
        const response = await authFetch('/api/auth/session/me')

        if (!response.ok)
        {
          if (active)
          {
            setUserMessage('профиль не загрузился: ' + response.status)
          }
          return
        }

        const result = await response.json()
        if (active)
        {
          setUser(result)
          setUserMessage('')
        }
      }
      catch
      {
        if (active)
        {
          setUserMessage('связи нет, связь брат')
        }
      }
    }

    loadUser()
    return () =>
    {
      active = false
    }
  }, [tokens?.accessToken, authFetch])

  return (
    <AuthContext.Provider value={{ tokens, setTokens, restoring, sessionMessage, setSessionMessage, user, userMessage, authFetch, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
