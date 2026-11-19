'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container, Nav, Navbar } from 'react-bootstrap'
import RoleBadge from './RoleBadge.jsx'

function NavItem({ href, exact = false, children }) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Nav.Link as={Link} href={href} active={active}>
      {children}
    </Nav.Link>
  )
}

export default function Navigation({ user }) {
  let links = (
    <>
      <NavItem href="/login">вход</NavItem>
      <NavItem href="/register">регистрация</NavItem>
    </>
  )
  if (user) {
    links = (
      <>
        <NavItem href="/students" exact>
          студенты
        </NavItem>
        {user.role === 'ADMIN' && (
          <NavItem href="/students/new">создать студента</NavItem>
        )}
        <NavItem href="/profile">профиль</NavItem>
      </>
    )
  }

  return (
    <Navbar
      bg="dark"
      data-bs-theme="dark"
      expand="md"
      className="mb-4"
      collapseOnSelect
    >
      <Container>
        <Navbar.Brand as={Link} href={user ? '/students' : '/login'}>
          Студенты
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">{links}</Nav>
          {user && (
            <Navbar.Text>
              {user.username} <RoleBadge role={user.role} />
            </Navbar.Text>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
