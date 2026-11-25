'use server'

import { redirect, unstable_rethrow } from 'next/navigation'
import { backendFetch } from '../backend.js'
import { ApiError, getErrorMessage } from '../errors.js'
import { clearTokens, getRefreshToken, saveTokens } from '../session.js'
const USERNAME = /^[A-Za-z0-9_.-]{3,50}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function text(value) {
  return typeof value === 'string' ? value : ''
}

function passwordTooLong(password) {
  return new TextEncoder().encode(password).length > 72
}

function safeNext(value) {
  if (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//')
  ) {
    return value
  }

  return '/profile'
}

export async function loginAction(values) {
  const username = text(values?.username).trim()
  const password = text(values?.password)
  if (
    !username ||
    username.length > 50 ||
    !password ||
    passwordTooLong(password)
  ) {
    return {
      error: 'Неверный логин или пароль.',
    }
  }

  try {
    const pair = await backendFetch('/api/auth/login', {
      method: 'POST',
      body: {
        username,
        password,
      },
    })
    await saveTokens(pair)
  } catch (error) {
    unstable_rethrow(error)

    return {
      error: getErrorMessage(error),
    }
  }
  redirect(safeNext(values?.next))
}

export async function registerAction(values) {
  const username = text(values?.username).trim()
  const email = text(values?.email).trim()
  const password = text(values?.password)
  const details = {}
  if (!USERNAME.test(username)) {
    details.username = ['3-50 символов: латиница, цифры и . _ -']
  }

  if (email.length > 254 || !EMAIL.test(email)) {
    details.email = ['Некорректный email.']
  }

  if (password.length < 8 || passwordTooLong(password)) {
    details.password = ['От 8 символов и не более 72 байт UTF-8.']
  }

  try {
    if (Object.keys(details).length > 0) {
      throw new ApiError('Проверьте данные.', 422, 'VALIDATION_ERROR', details)
    }

    await backendFetch('/api/auth/register', {
      method: 'POST',
      body: {
        username,
        email,
        password,
      },
    })

    return {
      ok: true,
    }
  } catch (error) {
    return {
      error: getErrorMessage(error),
    }
  }
}

export async function logoutAction() {
  const refreshToken = await getRefreshToken()
  if (refreshToken) {
    try {
      await backendFetch('/api/auth/logout', {
        method: 'POST',
        body: {
          refreshToken,
        },
      })
    } catch {}
  }

  await clearTokens()
  redirect('/login')
}
