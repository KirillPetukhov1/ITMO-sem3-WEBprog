import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.js'

export default function ProtectedRoute({ children, adminOnly = false }) 
{
  const { tokens, restoring, user, userMessage } = useAuth()

  if (restoring) 
  {
    return <p role="status">вспоминаем, кто зашёл...</p>
  }

  if (!tokens?.accessToken) 
  {
    return <Navigate to="/login" replace />
  }

  if (adminOnly) 
  {
    // сюда только админу
    if (userMessage !== '') 
    {
      return <main><p role="alert">{userMessage}</p></main>
    }

    if (user === null) 
    {
      return <p role="status">смотрим, что тебе можно...</p>
    }

    if (user.role !== 'ADMIN') 
    {
      return <main><h1>у миня нет прав, у миня нет прав</h1><Link to="/students">к списку</Link></main>
    }
  }
  return children
}
