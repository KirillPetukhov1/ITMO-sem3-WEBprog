import { NextResponse } from 'next/server'
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookie,
  isAccessFresh,
  refreshCookie,
  refreshTokens,
} from './lib/tokens.js'

function toLogin(request) {
  const url = new URL('/login', request.url)
  const target = request.nextUrl.pathname + request.nextUrl.search
  url.searchParams.set('next', target)
  const response = NextResponse.redirect(url)
  response.cookies.delete(ACCESS_COOKIE)
  response.cookies.delete(REFRESH_COOKIE)

  return response
}

export async function proxy(request) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value
  if (isAccessFresh(access)) {
    return NextResponse.next()
  }

  const pair = await refreshTokens(request.cookies.get(REFRESH_COOKIE)?.value)
  if (!pair) {
    return toLogin(request)
  }
  request.cookies.set(ACCESS_COOKIE, pair.accessToken)
  request.cookies.set(REFRESH_COOKIE, pair.refreshToken)
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  response.cookies.set(accessCookie(pair))
  response.cookies.set(refreshCookie(pair))

  return response
}

export const config = {
  matcher: ['/students/:path*', '/profile/:path*'],
}
