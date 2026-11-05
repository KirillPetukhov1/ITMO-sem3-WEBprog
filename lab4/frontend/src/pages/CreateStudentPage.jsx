import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext.js'
import { getErrorMessage } from '../api/httpClient.js'
import { createStudent } from '../api/studentsApi.js'
import StudentForm from '../components/StudentForm.jsx'

export default function CreateStudentPage() 
{
  const { authFetch } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  async function handleCreate(student) 
  {
    
    if (submitting) 
    {
      return
    }

    setMessage('')
    setSubmitting(true)

    try 
    {
      const created = await createStudent(student, authFetch)
      navigate('/students/' + created.isuId, { replace: true })
    }
    catch 
    {
      if (error.name !== 'AbortError') setMessage(getErrorMessage(error))
    }
    finally 
    {
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
