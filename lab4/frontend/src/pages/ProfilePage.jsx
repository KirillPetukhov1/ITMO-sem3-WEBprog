import { useState } from 'react'
import { useAuth } from '../auth/AuthContext.js'
import { Link, useNavigate } from 'react-router-dom'

export default function ProfilePage()
{
  const { user, userMessage, signOut } = useAuth()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout()
  {
    if (isLoggingOut)
    {
      return
    }

    setErrorMessage('')
    setIsLoggingOut(true)

    try
    {
      await signOut()
      navigate('/login', { replace: true })
    }
    catch
    {
      setErrorMessage('выход не вышел, проверь связь')
    }
    finally
    {
      setIsLoggingOut(false)
    }
  }

  let profile = null
  let roleInfo = null

  if (user !== null)
  {
    profile = (
      <dl>
        <dt>логин</dt><dd>{user.username}</dd>
        <dt>email</dt><dd>{user.email}</dd>
        <dt>роль</dt><dd>{user.role}</dd>
      </dl>
    )

    if (user.role !== 'ADMIN')
    {
      roleInfo = <p>смотреть можно, а создавать, менять и удалять — только админу</p>
    }
  }

  return (
    <main>
      <h1>профиль</h1>
      <p hidden={user !== null || userMessage !== ''}>грузим профиль...</p>
      <p role="alert" hidden={userMessage === ''}>{userMessage}</p>
      {profile}
      {roleInfo}
      <Link to="/students">открыть студентов</Link>
      <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? 'выход...' : 'выйти'}
      </button>
      <p role="alert" hidden={errorMessage === ''}>{errorMessage}</p>
    </main>
  )
}
