export function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    window.dispatchEvent(new CustomEvent('toolora:notice', { detail: 'Browser storage is unavailable. Your preference may not be saved.' }))
  }
}
