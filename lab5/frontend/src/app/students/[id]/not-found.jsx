import Link from 'next/link';

// свой 404 для /students/[id]: студента с таким ИСУ нет
export default function StudentNotFound() {
  return (
    <main className="text-center my-5">
      <p className="display-1 fw-bold mb-0">404</p>
      <h1 className="h3">Студент не найден</h1>
      <p className="text-body-secondary">Студент удалён или такого номера ИСУ не существует.</p>
      <Link href="/students" className="btn btn-primary">
        К списку студентов
      </Link>
    </main>
  );
}
