import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext.js'
import { getErrorMessage } from '../api/httpClient.js'
import { getStudent, updateStudent } from '../api/studentsApi.js'
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
        const result = await getStudent(isuId, authFetch, controller.signal)

        if (controller.signal.aborted) {
          return
        }

        setStudent(result)
        setMessage('')
      }
      catch (error) {
        if (error.name !== 'AbortError') {
          if (error.name !== 'AbortError') setMessage(getErrorMessage(error))
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
      const updated = await updateStudent(isuId, values, authFetch)
      navigate('/students/' + updated.isuId, { replace: true })
    }
    catch {
      if (error.name !== 'AbortError') setMessage(getErrorMessage(error))
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
