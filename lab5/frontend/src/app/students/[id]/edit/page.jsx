import Link from 'next/link';
import { notFound } from 'next/navigation';

import Forbidden from '../../../../components/Forbidden.jsx';
import StudentForm from '../../../../components/StudentForm.jsx';
import { updateStudentAction } from '../../../../lib/actions/students.js';
import { loadStudent } from '../loadStudent.js';

export const metadata = { title: 'Изменить студента' };

export default async function EditStudentPage({ params }) {
  const { id } = await params;
  const { student, user } = await loadStudent(id);
  if (user.role !== 'ADMIN') {
    return <Forbidden />;
  }
  if (!student) {
    notFound();
  }
  // bind: номер ИСУ «вшивается» в server action, форма передаёт только поля
  const action = updateStudentAction.bind(null, id);
  return (
    <main>
      <Link href={`/students/${id}`} className="btn btn-outline-secondary btn-sm mb-3">
        К студенту
      </Link>
      <div className="card">
        <h1 className="card-header h4">Изменить студента</h1>
        <div className="card-body">
          <StudentForm key={id} student={student} action={action} buttonText="Сохранить" />
        </div>
      </div>
    </main>
  );
}
