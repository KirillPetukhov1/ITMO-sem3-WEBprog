import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Alert,
  Button,
  Col,
  Form,
  InputGroup,
  Pagination,
  Row,
  Spinner,
  Stack,
  Table
} from 'react-bootstrap'

import { useAuth } from '../auth/AuthContext.js'
import StudentFilters from '../components/StudentFilters.jsx'
import useStudentList from '../hooks/useStudentList.js'

export default function StudentsPage() {
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState('isuId')
  const [order, setOrder] = useState('asc')
  const [fullName, setFullName] = useState('')
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({})
  const [reloadKey, setReloadKey] = useState(0)
  const query = useMemo(() => {
    return {
      ...filters,
      fullName,
      sortBy,
      order,
      page,
      reloadKey
    }
  }, [filters, fullName, sortBy, order, page, reloadKey])
  const { loading, data, error } = useStudentList(query)
  // Синхронизация с исправленным сервером номером страницы после удаления
  useEffect(() => {
    if (data?.correctedFrom) {
      setPage((current) => {
        if (current === data.correctedFrom) {
          return data.page
        }
        return current
      })
    }
  }, [data])
  let students = data?.results
  if (!students) {
    students = []
  }
  let totalPages = data?.total_pages
  if (!totalPages) {
    totalPages = 1
  }

  function handleSearch(event) {
    //поиск по фио
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = data.get('fullName').trim()
    setPage(1) // на первую страницу при поиске
    setFullName(name)
  }

  function handleNameChange(value) {
    setFullName(value)
    setPage(1) // поиск новый и первая страница
  }

  function handleApply(nextFilters) {
    setFilters(nextFilters)
    setPage(1)
  }

  function handleSortBy(event) {
    //сортиров-очка
    setSortBy(event.target.value)
    setPage(1)
  }

  function handleOrder(event) {
    //порядок сортировки
    setOrder(event.target.value)
    setPage(1)
  }
  return (
    <main>
      <Stack direction="horizontal" className="mb-3">
        <h1 className="h3 mb-0">Студенты</h1>
        {user?.role === 'ADMIN' && (
          <Button as={Link} to="/students/new" variant="success" className="ms-auto">
            + Создать студента
          </Button>
        )}
      </Stack>

      <Row className="g-4">
        <Col lg={3}>
          <StudentFilters onNameChange={handleNameChange} onApply={handleApply} />
        </Col>

        <Col lg={9}>
          <Form onSubmit={handleSearch} className="mb-3">
            <InputGroup>
              <Form.Control
                name="fullName"
                type="search"
                maxLength={100}
                placeholder="Поиск по ФИО"
                aria-label="ФИО студента"
                pattern="[A-Za-zА-Яа-яЁё]+(-[A-Za-zА-Яа-яЁё]+)*( [A-Za-zА-Яа-яЁё]+(-[A-Za-zА-Яа-яЁё]+)*)*"
                value={fullName}
                onChange={(event) => event.currentTarget.form.requestSubmit()}
              />
              <Button type="submit">Найти</Button>
            </InputGroup>
          </Form>

          <Row className="g-2 mb-3">
            <Col sm={6}>
              <Form.Group controlId="sortField">
                <Form.Label className="small text-muted mb-1">Сортировать по</Form.Label>
                <Form.Select size="sm" value={sortBy} onChange={handleSortBy}>
                  <option value="isuId">номер ИСУ</option>
                  <option value="fullName">ФИО</option>
                  <option value="group">группа</option>
                  <option value="dormitory">общага</option>
                  <option value="room">комната</option>
                  <option value="settlementDate">дата заселения</option>
                  <option value="isForeigner">иностранец</option>
                  <option value="notes">примечания</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="orderField">
                <Form.Label className="small text-muted mb-1">Порядок</Form.Label>
                <Form.Select size="sm" value={order} onChange={handleOrder}>
                  <option value="asc">по возрастанию</option>
                  <option value="desc">по убыванию</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {loading && (
            <div className="text-center my-4">
              <Spinner animation="border" />
            </div>
          )}

          {error && (
            <Alert variant="danger" className="d-flex align-items-center">
              {error}
              <Button
                variant="outline-danger"
                size="sm"
                className="ms-auto"
                onClick={() => setReloadKey((value) => value + 1)}
              >
                Повторить
              </Button>
            </Alert>
          )}

          {data !== null && (
            <>
              <p className="text-muted small mb-2">Найдено: {data.count}</p>

              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>ИСУ</th>
                    <th>ФИО</th>
                    <th>Группа</th>
                    <th>Общага</th>
                    <th>Комната</th>
                    <th>Заселён</th>
                    <th>Иностранец</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted">
                        Никого не нашлось
                      </td>
                    </tr>
                  )}
                  {students.map((student) => (
                    <tr key={student.isuId}>
                      <td>{student.isuId}</td>
                      <td>
                        <Link to={'/students/' + student.isuId}>{student.fullName}</Link>
                      </td>
                      <td>{student.group}</td>
                      <td>{student.dormitory}</td>
                      <td>{student.room}</td>
                      <td>{student.settlementDate}</td>
                      <td>{student.isForeigner ? 'да' : 'нет'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <Pagination className="justify-content-center">
                <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
                <Pagination.Item active>
                  {page} из {totalPages}
                </Pagination.Item>
                <Pagination.Next disabled={page >= totalPages} onClick={() => setPage(page + 1)} />
              </Pagination>
            </>
          )}
        </Col>
      </Row>
    </main>
  )
}
