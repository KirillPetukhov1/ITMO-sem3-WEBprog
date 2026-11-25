'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function StudentsFreshnessNotice({ search, version }) {
  const router = useRouter()
  const [stale, setStale] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    const controller = new AbortController()
    let timer

    async function checkVersion() {
      try {
        const response = await fetch('/students/version?' + search, {
          cache: 'no-store',
          redirect: 'error',
          signal: controller.signal,
        })
        if (response.ok) {
          const current = await response.json()
          if (!controller.signal.aborted) {
            setStale(current.version !== version)
          }
        }
      } catch {
      } finally {
        if (!controller.signal.aborted) {
          timer = setTimeout(checkVersion, 5000)
        }
      }
    }

    checkVersion()

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [search, version])

  if (!stale) {
    return null
  }

  return (
    <div className="alert alert-warning d-flex align-items-center gap-3">
      <span role="status">Данные студентов изменились</span>
      <button
        type="button"
        className="btn btn-sm btn-outline-dark"
        disabled={pending}
        onClick={() => startTransition(() => router.refresh())}
      >
        {pending ? 'Обновляем…' : 'Обновить'}
      </button>
    </div>
  )
}
