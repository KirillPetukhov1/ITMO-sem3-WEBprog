import { NextResponse } from 'next/server';

import { ACCESS_COOKIE, REFRESH_COOKIE } from '../../lib/tokens.js';

// сюда уводит серверный рендер, если java ответила 401:
// в самом рендере куки чистить нельзя, а в route handler — можно
export function GET(request) {
  const response = NextResponse.redirect(new URL('/login?expired=1', request.url));
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
