// middleware приложения. в next 16 файл middleware.js переименовали в proxy.js,
// работает так же: запускается на сервере ДО рендера страницы
import { NextResponse } from 'next/server';

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookie,
  isAccessFresh,
  refreshCookie,
  refreshTokens,
} from './lib/tokens.js';

function toLogin(request) {
  const url = new URL('/login', request.url);
  const target = request.nextUrl.pathname + request.nextUrl.search;
  url.searchParams.set('next', target);
  const response = NextResponse.redirect(url);
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

export async function proxy(request) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  if (isAccessFresh(access)) {
    return NextResponse.next();
  }

  // access-токена нет или он вот-вот истечёт - пробуем обновить по refresh
  const pair = await refreshTokens(request.cookies.get(REFRESH_COOKIE)?.value);
  if (!pair) {
    return toLogin(request);
  }

  // новые куки нужны и браузеру (Set-Cookie), и текущему рендеру -
  // поэтому подменяем их ещё и в заголовках самого запроса
  request.cookies.set(ACCESS_COOKIE, pair.accessToken);
  request.cookies.set(REFRESH_COOKIE, pair.refreshToken);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(accessCookie(pair));
  response.cookies.set(refreshCookie(pair));
  return response;
}

// proxy срабатывает только на закрытых страницах
export const config = {
  matcher: ['/students/:path*', '/profile/:path*'],
};
