const CHECK_INTERVAL = 5000

export function watchStudentsVersion(search, onVersion) {
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
          onVersion(current.version)
        }
      }
    } catch {
    } finally {
      if (!controller.signal.aborted) {
        timer = setTimeout(checkVersion, CHECK_INTERVAL)
      }
    }
  }

  checkVersion()
  
  return () => {
    controller.abort()
    clearTimeout(timer)
  }
}
