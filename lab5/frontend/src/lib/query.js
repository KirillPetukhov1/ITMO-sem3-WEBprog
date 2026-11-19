export const FILTER_FIELDS = [
  'group',
  'isuId',
  'dormitory',
  'room',
  'settlementDate',
  'isForeigner',
  'notes',
]

export const QUERY_FIELDS = [
  'fullName',
  ...FILTER_FIELDS,
  'sortBy',
  'order',
  'page',
]

export const SORT_OPTIONS = [
  ['isuId', 'номер ИСУ'],
  ['fullName', 'ФИО'],
  ['group', 'группа'],
  ['dormitory', 'общага'],
  ['room', 'комната'],
  ['settlementDate', 'дата заселения'],
  ['isForeigner', 'иностранец'],
  ['notes', 'примечания'],
]

export function pickQuery(searchParams) {
  const get =
    typeof searchParams?.get === 'function'
      ? (key) => searchParams.get(key)
      : (key) => searchParams?.[key]
  const query = {}
  for (const field of QUERY_FIELDS) {
    let value = get(field)
    if (Array.isArray(value)) {
      value = value[0]
    }
    if (typeof value === 'string' && value.trim() !== '') {
      query[field] = value.trim()
    }
  }

  return query
}

export function queryString(query) {
  const params = new URLSearchParams()
  for (const field of QUERY_FIELDS) {
    const value = query[field]
    if (value !== undefined && value !== null && String(value) !== '') {
      params.set(field, String(value))
    }
  }
  if (params.get('page') === '1') params.delete('page')
  if (params.get('sortBy') === 'isuId') params.delete('sortBy')
  if (params.get('order') === 'asc') params.delete('order')

  return params.toString()
}

export function studentsHref(query) {
  const qs = queryString(query)

  return qs ? `/students?${qs}` : '/students'
}
