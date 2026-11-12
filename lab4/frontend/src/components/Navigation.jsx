import { Link, NavLink } from 'react-router-dom';
import { Badge, Container, Nav, Navbar } from 'react-bootstrap';

import { useAuth } from '../auth/AuthContext.js';

export default function Navigation() {
  const { tokens, user, restoring } = useAuth();
  if (restoring) {
    return null;
  }
  let links = (
    <>
      <Nav.Link as={NavLink} to="/login">
        вход
      </Nav.Link>
      <Nav.Link as={NavLink} to="/register">
        регистрация
      </Nav.Link>
    </>
  );
  let userInfo = null;
  if (tokens !== null) {
    let adminLink = null;
    if (user?.role === 'ADMIN') {
      adminLink = (
        <Nav.Link as={NavLink} to="/students/new">
          создать студента
        </Nav.Link>
      );
    }
    links = (
      <>
        <Nav.Link as={NavLink} to="/students" end>
          студенты
        </Nav.Link>
        {adminLink}
        <Nav.Link as={NavLink} to="/profile">
          профиль
        </Nav.Link>
      </>
    );
  }
  if (user !== null) {
    userInfo = (
      <Navbar.Text>
        {user.username}{' '}
        <Badge bg={user.role === 'ADMIN' ? 'danger' : 'secondary'}>{user.role}</Badge>
      </Navbar.Text>
    );
  }
  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="md" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/students">
          Студенты
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">{links}</Nav>
          {userInfo}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
