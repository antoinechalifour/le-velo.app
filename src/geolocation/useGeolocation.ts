import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import type { LngLat } from '../geo/lngLat'
import { userLocationAtom } from '../state/userLocation'

type Setter = (loc: LngLat) => void

let watchId: number | null = null
const setters = new Set<Setter>()

function start() {
  if (watchId !== null) return
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const loc: LngLat = {
        lng: pos.coords.longitude,
        lat: pos.coords.latitude,
      }
      for (const s of setters) s(loc)
    },
    () => {},
    { enableHighAccuracy: true, maximumAge: 5_000, timeout: 15_000 },
  )
}

function stop() {
  if (watchId === null) return
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    navigator.geolocation.clearWatch(watchId)
  }
  watchId = null
}

export function useStartGeolocationWatch() {
  const setUserLocation = useSetAtom(userLocationAtom)
  useEffect(() => {
    const setter: Setter = (loc) => setUserLocation(loc)
    setters.add(setter)
    if (setters.size === 1) start()
    return () => {
      setters.delete(setter)
      if (setters.size === 0) stop()
    }
  }, [setUserLocation])
}
