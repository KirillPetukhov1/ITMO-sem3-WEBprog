import { useStore } from 'zustand'
import { sessionStore } from '../state/sessionStore.js'
import { session } from '../app/services.js'
const setSessionMessage = (sessionMessage) =>
  sessionStore.setState({
    sessionMessage
  })

export function useAuth() {
  const state = useStore(sessionStore)
  return {
    ...state,
    signIn: session.signIn,
    signOut: session.signOut,
    setSessionMessage
  }
}
