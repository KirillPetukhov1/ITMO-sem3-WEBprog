import { useEffect } from 'react'

import { session } from '../app/services.js'

export function AuthProvider({ children }) {
  useEffect(() => {
    void session.restore()
  }, [])
  return children
}
