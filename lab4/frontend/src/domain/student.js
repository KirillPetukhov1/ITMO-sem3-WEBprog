import { ApiError } from '../shared/errors.js'

export const studentFields = [
  'isuId',
  'fullName',
  'group',
  'dormitory',
  'room',
  'settlementDate',
  'isForeigner',
  'notes'
]
const ranges = {
  isuId: [100000, 999999],
  dormitory: [1, 99],
  room: [1, 9999],
  page: [1, 2147483647],
  page_size: [1, 100]
}

function invalid(field, message) {
  throw new ApiError('Проверьте введенные данные', 422, 'VALIDATION_ERROR', {
    [field]: [message]
  })
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }
  const date = new Date(value + 'T00:00:00Z')
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function validateText(field, value, filter) {
  let min = 0
  let max = 500
  if (field === 'fullName') {
    min = 5
    max = 100
  }
  if (filter) {
    min = 1
  }
  if (typeof value !== 'string' || value.length < min || value.length > max) {
    invalid(field, `Длина от ${min} до ${max} символов`)
  }
}

function validate(field, value, filter = false) {
  if (ranges[field]) {
    const [min, max] = ranges[field]
    if (!Number.isInteger(value) || value < min || value > max) {
      invalid(field, `Ожидается целое число от ${min} до ${max}.`)
    }
    return
  }

  switch (field) {
    case 'isForeigner':
      if (typeof value !== 'boolean') {
        invalid(field, 'Ожидается логическое значение')
      }
      return
    case 'settlementDate':
      if (!validDate(value) || (!filter && value < '2000-01-01')) {
        invalid(field, 'Некорректная дата')
      }
      return
    case 'group':
      if (typeof value !== 'string' || !/^[A-Z][0-9]{4}$/.test(value)) {
        invalid(field, 'Ожидается заглавная латинская буква и 4 цифры')
      }
      return
    case 'fullName':
    case 'notes':
      validateText(field, value, filter)
      return
  }
}

export function studentDto(values, patch = false) {
  if (patch && Object.hasOwn(values, 'isuId')) {
    invalid('isuId', 'ИСУ нельзя изменять')
  }
  const dto = {}
  for (const field of studentFields) {
    if (patch && field === 'isuId') {
      continue
    }
    if (!Object.hasOwn(values, field)) {
      if (patch || field === 'notes') {
        continue
      }
      invalid(field, 'Обязательное поле')
    }
    let value
    if (typeof values[field] === 'string') {
      value = values[field].trim()
    } else {
      value = values[field]
    }
    validate(field, value)
    dto[field] = value
  }
  return dto
}

function validateSearchField(field, value) {
  if (field === 'sortBy') {
    if (!studentFields.includes(value)) {
      invalid(field, 'Неизвестное поле сортировки')
    }
    return
  }
  if (field === 'order') {
    if (!['asc', 'desc'].includes(value)) {
      invalid(field, 'Ожидается asc или desc')
    }
    return
  }
  validate(field, value, true)
}

export function searchDto(values = {}) {
  const dto = {}
  for (const field of [...studentFields, 'sortBy', 'order', 'page', 'page_size']) {
    let value = values[field]
    if (value === undefined || value === '') {
      continue
    }
    if (typeof value === 'string') {
      value = value.trim()
    }
    if (value === '') {
      continue
    }
    if (ranges[field] && typeof value === 'string' && /^\d+$/.test(value)) {
      value = Number(value)
    }
    if (field === 'isForeigner' && ['true', 'false'].includes(value)) {
      value = value === 'true'
    }
    validateSearchField(field, value)
    dto[field] = value
  }
  return dto
}

export function studentFromDto(dto) {
  if (!dto || typeof dto !== 'object') {
    throw new ApiError('Некорректный студент', 0, 'INVALID_RESPONSE')
  }
  try {
    for (const field of studentFields) {
      validate(field, dto[field])
    }
  } catch {
    throw new ApiError('Некорректный студент в ответе', 0, 'INVALID_RESPONSE')
  }
  return Object.fromEntries(studentFields.map((field) => [field, dto[field]]))
}

export function pageFromDto(dto) {
  if (
    !dto ||
    !Array.isArray(dto.results) ||
    !Number.isInteger(dto.count) ||
    dto.count < 0 ||
    !Number.isInteger(dto.page) ||
    dto.page < 1 ||
    !Number.isInteger(dto.total_pages) ||
    dto.total_pages < 1
  ) {
    throw new ApiError('Некорректная страница', 0, 'INVALID_RESPONSE')
  }
  return {
    count: dto.count,
    page: dto.page,
    page_size: dto.page_size,
    total_pages: dto.total_pages,
    next: dto.next,
    previous: dto.previous,
    results: dto.results.map(studentFromDto)
  }
}
