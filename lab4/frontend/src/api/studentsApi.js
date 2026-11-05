import { requestJson } from './httpClient.js'

export function listStudents(query, authFetch, signal) {
  const params = new URLSearchParams()
  for (const [name, value] of Object.entries(query)) {
    if (value !== '' && value !== null && value !== undefined) {
      params.set(name, String(value))
    }
  }
  return requestJson('/api/students?' + params, { signal }, authFetch)
}

export function getStudent(isuId, authFetch, signal) {
  return requestJson('/api/students/' + isuId, { signal }, authFetch)
}

export function createStudent(student, authFetch) {
  return requestJson('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student)
  }, authFetch)
}

export function updateStudent(isuId, values, authFetch) {
  return requestJson('/api/students/' + isuId, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values)
  }, authFetch)
}

export function deleteStudent(isuId, authFetch) {
  return requestJson('/api/students/' + isuId, { method: 'DELETE' }, authFetch, false)
}
