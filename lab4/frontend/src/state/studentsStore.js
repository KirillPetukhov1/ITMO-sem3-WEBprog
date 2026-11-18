import { createStore } from 'zustand/vanilla';

export const emptyResource = Object.freeze({
  loading: true,
  refreshing: false,
  data: null,
  error: '',
  code: '',
});

export const studentsStore = createStore(() => ({ resources: {} }));

export function writeResource(key, patch) {
  studentsStore.setState((state) => {
    let current = state.resources[key];
    if (!current) {
      current = emptyResource;
    }
    const resource = { ...current, ...patch };
    return { resources: { ...state.resources, [key]: resource } };
  });
}

export function removeResource(key) {
  studentsStore.setState((state) => {
    const resources = { ...state.resources };
    delete resources[key];
    return { resources };
  });
}
