import Link from 'next/link'
import LogoutButton from '../../components/LogoutButton.jsx'
import RoleBadge from '../../components/RoleBadge.jsx'
import { backendFetch } from '../../lib/backend.js'
import { readAuthorized } from '../../lib/session.js'

export const metadata = {
  title: 'Профиль',
}

function Row({ label, children }) {
  return (
    <li className="list-group-item d-flex justify-content-between gap-3">
      <span className="text-body-secondary">{label}</span>
      <span className="text-break text-end">{children}</span>
    </li>
  )
}

export default async function ProfilePage() {
  const user = await readAuthorized((token) =>
    backendFetch('/api/auth/session/me', {
      token,
    }),
  )

  return (
    <main className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card">
          <h1 className="card-header h4">Профиль</h1>
          <ul className="list-group list-group-flush">
            <Row label="Логин">{user.username}</Row>
            <Row label="Email">{user.email}</Row>
            <Row label="Роль">
              <RoleBadge role={user.role} />
            </Row>
          </ul>
          <div className="card-body">
            {user.role !== 'ADMIN' && (
              <div className="alert alert-info">доступ только на просмотр</div>
            )}
            <div className="d-flex flex-wrap gap-2">
              <Link href="/students" className="btn btn-primary">
                открыть данные студентов
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
