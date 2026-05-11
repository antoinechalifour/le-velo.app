import { queryOptions, useQuery } from '@tanstack/react-query'
import type { LngLat } from '../geo/lngLat'

function getCurrentPosition(signal: AbortSignal): Promise<LngLat> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Géolocalisation non disponible'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (signal.aborted) return
        resolve({ lng: pos.coords.longitude, lat: pos.coords.latitude })
      },
      (err) => {
        if (signal.aborted) return
        reject(new Error(err.message))
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    )
  })
}

export function geolocationQueryOptions() {
  return queryOptions({
    queryKey: ['geolocation'],
    queryFn: ({ signal }) => getCurrentPosition(signal),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useGeolocation({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ ...geolocationQueryOptions(), enabled })
}
