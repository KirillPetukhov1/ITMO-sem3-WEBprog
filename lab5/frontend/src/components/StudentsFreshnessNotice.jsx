'use client'

import { useEffect, useState, useTransition } from 'react'
import { watchStudentsVersion } from '../lib/client/watchStudentsVersion.js'
import { useRouter } from 'next/navigation'

export default function StudentsFreshnessNotice({ search, version }) {
  const router = useRouter()
  const [stale, setStale] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    return watchStudentsVersion(search, (currentVersion) => {
      setStale(currentVersion !== version)
    })
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
