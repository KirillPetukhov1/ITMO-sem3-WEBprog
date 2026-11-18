import { ApiError } from '../../shared/errors.js';

function checkRequestSession(options, session, generation) {
  options.signal?.throwIfAborted();
  if (generation !== session.generation()) {
    throw new DOMException('Сессия изменена', 'AbortError');
  }
}
async function sendWithToken(request, path, options, accessToken) {
  return request(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
async function retryAuthorizedRequest(request, path, options, session, generation, token) {
  let next = session.tokens();
  if (next?.accessToken === token) {
    next = await session.refresh();
  }
  checkRequestSession(options, session, generation);
  try {
    const data = await sendWithToken(request, path, options, next.accessToken);
    checkRequestSession(options, session, generation);
    return data;
  } catch (error) {
    checkRequestSession(options, session, generation);
    if (error.status === 401 && error.code === 'UNAUTHORIZED') {
      session.expire();
    }
    throw error;
  }
}

export function createAuthorizedClient(request, session) {
  return async function authorizedRequest(path, options = {}) {
    const generation = session.generation();
    const token = session.tokens()?.accessToken;
    if (!token) {
      throw new ApiError('Войдите в систему', 401, 'UNAUTHORIZED');
    }
    try {
      const data = await sendWithToken(request, path, options, token);
      checkRequestSession(options, session, generation);
      return data;
    } catch (error) {
      checkRequestSession(options, session, generation);
      if (error.status !== 401 || error.code !== 'UNAUTHORIZED') {
        throw error;
      }
    }
    return retryAuthorizedRequest(request, path, options, session, generation, token);
  };
}
