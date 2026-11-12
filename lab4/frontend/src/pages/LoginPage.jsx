import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import { useAuth } from '../auth/AuthContext.js'
import { getErrorMessage } from '../shared/errors.js'

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { signIn, signOut, restoring, sessionMessage, setSessionMessage } = useAuth()

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
    try {
      await signIn({
        username,
        password
      })
      navigate('/profile', {
        replace: true
      })
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <main>
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card>
            <Card.Body>
              <Card.Title as="h1" className="h3">
                Вход
              </Card.Title>
              <Card.Subtitle className="mb-4 text-muted">система управления разумом</Card.Subtitle>

              {sessionMessage && (
                <Alert variant="warning">
                  {sessionMessage}
                  <Button variant="link" disabled={restoring} onClick={async () => {
                    try { await signOut() } catch { /* Сообщение сохраняет сервис сессии. */ }
                  }}>Завершить серверную сессию</Button>
                </Alert>
              )}
              {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="usernameField">
                  <Form.Label>Логин</Form.Label>
                  <Form.Control name="username" type="text" required autoComplete="username" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="passwordField">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                  />
                </Form.Group>

                <Button type="submit" className="w-100" disabled={isSubmitting || restoring}>
                  {isSubmitting && <Spinner animation="border" size="sm" className="me-2" />}
                  {isSubmitting ? 'Заходим...' : 'Войти'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <p className="text-center mt-3">
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </Col>
      </Row>
    </main>
  )
}
