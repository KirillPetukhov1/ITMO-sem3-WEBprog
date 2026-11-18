'use client';

import { useState, useTransition } from 'react';
import { Alert, Button, Modal, Spinner } from 'react-bootstrap';

import { deleteStudentAction } from '../lib/actions/students.js';

export default function DeleteStudentButton({ isuId, fullName }) {
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function close() {
    if (!pending) {
      setShow(false);
      setError('');
    }
  }

  function handleDelete() {
    if (pending) {
      return;
    }
    setError('');
    startTransition(async () => {
      // успех — action сбросит кеш и уведёт на /students
      const result = await deleteStudentAction(isuId);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <Button variant="danger" className="ms-auto" onClick={() => setShow(true)}>
        Удалить
      </Button>

      <Modal show={show} onHide={close} centered>
        <Modal.Header closeButton>
          <Modal.Title>Удалить студента?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Студент <strong>{fullName}</strong> будет удалён навсегда. За что так с ним?
          {error && (
            <Alert variant="danger" className="mt-3 mb-0">
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close} disabled={pending}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={pending}>
            {pending && <Spinner animation="border" size="sm" className="me-2" />}
            {pending ? 'Удаляем...' : 'Удалить'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
