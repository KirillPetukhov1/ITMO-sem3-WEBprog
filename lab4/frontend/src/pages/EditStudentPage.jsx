import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Spinner } from 'react-bootstrap';

import { getErrorMessage } from '../shared/errors.js';
import { getStudent, updateStudent } from '../features/students/studentActions.js';
import StudentForm from '../components/StudentForm.jsx';

export default function EditStudentPage() {
  const { isuId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    getStudent(isuId, controller.signal)
      .then((result) => setStudent(result))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setMessage(getErrorMessage(error));
        }
      });
    return () => controller.abort();
  }, [isuId]);

  async function handleSave(values) {
    if (submitting) {
      return;
    }
    setMessage('');
    setSubmitting(true);
    try {
      await updateStudent(isuId, values);
      navigate('/students/' + isuId, {
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
      <Button
        as={Link}
        to={'/students/' + isuId}
        variant="outline-secondary"
        size="sm"
        className="mb-3"
      >
        К студенту
      </Button>

      <Card>
        <Card.Header as="h1" className="h4">
          Изменить студента
        </Card.Header>
        <Card.Body>
          {student === null && message === '' && <Spinner animation="border" />}
          {message && <Alert variant="danger">{message}</Alert>}
          {student !== null && (
            <StudentForm
              student={student}
              onSubmit={handleSave}
              submitting={submitting}
              buttonText="Сохранить"
            />
          )}
        </Card.Body>
      </Card>
    </main>
  );
}
