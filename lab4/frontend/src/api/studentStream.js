import { Observable, concat, distinctUntilChanged, of, switchMap, timer } from 'rxjs'

import { getErrorMessage } from './httpClient.js'
import { listStudents } from './studentsApi.js'

function studentRequest(query, authFetch) {
  return new Observable((observer) => {
    const controller = new AbortController()

    async function loadStudents() {
      try {
        const data = await listStudents(query, authFetch, controller.signal)
        observer.next({ loading: false, data, error: '' })
        observer.complete()
      }
      catch (error) {
        if (error.name !== 'AbortError') {
          const message = getErrorMessage(error)
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
