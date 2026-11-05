import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext.js'
import { errorText } from '../api/errors.js'
import StudentForm from '../components/StudentForm.jsx'

export default function CreateStudentPage() {
  const { authFetch } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  async function handleCreate(student) {
    // пока сохраняем, второй клик мимо
    if (submitting) {
      return
    }

    setMessage('')
    setSubmitting(true)

    try {
      const response = await authFetch('/api/students',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(student)
        })

      if (!response.ok) {
        setMessage(await errorText(response))
        return
      }

      const created = await response.json()
      navigate('/students/' + created.isuId, { replace: true })
    }
    catch {
      setMessage('связи нет, связь брат')
    }
    finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <Link to="/students">к списку</Link>
      <h1>новый студент</h1>
      <p>добавлять студентов тут может только админ</p>
      <StudentForm onSubmit={handleCreate} submitting={submitting} buttonText="создать" />
      <p role="alert" hidden={message === ''}>{message}</p>
    </main>
  )
}
