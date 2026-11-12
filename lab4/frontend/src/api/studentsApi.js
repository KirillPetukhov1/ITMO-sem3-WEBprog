import { studentDto, searchDto, studentFromDto, pageFromDto } from '../domain/student.js'

function studentPath(id) {
  return `/api/students/${encodeURIComponent(id)}`
}

export function createStudentsApi(request) {
  async function list(query, signal) {
    const parameters = searchDto(query)
    const response = await request('/api/students', { query: parameters, signal })
    return pageFromDto(response)
  }

  async function query(parameters, signal) {
    const body = searchDto(parameters)
    const response = await request('/api/students', { method: 'QUERY', body, signal })
    return pageFromDto(response)
  }

  async function get(id, signal) {
    const response = await request(studentPath(id), { signal })
    return studentFromDto(response)
  }

  async function create(values) {
    const body = studentDto(values)
    const response = await request('/api/students', { method: 'POST', body })
    return studentFromDto(response)
  }

  async function update(id, values) {
    const body = studentDto(values, true)
    const response = await request(studentPath(id), { method: 'PATCH', body })
    return studentFromDto(response)
  }

  function remove(id) {
    return request(studentPath(id), { method: 'DELETE' })
  }

  return { list, query, get, create, update, remove }
}
