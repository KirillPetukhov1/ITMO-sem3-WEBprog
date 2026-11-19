'use client'

import { useState, useTransition } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'

import { registerAction } from '../lib/actions/auth.js'

export default function RegisterForm() {
  const [message, setMessage] = useState(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event) {
    event.preventDefault()
    if (pending) {
      return
    }

    const form = event.currentTarget
    const data = new FormData(form)
    const password = data.get('password')
    if (new TextEncoder().encode(password).length > 72) {
      setMessage({
        error: true,
        text: 'пароль должен занимать не более 72 байт UTF-8.',
      })

      return
    }
    setMessage(null)
    startTransition(async () => {
      const result = await registerAction({
        email: data.get('email').trim(),
        username: data.get('username').trim(),
        password,
      })
      if (result?.ok) {
        form.reset()
        setMessage({
          error: false,
          text: 'Аккаунт готов, прошу к нашему шалашу',
        })
      } else {
        setMessage({
          error: true,
          text: result?.error ?? 'Не удалось выполнить операцию.',
        })
      }
    })
  }

  return (
    <Form onSubmit={handleSubmit}>
      {message && (
        <Alert variant={message.error ? 'danger' : 'success'}>
          {message.text}
        </Alert>
      )}

      <Form.Group className="mb-3" controlId="emailField">
        <Form.Label>Email</Form.Label>
        <Form.Control
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="usernameField">
        <Form.Label>Логин</Form.Label>
        <Form.Control
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={50}
          pattern="[A-Za-z0-9_.\-]{3,50}"
          autoComplete="username"
        />
        <Form.Text className="text-muted">
          3-50 символов: латиница, цифры и . _ -
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="passwordField">
        <Form.Label>Пароль</Form.Label>
        <Form.Control
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
        />
      </Form.Group>

      <Button type="submit" className="w-100" disabled={pending}>
        {pending && <Spinner animation="border" size="sm" className="me-2" />}
        {pending ? 'Регистрируем...' : 'Зарегистрироваться'}
      </Button>
    </Form>
  )
}
