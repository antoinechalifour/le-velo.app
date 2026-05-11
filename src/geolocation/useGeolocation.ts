import { useEffect, useState } from 'react'
import type { LngLat } from '../geo/lngLat'

type GeolocationState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'ready'; position: LngLat }
  | { status: 'error'; reason: string }

function initialState(): GeolocationState {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return { status: 'error', reason: 'Géolocalisation non disponible' }
  }
  return { status: 'pending' }
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>(initialState)

  useEffect(() => {
    if (state.status !== 'pending') return
    let cancelled = false
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
  }, [state.status])

  return state
}
