import { useMemo } from 'react'
import { getDeviceId } from '../utils/deviceId'

/**
 * React hook that provides a persistent device ID
 * The ID is generated once and stored in localStorage
 */
export function useDeviceId(): string {
  const deviceId = useMemo(() => getDeviceId(), [])
  return deviceId
}
