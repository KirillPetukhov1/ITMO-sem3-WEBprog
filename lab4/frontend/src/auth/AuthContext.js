import { useStore } from 'zustand';

import { sessionStore } from '../state/sessionStore.js';
import { session } from '../app/services.js';

const setSessionMessage = (sessionMessage) =>
  sessionStore.setState({
    sessionMessage,
  });

export function useAuth() {
  const state = useStore(sessionStore);
  return {
    ...state,
    setTokens: session.accept,
    signOut: session.signOut,
    setSessionMessage,
  };
}
