export const API_URL = (process.env.API_URL || 'http://localhost:8080').replace(
  /\/$/,
  '',
)

export const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true'

export const STUDENTS_REVALIDATE = Math.max(
  1,
  Number(process.env.STUDENTS_REVALIDATE) || 30,
)

export const REQUEST_TIMEOUT = 15000
