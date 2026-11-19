import Link from 'next/link'

export default function Forbidden() {
  return (
    <main>
      <h1 className="h3">у миня нет прав, у миня нет прав</h1>
      <p className="text-body-secondary">
        Эта страница доступна только администратору.
      </p>
      <Link href="/students">к списку</Link>
    </main>
  )
}
