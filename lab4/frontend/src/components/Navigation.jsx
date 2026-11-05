import { NavLink } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext.js'

export default function Navigation() {
  const { tokens, user, restoring } = useAuth()

  if (restoring) {
    return null
  }

  let links = (
    <>
      <NavLink to="/login">вход</NavLink>
      <NavLink to="/register">регистрация</NavLink>
    </>
  )

  if (tokens !== null) {
    let adminLink = null

    if (user?.role === 'ADMIN') {
      adminLink = <NavLink to="/students/new">создать студента</NavLink>
    }

    links = (
      <>
        <NavLink to="/students" end>студенты</NavLink>
        {adminLink}
        <NavLink to="/profile">профиль</NavLink>
      </>
    )
  }

  return <nav className="tabs" aria-label="вкладки">{links}</nav>
}
