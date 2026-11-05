import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext.js'
import { errorText } from '../api/errors.js'
import StudentForm from '../components/StudentForm.jsx'

export default function EditStudentPage() {
  const { isuId } = useParams()
  const { authFetch } = useAuth()
  const navigate = useNavigate()

  const [student, setStudent] = useState(null)
  const [message, setMessage] = useState('грузим...')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadStudent() {
      try {
        const response = await authFetch('/api/students/' + isuId,
          {
            signal: controller.signal
          })

        if (!response.ok) {
          setMessage(await errorText(response))
          return
        }

        const result = await response.json()

        if (controller.signal.aborted) {
          return
        }

        setStudent(result)
        setMessage('')
      }
      catch (error) {
        if (error.name !== 'AbortError') {
          setMessage('связи нет, связь брат')
        }
      }
    }

    loadStudent()
    return () => controller.abort()
  }, [isuId, authFetch])

  async function handleSave(values) {
    // те же поля, но теперь patch, ису сюда не тащим
    if (submitting) {
      return
    }

    setMessage('')
    setSubmitting(true)

    try {
      const response = await authFetch('/api/students/' + isuId,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        })

      if (!response.ok) {
        setMessage(await errorText(response))
        return
      }

      const updated = await response.json()
      navigate('/students/' + updated.isuId, { replace: true })
    }
    catch {
      setMessage('связи нет, связь брат')
    }
    finally {
      setSubmitting(false)
    }
  }

  let form = null

  if (student !== null) {
    form = <StudentForm student={student} onSubmit={handleSave}
      submitting={submitting} buttonText="сохранить" />
  }

  return (
    <main>
      <Link to={'/students/' + isuId}>к студенту</Link>
      <h1>изменить студента</h1>
      {form}
      <p role="status" hidden={message === ''}>{message}</p>
    </main>
  )
}
