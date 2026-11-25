import { pickQuery } from '../../../lib/query.js'
import { getSession } from '../../../lib/session.js'
import { listStudents, studentsVersion } from '../../../lib/students.js'

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  })
}

export async function GET(request) {
  const session = await getSession()
  if (!session) {
    return json({}, 401)
  }

  const query = pickQuery(request.nextUrl.searchParams)
  try {
    const data = await listStudents(query, session.token, { fresh: true })

    return json({ version: studentsVersion(data) })
  } catch (error) {
    if (error.code === 'PAGE_NOT_FOUND') {
      return json({ version: null })
    }

    return json({}, error.status || 503)
  }
}
