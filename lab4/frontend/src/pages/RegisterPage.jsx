import { useState } from 'react'
import { Link } from 'react-router-dom'

import { getErrorMessage } from '../api/httpClient.js'
import { register } from '../api/authApi.js'
import Button from "../components/Button"

export default function RegisterPage() 
{
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) 
  {
    event.preventDefault()

    if (isSubmitting) 
    {
      return
    }

    setMessage('')
    setIsError(false)

    const form = event.currentTarget
    const data = new FormData(form)
    const email = data.get('email').trim()
    const username = data.get('username').trim()
    const password = data.get('password')

    if (new TextEncoder().encode(password).length > 72) 
    {
      setIsError(true)
      setMessage('Пароль должен занимать не более 72 байт UTF-8.')
      return
    }
    setIsSubmitting(true)

    try 
    {
      await register({ username, email, password })
      form.reset()
      setMessage('аккаунт готов, прошу к нашему шалашу')
    }
    catch (error) 
    {
      setIsError(true)
      setMessage(getErrorMessage(error))
    }
    finally 
    {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <h1>регистрация</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="emailField"> email</label>
        <input id="emailField" name="email" type="email" required maxLength={254} />

        <label htmlFor="usernameField"> username</label>
        <input id="usernameField" name="username" type="text" required
          minLength={3} maxLength={50} pattern="[A-Za-z0-9_.-]{3,50}"
          title="логин: 3–50 символов, латиница, цифры и ._-" />

        <label htmlFor="passwordField"> password</label>
        <input id="passwordField" name="password" type="password" required
          minLength={8} maxLength={72} />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'регистрируем...' : 'зарегистрироваться'}
        </Button>
      </form>
      <p role={isError ? 'alert' : 'status'} hidden={message === ''}>{message}</p>
      <Link to="/login">войти</Link>
    </main>
  )
}
