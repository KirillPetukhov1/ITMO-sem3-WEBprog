import { useEffect, useMemo, useState } from 'react'
import { useStore } from 'zustand'
import { BehaviorSubject, Observable } from 'rxjs'

import { config } from '../config.js'
import { resourceStream } from '../features/students/resourceStream.js'
import { studentChanges } from '../features/students/studentEvents.js'
import { studentsStore, emptyResource, writeResource, removeResource } from '../state/studentsStore.js'
import { sessionStore } from '../state/sessionStore.js'
import { getErrorMessage } from '../shared/errors.js'

let sequence = 0
const active$ = new Observable((subscriber) => {
  function emitSession(state) {
    if (!state.tokens || state.restoring) {
      subscriber.next(0)
      return
    }
    subscriber.next(state.generation + 1)
  }
  emitSession(sessionStore.getState())
  return sessionStore.subscribe(emitSession)
})

function getResource(state, key) {
  const resource = state.resources[key]
  if (resource) {
    return resource
  }
  return emptyResource
}

function applyResourceError(key, error) {
  const patch = {
    loading: false,
    refreshing: false,
    error: getErrorMessage(error),
    code: error.code
  }
  if (['STUDENT_NOT_FOUND', 'ACCESS_DENIED', 'UNAUTHORIZED'].includes(error.code)) {
    patch.data = null
  }
  writeResource(key, patch)
}

function applyResourceEvent(key, event) {
  switch (event.kind) {
    case 'clear':
      removeResource(key)
      return
    case 'query':
      writeResource(key, {
        ...emptyResource
      })
      return
    case 'loading': {
      const current = getResource(studentsStore.getState(), key)
      writeResource(key, {
        loading: current.data === null,
        refreshing: current.data !== null,
        error: '',
        code: ''
      })
      return
    }
    case 'data':
      writeResource(key, {
        data: event.data,
        loading: false,
        refreshing: false,
        error: '',
        code: ''
      })
      return
    case 'error':
      applyResourceError(key, event.error)
      return
  }
}

export default function useStudentResource(query, load) {
  const key = useMemo(() => `resource-${++sequence}`, [])
  const [query$] = useState(() => new BehaviorSubject(query))
  const state = useStore(studentsStore, (value) => getResource(value, key))
  useEffect(() => {
    const events$ = resourceStream({
      query$,
      active$,
      changes$: studentChanges,
      load,
      pollInterval: config.pollInterval,
      searchDelay: config.searchDelay
    })
    const subscription = events$.subscribe((event) => applyResourceEvent(key, event))
    return () => {
      subscription.unsubscribe()
      removeResource(key)
    }
  }, [key, query$, load])
  useEffect(() => {
    query$.next(query)
  }, [query$, query])
  return state
}
