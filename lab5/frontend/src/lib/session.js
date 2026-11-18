import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookie,
  refreshCookie,
  refreshTokens,
  userFromAccess,
} from './tokens.js';

// сессия текущего запроса. cache() — чтобы layout и page не читали куки дважды
export const getSession = cache(async () => {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  const user = userFromAccess(token);
  if (!user) {
    return null;
  }
  return { token, user };
});

// для серверных компонентов: proxy уже не пустил бы сюда без куки,
// но страница сама тоже проверяет — proxy не единственная защита
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function saveTokens(pair) {
  const store = await cookies();
  store.set(accessCookie(pair));
  store.set(refreshCookie(pair));
}

export async function clearTokens() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getRefreshToken() {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value;
}

const isExpired = (error) => error?.status === 401;

// чтение данных в серверном компоненте: куки тут менять нельзя,
// поэтому при протухшем токене уводим на route handler, который их почистит
export async function readAuthorized(load) {
  const session = await requireSession();
  try {
    return await load(session.token);
  } catch (error) {
    if (isExpired(error)) {
      redirect('/session-expired');
    }
    throw error;
  }
}

// для server actions: тут куки менять можно, так что при 401
// пробуем обновить пару токенов и повторить запрос один раз
export async function actAuthorized(action) {
  const session = await getSession();
  if (session) {
    try {
      return await action(session.token, session.user);
    } catch (error) {
      if (!isExpired(error)) {
        throw error;
      }
    }
  }
  const pair = await refreshTokens(await getRefreshToken());
  if (!pair) {
    await clearTokens();
    redirect('/login?expired=1');
  }
  await saveTokens(pair);
  return action(pair.accessToken, userFromAccess(pair.accessToken));
}
