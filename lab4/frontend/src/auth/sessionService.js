import { userFromToken } from '../domain/user.js';
import { ApiError } from '../shared/errors.js';

const STORAGE_KEY = 'students.session.v1';
const EXPIRED_MESSAGE = 'Сессия истекла. Войдите снова';

function validateTokens(tokens) {
  if (
    !tokens?.accessToken ||
    typeof tokens.refreshToken !== 'string' ||
    !tokens.refreshToken ||
    tokens.refreshToken.length > 200
  ) {
    throw new ApiError('Некорректная пара токенов', 0, 'INVALID_TOKEN');
  }
}

export function createSessionService(store, api, storage) {
  let refreshing = null;
  let restoration = null;
  let closing = false;

  function persist(tokens) {
    try {
      if (tokens) {
        storage?.setItem(STORAGE_KEY, JSON.stringify(tokens));
      } else {
        storage?.removeItem(STORAGE_KEY);
      }
    } catch {}
  }

  function accept(tokens, newSession = true) {
    validateTokens(tokens);
    const user = userFromToken(tokens.accessToken);
    store.setState((state) => {
      let generation = state.generation;
      if (newSession) {
        generation += 1;
      }
      return {
        tokens,
        user,
        userMessage: '',
        sessionMessage: '',
        generation,
      };
    });
    persist(tokens);
  }

  function clear(message = '') {
    persist(null);
    store.setState((state) => ({
      tokens: null,
      user: null,
      sessionMessage: message,
      generation: state.generation + 1,
    }));
  }

  async function performRefresh(entry, refreshToken) {
    try {
      const tokens = await api.refresh(refreshToken);
      if (store.getState().generation !== entry.generation) {
        throw new DOMException('Сессия изменена', 'AbortError');
      }
      accept(tokens, false);
      return tokens;
    } catch (error) {
      if (
        store.getState().generation === entry.generation &&
        ['INVALID_REFRESH_TOKEN', 'INVALID_TOKEN'].includes(error.code)
      ) {
        clear(EXPIRED_MESSAGE);
      }
      throw error;
    } finally {
      if (refreshing === entry) {
        refreshing = null;
      }
    }
  }

  function refresh() {
    if (closing) {
      return Promise.reject(new DOMException('Выход из системы', 'AbortError'));
    }
    const state = store.getState();
    if (refreshing?.generation === state.generation) {
      return refreshing.promise;
    }
    if (!state.tokens) {
      return Promise.reject(new ApiError('Нет сессии.', 401, 'UNAUTHORIZED'));
    }
    const entry = {
      generation: state.generation,
    };
    entry.promise = performRefresh(entry, state.tokens.refreshToken);
    refreshing = entry;
    return entry.promise;
  }

  function handleRestoreError(error) {
    if (error instanceof SyntaxError || error.code === 'INVALID_TOKEN') {
      clear('Войдите снова.');
      return;
    }
    if (error.name !== 'AbortError') {
      store.setState({
        sessionMessage: 'Не удалось восстановить сессию. Проверьте подключение или войдите снова',
      });
    }
  }

  async function restoreSavedSession() {
    try {
      const saved = storage?.getItem(STORAGE_KEY);
      if (saved) {
        accept(JSON.parse(saved));
        await refresh();
      }
    } catch (error) {
      handleRestoreError(error);
    } finally {
      store.setState({
        restoring: false,
      });
    }
  }

  async function restore() {
    if (!restoration) {
      restoration = restoreSavedSession();
    }
    return restoration;
  }

  async function waitForRefresh(pending) {
    if (!pending) {
      return;
    }
    try {
      await pending;
    } catch {}
  }

  function handleLogoutError(error) {
    let sessionMessage = 'Локальный выход выполнен. Сервер не подтвердил отзыв refresh-токена';
    if (error.code === 'INVALID_REFRESH_TOKEN') {
      sessionMessage = '';
    }
    store.setState({
      sessionMessage,
    });
  }

  async function signOut() {
    if (closing) {
      return;
    }
    closing = true;
    store.setState({
      restoring: true,
    });
    const pending = refreshing?.promise;
    const original = store.getState().tokens;

    try {
      await waitForRefresh(pending);
      let token = store.getState().tokens?.refreshToken;
      if (!token) {
        token = original?.refreshToken;
      }
      clear();
      if (token) {
        await api.logout(token);
      }
    } catch (error) {
      handleLogoutError(error);
    } finally {
      clear(store.getState().sessionMessage);
      closing = false;
      store.setState({
        restoring: false,
      });
    }
  }

  function tokens() {
    if (closing) {
      return null;
    }
    return store.getState().tokens;
  }
  return {
    accept,
    clear,
    refresh,
    restore,
    signOut,
    tokens,
    generation: () => store.getState().generation,
    expire: () => clear(EXPIRED_MESSAGE),
  };
}
