import Link from 'next/link'

export const metadata = {
  title: 'Страница не найдена',
}

export default function NotFound() {
  return (
    <main className="text-center my-5">
      <p className="display-1 fw-bold mb-0">404</p>
      <h1 className="h3">страница куда-то делась</h1>
      <p className="text-body-secondary">
        Такой страницы нет или её уже удалили.
      </p>
      <Link href="/students" className="btn btn-primary">
        К списку студентов
      </Link>
    </main>
  )
}
