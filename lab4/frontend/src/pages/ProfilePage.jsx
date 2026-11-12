import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Badge, Button, Card, Col, ListGroup, Row, Spinner, Stack } from 'react-bootstrap'

import { useAuth } from '../auth/AuthContext.js'

export default function ProfilePage() {
  const { user, userMessage, signOut } = useAuth()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    if (isLoggingOut) {
      return
    }
    setErrorMessage('')
    setIsLoggingOut(true)
    try {
      await signOut()
      navigate('/login', {
        replace: true
      })
    } catch {
      setErrorMessage('выход не вышел, ты тут навечно...')
    } finally {
      setIsLoggingOut(false)
    }
  }
  let profile = null
  if (user !== null) {
    profile = (
      <ListGroup variant="flush">
        <ListGroup.Item className="d-flex justify-content-between">
          <span className="text-muted">Логин</span>
          <span>{user.username}</span>
        </ListGroup.Item>
        <ListGroup.Item className="d-flex justify-content-between">
          <span className="text-muted">Роль</span>
          <Badge bg={user.role === 'ADMIN' ? 'danger' : 'secondary'}>{user.role}</Badge>
        </ListGroup.Item>
      </ListGroup>
    )
  }
  return (
    <main>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Header as="h1" className="h4">
              Профиль
            </Card.Header>

            {user === null && userMessage === '' && (
              <Card.Body>
                <Spinner animation="border" size="sm" className="me-2" />
                грузим профиль...
              </Card.Body>
            )}

            {userMessage && (
              <Card.Body>
                <Alert variant="danger" className="mb-0">
                  {userMessage}
                </Alert>
              </Card.Body>
            )}

            {profile}

            <Card.Body>
              {user !== null && user.role !== 'ADMIN' && (
                <Alert variant="info">доступ только на просмотр</Alert>
              )}
              {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

              <Stack direction="horizontal" gap={2}>
                <Button as={Link} to="/students">
                  открыть данные студентов
                </Button>
                <Button
                  variant="outline-danger"
                  className="ms-auto"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut && <Spinner animation="border" size="sm" className="me-2" />}
                  {isLoggingOut ? 'Выходим...' : 'Выйти'}
                </Button>
              </Stack>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </main>
  )
}
