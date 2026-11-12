let env = import.meta.env
if (!env) {
  env = {}
}
let apiBaseUrl = env.VITE_API_BASE_URL
if (!apiBaseUrl) {
  apiBaseUrl = ''
}
let pollInterval = Number(env.VITE_POLL_INTERVAL_MS)
if (!pollInterval) {
  pollInterval = 5000
}
pollInterval = Math.max(1000, pollInterval)

export const config = Object.freeze({
  apiBaseUrl,
  pollInterval,
  searchDelay: 300,
  requestTimeout: 15000
})
