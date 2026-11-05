import { Observable, concat, distinctUntilChanged, of, switchMap, timer } from 'rxjs'

import { errorText } from './errors.js'

function studentUrl(query) {
  const params = new URLSearchParams()

  for (const [name, value] of Object.entries(query)) {
    if (value !== '' && value !== null && value !== undefined) {
      params.set(name, String(value))
    }
  }

  return '/api/students?' + params.toString()
}

function studentRequest(query, authFetch) {
  return new Observable((observer) => {
    const controller = new AbortController()

    async function loadStudents() {
      try {
        const response = await authFetch(studentUrl(query), { signal: controller.signal })

        if (!response.ok) {
          throw new Error('ошибка загрузона:' + response.status + '. ' + await errorText(response))
        }

        const data = await response.json()
        observer.next({ loading: false, data, error: '' })
        observer.complete()
      }
      catch (error) {
        if (error.name !== 'AbortError') {
          const message = error instanceof TypeError ? 'связи нет, связь брат' : error.message
          observer.next({ loading: false, data: null, error: message })
          observer.complete()
        }
      }
    }

    loadStudents()

    // поиск новый - старый запрос всё, пока
    return () => controller.abort()
  })
}

export function studentListStream(query$, authFetch) {
  return query$.pipe(
    // одно и то же не дёргаем, после ввода чуток ждём
    distinctUntilChanged((first, second) => JSON.stringify(first) === JSON.stringify(second)),
    switchMap((query) => {
      return concat(
        of({ loading: true, data: null, error: '' }),
        timer(250).pipe(switchMap(() => {
          return studentRequest(query, authFetch)
        }))
      )
    })
  )
}
