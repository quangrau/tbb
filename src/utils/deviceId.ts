import { DEVICE_ID_KEY } from './constants'

/**
 * Gets or creates a persistent device ID stored in localStorage
 * Used for anonymous identity in MVP
 */
export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
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
