import Link from 'next/link';
import { notFound } from 'next/navigation';

import DeleteStudentButton from '../../../components/DeleteStudentButton.jsx';
import { loadStudent } from './loadStudent.js';

// динамический маршрут: [id] в имени папки — номер ИСУ из адреса /students/123456
export async function generateMetadata({ params }) {
  const { id } = await params;
  const { student } = await loadStudent(id);
  return { title: student ? student.fullName : 'Студент не найден' };
}

function Field({ label, children }) {
  return (
    <li className="list-group-item d-flex justify-content-between gap-3">
      <span className="text-body-secondary">{label}</span>
      <span className="text-end">{children}</span>
    </li>
  );
}

export default async function StudentPage({ params }) {
  const { id } = await params;
  const { student, user } = await loadStudent(id);
  if (!student) {
    notFound();
  }
  const isAdmin = user.role === 'ADMIN';

  return (
    <main>
      <Link href="/students" className="btn btn-outline-secondary btn-sm mb-3">
        обратно к списку
      </Link>

      <div className="card">
        <div className="card-header d-flex flex-wrap align-items-center gap-2">
          <h1 className="h4 mb-0">{student.fullName}</h1>
          <span className="badge text-bg-primary">{student.group}</span>
        </div>

        <ul className="list-group list-group-flush">
          <Field label="Номер ИСУ">{student.isuId}</Field>
          <Field label="Группа">{student.group}</Field>
          <Field label="Общага">{student.dormitory}</Field>
          <Field label="Комната">{student.room}</Field>
          <Field label="Дата заселения">{student.settlementDate}</Field>
          <Field label="Иностранец">{student.isForeigner ? 'да' : 'нет'}</Field>
          <li className="list-group-item">
            <div className="text-body-secondary mb-1">Примечания</div>
            <div className="text-break">{student.notes || '—'}</div>
          </li>
        </ul>

        {isAdmin && (
          <div className="card-footer d-flex gap-2">
            <Link href={`/students/${id}/edit`} className="btn btn-outline-primary">
              Изменить
            </Link>
            <DeleteStudentButton isuId={id} fullName={student.fullName} />
          </div>
        )}
      </div>
    </main>
  );
}
