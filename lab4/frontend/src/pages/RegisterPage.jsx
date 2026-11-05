import Button from "../components/Button"
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { errorText } from '../api/errors.js'

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

    const body = JSON.stringify({ username, email, password })
    setIsSubmitting(true)

    try
    {
      const response = await fetch('/api/auth/register',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body
      })

      if (response.status === 201)
      {
        form.reset()
        setMessage('аккаунт готов, прошу к нашему шалашу')
        return
      }

      setIsError(true)
      setMessage(await errorText(response))
    }
    catch
    {
      setIsError(true)
      setMessage('связи нет, связь брат')
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
        <input id = "emailField" name = "email" type="email" required maxLength={254}/>

        <label htmlFor="usernameField"> username</label>
        <input id = "usernameField" name = "username" type="text" required
          minLength={3} maxLength={50} pattern="[A-Za-z0-9_.-]{3,50}"
          title="логин: 3–50 символов, латиница, цифры и ._-"/>
                
        <label htmlFor="passwordField"> password</label>
        <input id = "passwordField" name = "password" type="password" required
          minLength={8} maxLength={72}/>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'регистрируем...' : 'зарегистрироваться'}
        </Button>
      </form>
      <p role={isError ? 'alert' : 'status'} hidden={message === ''}>{message}</p>
      <Link to="/login">войти</Link>
    </main>
  )
}
