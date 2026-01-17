import { DEVICE_ID_KEY } from './constants'

/**
 * Generates a UUID v4
 * Uses crypto.randomUUID() if available (secure context),
 * otherwise falls back to a manual implementation
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for non-secure contexts (HTTP)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Gets or creates a persistent device ID stored in localStorage
 * Used for anonymous identity in MVP
 */
export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = generateUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

/**
 * Clears the device ID from localStorage
 * Useful for testing or resetting identity
 */
export function clearDeviceId(): void {
  localStorage.removeItem(DEVICE_ID_KEY)
}
