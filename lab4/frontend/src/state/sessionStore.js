import { createStore } from 'zustand/vanilla';

export const sessionStore = createStore(() => ({
  tokens: null,
  user: null,
  restoring: true,
  sessionMessage: '',
  userMessage: '',
  generation: 0,
}));
