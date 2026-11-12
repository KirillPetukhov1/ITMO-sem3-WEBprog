import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, Badge, Button, Card, ListGroup, Modal, Spinner, Stack } from 'react-bootstrap'

import useStudent from '../hooks/useStudent.js'
import { useAuth } from '../auth/AuthContext.js'
import { getErrorMessage } from '../shared/errors.js'
import { deleteStudent } from '../features/students/studentActions.js'

function Field({ label, children }) {
  return (
    <ListGroup.Item className="d-flex justify-content-between">
      <span className="text-muted">{label}</span>
      <span>{children}</span>
    </ListGroup.Item>
  )
}

export default function StudentDetailsPage() {
  const { isuId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: student, error: message } = useStudent(isuId)
  const [deleting, setDeleting] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDelete() {
    if (deleting) {
      return
    }
    setDeleteMessage('')
    setDeleting(true)
    try {
      await deleteStudent(isuId)
      navigate('/students', {
        replace: true
      })
    } catch (error) {
      if (error.name !== 'AbortError') {
        setDeleteMessage(getErrorMessage(error))
      }
    } finally {
      setDeleting(false)
    }
  }

  function closeConfirm() {
    if (!deleting) {
      setShowConfirm(false)
      setDeleteMessage('')
    }
  }
  const isAdmin = user?.role === 'ADMIN'
  return (
    <main>
      <Button as={Link} to="/students" variant="outline-secondary" size="sm" className="mb-3">
        обратно к списку
      </Button>

      {student === null && message === '' && (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      )}

      {message && <Alert variant="danger">{message}</Alert>}

      {student !== null && (
        <Card>
          <Card.Header>
            <Stack direction="horizontal" gap={2}>
              <h1 className="h4 mb-0">{student.fullName}</h1>
              <Badge bg="primary">{student.group}</Badge>
            </Stack>
          </Card.Header>

          <ListGroup variant="flush">
            <Field label="Номер ИСУ">{student.isuId}</Field>
            <Field label="Группа">{student.group}</Field>
            <Field label="Общага">{student.dormitory}</Field>
            <Field label="Комната">{student.room}</Field>
            <Field label="Дата заселения">{student.settlementDate}</Field>
            <Field label="Иностранец">{student.isForeigner ? 'да' : 'нет'}</Field>
            <ListGroup.Item>
              <div className="text-muted mb-1">Примечания</div>
              {student.notes || '—'}
            </ListGroup.Item>
          </ListGroup>

          {isAdmin && (
            <Card.Footer>
              <Stack direction="horizontal" gap={2}>
                <Button as={Link} to={'/students/' + isuId + '/edit'} variant="outline-primary">
                  Изменить
                </Button>
                <Button variant="danger" className="ms-auto" onClick={() => setShowConfirm(true)}>
                  Удалить
                </Button>
              </Stack>
            </Card.Footer>
          )}
        </Card>
      )}

      <Modal show={showConfirm} onHide={closeConfirm} centered>
        <Modal.Header closeButton>
          <Modal.Title>Удалить студента?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Студент <strong>{student?.fullName}</strong> будет удалён навсегда. За что так с ним?
          {deleteMessage && (
            <Alert variant="danger" className="mt-3 mb-0">
              {deleteMessage}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeConfirm} disabled={deleting}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting && <Spinner animation="border" size="sm" className="me-2" />}
            {deleting ? 'Удаляем...' : 'Удалить'}
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  )
}
