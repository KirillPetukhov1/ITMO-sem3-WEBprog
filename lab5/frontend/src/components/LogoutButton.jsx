'use client';

import { useTransition } from 'react';
import { Button, Spinner } from 'react-bootstrap';

import { logoutAction } from '../lib/actions/auth.js';

export default function LogoutButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline-danger"
      className="ms-auto"
      disabled={pending}
      onClick={() => startTransition(() => logoutAction())}
    >
      {pending && <Spinner animation="border" size="sm" className="me-2" />}
      {pending ? 'Выходим...' : 'Выйти'}
    </Button>
  );
}
