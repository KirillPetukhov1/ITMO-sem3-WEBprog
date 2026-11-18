import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card } from 'react-bootstrap';

import { getErrorMessage } from '../shared/errors.js';
import { createStudent } from '../features/students/studentActions.js';
import StudentForm from '../components/StudentForm.jsx';

export default function CreateStudentPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleCreate(student) {
    if (submitting) {
      return;
    }
    setMessage('');
    setSubmitting(true);
    try {
      const created = await createStudent(student);
      navigate('/students/' + created.isuId, {
        replace: true,
      });
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <main>
      <Button as={Link} to="/students" variant="outline-secondary" size="sm" className="mb-3">
        К списку
      </Button>

      <Card>
        <Card.Header as="h1" className="h4">
          Новый студент
        </Card.Header>
        <Card.Body>
          {message && <Alert variant="danger">{message}</Alert>}
          <StudentForm onSubmit={handleCreate} submitting={submitting} buttonText="Создать" />
        </Card.Body>
      </Card>
    </main>
  );
}
