import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams
} from 'react-router-dom'

import { Container } from 'react-bootstrap'

import LoginPage from './pages/LoginPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import StudentsPage from './pages/StudentsPage.jsx'
import StudentDetailsPage from './pages/StudentDetailsPage.jsx'
import CreateStudentPage from './pages/CreateStudentPage.jsx'
import EditStudentPage from './pages/EditStudentPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Navigation from './components/Navigation.jsx'

function StudentRoute({ edit = false })
{
  const { isuId } = useParams()

  // ису другой - карточку тоже собираем заново
  if (edit) 
  {
    return <EditStudentPage key={isuId} />
  }

  return <StudentDetailsPage key={isuId} />
}

export default function App() 
{
  return (
    <BrowserRouter>
      <Navigation />
        <Container className="pb-4">
          <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route
            path="/profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />

          <Route
            path="/students"
            element={<ProtectedRoute><StudentsPage /></ProtectedRoute>}
          />
          <Route
            path="/students/new"
            element={<ProtectedRoute adminOnly><CreateStudentPage /></ProtectedRoute>}
          />
          <Route
            path="/students/:isuId"
            element={<ProtectedRoute><StudentRoute /></ProtectedRoute>}
          />
          <Route
            path="/students/:isuId/edit"
            element={<ProtectedRoute adminOnly><StudentRoute edit /></ProtectedRoute>}
          />
          <Route path="*" element={<main><h1>страница куда-то делась</h1></main>} />
        </Routes>
      </Container>
    </BrowserRouter>
  )
}
