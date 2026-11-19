'use client'

import { useState, useTransition } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { loginAction } from '../lib/actions/auth.js'

export default function LoginForm({ next }) {
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(event) {
    event.preventDefault()
    if (pending) {
      return
    }

    const data = new FormData(event.currentTarget)
    setError('')
    startTransition(async () => {
      const result = await loginAction({
        username: data.get('username'),
        password: data.get('password'),
        next,
      })
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-3" controlId="usernameField">
        <Form.Label>Логин</Form.Label>
        <Form.Control
          name="username"
          type="text"
          required
          maxLength={50}
          autoComplete="username"
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="passwordField">
        <Form.Label>Пароль</Form.Label>
        <Form.Control
          name="password"
          type="password"
          required
          maxLength={72}
          autoComplete="current-password"
        />
      </Form.Group>

      <Button type="submit" className="w-100" disabled={pending}>
        {pending && <Spinner animation="border" size="sm" className="me-2" />}
        {pending ? 'Заходим...' : 'Войти'}
      </Button>
    </Form>
  )
}
