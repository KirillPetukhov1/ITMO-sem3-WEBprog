import Link from 'next/link'

import LoginForm from '../../components/LoginForm.jsx'
import { getSession } from '../../lib/session.js'

export const metadata = { title: 'Вход' }

export default async function LoginPage({ searchParams }) {
  const { next, expired } = await searchParams
  const session = await getSession()

  return (
    <main className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <div className="card">
          <div className="card-body">
            <h1 className="card-title h3">Вход</h1>
            <p className="card-subtitle mb-4 text-body-secondary">
              система управления разумом
            </p>

            {expired && (
              <div className="alert alert-warning">
                Сессия истекла. Войдите снова.
              </div>
            )}
            {session && (
              <div className="alert alert-info">
                Вы уже вошли как <strong>{session.user.username}</strong>.{' '}
                <Link href="/students">К студентам</Link>
              </div>
            )}

            <LoginForm next={typeof next === 'string' ? next : ''} />
          </div>
        </div>

        <p className="text-center mt-3">
          Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </main>
  )
}
