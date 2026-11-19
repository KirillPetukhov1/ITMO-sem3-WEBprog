import Link from 'next/link'

import RegisterForm from '../../components/RegisterForm.jsx'

export const metadata = { title: 'Регистрация' }

export default function RegisterPage() {
  return (
    <main className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <div className="card">
          <div className="card-body">
            <h1 className="card-title h3">Регистрация</h1>
            <p className="card-subtitle mb-4 text-body-secondary">
              создай аккаунт
            </p>
            <RegisterForm />
          </div>
        </div>

        <p className="text-center mt-3">
          Уже есть аккаунт? <Link href="/login">Войти</Link>
        </p>
      </div>
    </main>
  )
}
