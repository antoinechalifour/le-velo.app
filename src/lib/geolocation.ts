import { useEffect, useState } from 'react'
import type { LngLat } from '../types'

type GeolocationState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'ready'; position: LngLat }
  | { status: 'error'; reason: string }

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' })

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'error', reason: 'Géolocalisation non disponible' })
      return
    }
    let cancelled = false
    setState({ status: 'pending' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return
        setState({
          status: 'ready',
          position: { lng: pos.coords.longitude, lat: pos.coords.latitude },
        })
      },
      (err) => {
        if (cancelled) return
        setState({ status: 'error', reason: err.message })
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    )
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
