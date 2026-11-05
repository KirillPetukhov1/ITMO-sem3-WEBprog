import { useEffect, useMemo, useState } from 'react'
import { Subject } from 'rxjs'
import { studentListStream } from '../api/studentStream.js'

export default function useStudentList(query, authFetch)
{
  const query$ = useMemo(() => new Subject(), [])
  const [state, setState] = useState({ loading: true, data: null, error: '' })

  useEffect(() =>
  {
    // слушаем поток, ушли со страницы — больше не слушаем
    const subscription = studentListStream(query$, authFetch).subscribe(setState)
    return () => subscription.unsubscribe()
  }, [query$, authFetch])

  useEffect(() =>
  {
    // фильтры поменялись, кидаем их в поток
    query$.next(query)
  }, [query$, query])

  return state
}
