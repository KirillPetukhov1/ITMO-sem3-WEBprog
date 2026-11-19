import { NextResponse } from 'next/server'
import { ACCESS_COOKIE, REFRESH_COOKIE } from '../../lib/tokens.js'

export function GET(request) {
  const response = NextResponse.redirect(
    new URL('/login?expired=1', request.url),
  )
  response.cookies.delete(ACCESS_COOKIE)
  response.cookies.delete(REFRESH_COOKIE)

  return response
}
