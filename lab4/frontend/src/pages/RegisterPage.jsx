import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap'

import { getErrorMessage } from '../api/httpClient.js'
import { register } from '../api/authApi.js'


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
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card>
            <Card.Body>
              <Card.Title as="h1" className="h3">Регистрация</Card.Title>
              <Card.Subtitle className="mb-4 text-muted">создай аккаунт</Card.Subtitle>

              {message && <Alert variant={isError ? 'danger' : 'success'}>{message}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="emailField">
                  <Form.Label>Email</Form.Label>
                  <Form.Control name="email" type="email" required maxLength={254}
                    autoComplete="email" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="usernameField">
                  <Form.Label>Логин</Form.Label>
                  <Form.Control name="username" type="text" required
                    minLength={3} maxLength={50} pattern="[A-Za-z0-9_.-]{3,50}"
                    autoComplete="username" />
                  <Form.Text className="text-muted">3–50 символов: латиница, цифры и . _ -</Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="passwordField">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control name="password" type="password" required
                    minLength={8} maxLength={72} autoComplete="new-password" />
                </Form.Group>

                <Button type="submit" className="w-100" disabled={isSubmitting}>
                  {isSubmitting && <Spinner animation="border" size="sm" className="me-2" />}
                  {isSubmitting ? 'Регистрируем...' : 'Зарегистрироваться'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <p className="text-center mt-3">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </Col>
      </Row>
    </main>
  )
}
