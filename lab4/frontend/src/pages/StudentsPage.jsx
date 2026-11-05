import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext.js'
import StudentFilters from '../components/StudentFilters.jsx'
import useStudentList from '../hooks/useStudentList.js'

export default function StudentsPage() {
  const { authFetch, user } = useAuth()

  const [sortBy, setSortBy] = useState('isuId')
  const [order, setOrder] = useState('asc')
  const [fullName, setFullName] = useState('')
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({})

  const query = useMemo(() => {
    return { ...filters, fullName, sortBy, order, page }
  }, [filters, fullName, sortBy, order, page])

  const { loading, data, error } = useStudentList(query, authFetch)
  const students = data?.results || []
  const totalPages = data?.total_pages || 1
  const message = loading ? 'грузим...' : error //бем бем бем

  function handleSearch(event) //поиск по фио
  {
    event.preventDefault()

    const data = new FormData(event.currentTarget)
    const name = data.get('fullName').trim()

    setPage(1) // на первую страницу при поиске
    setFullName(name)
  }

  function handleNameChange(value) {
    setFullName(value)
    setPage(1) // поиск новый, листаем с начала
  }

  function handleApply(nextFilters) {
    setFilters(nextFilters)
    setPage(1)
  }

  function handleSortBy(event) //сортиров-очка
  {
    setSortBy(event.target.value)
    setPage(1)
  }

  function handleOrder(event) //порядок сортировки
  {
    setOrder(event.target.value)
    setPage(1)
  }

  let createLink = null

  if (user?.role === 'ADMIN') {
    createLink = <Link to="/students/new">создать студента</Link>
  }

  return (
    <main>
      <h1>студенткиХХХ</h1>
      {createLink}

      <p role={error === '' ? 'status' : 'alert'} hidden={message === ''}>
        {message}
      </p>

      <form onSubmit={handleSearch}>
        <label htmlFor="fullNameField">фио студента</label>
        <input id="fullNameField" name="fullName" type="search" maxLength={100}
          value={fullName} onChange={(event) => handleNameChange(event.target.value)} />
        <button type="submit">найти</button>
      </form>

      <StudentFilters onNameChange={handleNameChange} onApply={handleApply} />

      <div className="sort-row">
        <label htmlFor="sortField">сортировать по</label>
        <select id="sortField" value={sortBy} onChange={handleSortBy}>
          <option value="isuId">номер ису</option>
          <option value="fullName">фио</option>
          <option value="group">группа</option>
          <option value="dormitory">общага</option>
          <option value="room">комната</option>
          <option value="settlementDate">дата заселения</option>
          <option value="isForeigner">иностранец</option>
          <option value="notes">примечания</option>
        </select>

        <label htmlFor="orderField">аорядок</label>
        <select id="orderField" value={order} onChange={handleOrder}>
          <option value="asc">по возрастанию</option>
          <option value="desc">по убыванию</option>
        </select>
      </div>

      <p hidden={loading || error !== '' || data === null}>нашлось: {data?.count || 0}</p>
      <p hidden={loading || error !== '' || data === null || students.length !== 0}>никого не нашлось</p>

      <ul>
        {students.map((student) => {
          return (
            <li key={student.isuId}>
              <Link to={'/students/' + student.isuId}>
                {student.fullName}
              </Link>
              {' — ' + student.group}
            </li>
          )
        })}
      </ul>

      <div className="actions">
        <button type="button" disabled={loading || page === 1}
          onClick={() => setPage(page - 1)}>назад</button>
        <span>страница {page} из {totalPages}</span>
        <button type="button" disabled={loading || page >= totalPages}
          onClick={() => setPage(page + 1)}>вперёд</button>
      </div>
    </main>
  )
}
