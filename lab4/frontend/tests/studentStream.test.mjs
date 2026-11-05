import test from 'node:test'
import assert from 'node:assert/strict'
import { Subject } from 'rxjs'
import { studentListStream } from '../src/api/studentStream.js'

function wait(ms)
{
  return new Promise((resolve) => setTimeout(resolve, ms))
}

test('новый поиск отменяет старый запрос и показывает только новые данные', async () =>
{
  const query$ = new Subject()
  const requests = []
  const states = []

  function authFetch(url, options)
  {
    requests.push({ url, signal: options.signal })

    return new Promise((resolve, reject) =>
    {
      options.signal.addEventListener('abort', () =>
      {
        const error = new Error('отменено')
        error.name = 'AbortError'
        reject(error)
      })

      if (url.includes('second'))
      {
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ results: [{ fullName: 'second' }], total_pages: 1 })
        }), 10)
      }
    })
  }

  const subscription = studentListStream(query$, authFetch).subscribe((state) => states.push(state))

  query$.next({ page: 1, fullName: 'first' })
  await wait(300)
  query$.next({ page: 1, fullName: 'second' })
  await wait(300)

  assert.equal(requests.length, 2)
  assert.equal(requests[0].signal.aborted, true)
  assert.equal(states.at(-1).data.results[0].fullName, 'second')
  subscription.unsubscribe()
})
