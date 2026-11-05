import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext.js'
import { getErrorMessage } from '../api/httpClient.js'
import { getStudent, deleteStudent } from '../api/studentsApi.js'

export default function StudentDetailsPage() {
  const { isuId } = useParams()
  const { authFetch, user } = useAuth()
  const navigate = useNavigate()

  const [student, setStudent] = useState(null)
  const [message, setMessage] = useState('грузим...')
  const [deleting, setDeleting] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState('')

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
          setMessage(getErrorMessage(error))
        }
      }
    }

    loadStudent()
    return () => controller.abort()
  }, [isuId, authFetch])

  async function handleDelete() {
    // сначала спрашиваем, потом уже удаляем
    if (deleting || !window.confirm('удалить студента ' + student.fullName + '?')) {
      return
    }

    setDeleteMessage('')
    setDeleting(true)

    try {
      await deleteStudent(isuId, authFetch)

      navigate('/students', { replace: true })
    }
    catch {
      if (error.name !== 'AbortError') setDeleteMessage(getErrorMessage(error))
    }
    finally {
      setDeleting(false)
    }
  }

  let information = <p>{message}</p>

  if (student !== null) {
    information = (
      <dl>
        <dt>номер ису</dt><dd>{student.isuId}</dd>
        <dt>фио</dt><dd>{student.fullName}</dd>
        <dt>группа</dt><dd>{student.group}</dd>
        <dt>общага</dt><dd>{student.dormitory}</dd>
        <dt>комната</dt><dd>{student.room}</dd>
        <dt>дата заселения</dt><dd>{student.settlementDate}</dd>
        <dt>иностранец</dt><dd>{student.isForeigner ? 'да' : 'нет'}</dd>
        <dt>примечания</dt><dd>{student.notes || '—'}</dd>
      </dl>
    )
  }

  let adminActions = null

  if (user?.role === 'ADMIN' && student !== null) {
    adminActions = (
      <div className="actions">
        <Link to={'/students/' + isuId + '/edit'}>изменить</Link>
        <button type="button" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'удаляем...' : 'удалить'}
        </button>
      </div>
    )
  }

  return (
    <main>
      <Link to="/students">к списку</Link>
      <h1>студент</h1>
      {information}
      {adminActions}
      <p role="alert" hidden={deleteMessage === ''}>{deleteMessage}</p>
    </main>
  )
}
