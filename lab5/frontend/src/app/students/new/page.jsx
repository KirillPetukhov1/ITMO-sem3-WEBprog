import Link from 'next/link';

import Forbidden from '../../../components/Forbidden.jsx';
import StudentForm from '../../../components/StudentForm.jsx';
import { createStudentAction } from '../../../lib/actions/students.js';
import { requireSession } from '../../../lib/session.js';

export const metadata = { title: 'Новый студент' };

export default async function NewStudentPage() {
  const { user } = await requireSession();
  if (user.role !== 'ADMIN') {
    return <Forbidden />;
  }
  return (
    <main>
      <Link href="/students" className="btn btn-outline-secondary btn-sm mb-3">
        К списку
      </Link>
      <div className="card">
        <h1 className="card-header h4">Новый студент</h1>
        <div className="card-body">
          <StudentForm action={createStudentAction} buttonText="Создать" />
        </div>
      </div>
    </main>
  );
}
