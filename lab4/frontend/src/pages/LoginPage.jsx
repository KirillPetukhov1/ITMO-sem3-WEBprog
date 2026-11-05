import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from "../components/Button.jsx"
import { useAuth } from '../auth/AuthContext.js'
import { errorText } from '../api/errors.js'


export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { setTokens, restoring, sessionMessage, setSessionMessage } = useAuth()

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting || restoring) {
      return
    }

    setErrorMessage('')
    setSessionMessage('')
    setIsSubmitting(true)

    const data = new FormData(event.currentTarget)
    const username = data.get('username')
    const password = data.get('password')
    const body = JSON.stringify({ username, password })

    try {
      const response = await fetch('/api/auth/session/login',
        {
          method: 'POST',
          headers:
          {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'same-origin',
          body: body
        })

      if (!response.ok) {
        setErrorMessage(response.status === 401
          ? 'логин или пароль мимо'
          : await errorText(response))
        return
      }

      const session = await response.json()
      // токен в память, сами идём в профиль
      setTokens(session)
      navigate('/profile', { replace: true })
    }
    catch {
      setErrorMessage('связи нет, связь брат')
    }
    finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <header>
        <h1>вход в систему</h1>
        <span>система управления студентами била ГЕЙтса</span>
      </header>

      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="usernameField"> username</label>
        <input id="usernameField" name="username" type="text" required />

        <label htmlFor="passwordField"> password</label>
        <input id="passwordField" name="password" type="password" required />
        <Button type="submit" disabled={isSubmitting || restoring}>
          {isSubmitting ? 'заходим...' : 'войти'}
        </Button>
      </form>
      <p role="alert" hidden={errorMessage === ''}> {/* вывод ошибки под форммаи*/}
        {errorMessage}
      </p>
      <p role="status" hidden={sessionMessage === ''}>{sessionMessage}</p>
    </main>
  )
}
