import { queryOptions } from '@tanstack/react-query'
import type { LngLat } from '../geo/lngLat'
import { reverseGeocode, searchAddress } from './client'

export function nominatimSearchQueryOptions(query: string) {
  const trimmed = query.trim()
  return queryOptions({
    queryKey: ['nominatim', trimmed],
    queryFn: ({ signal }) => searchAddress(trimmed, signal),
    enabled: trimmed.length >= 3,
    staleTime: 1000 * 60 * 10,
  })
}

function roundCoord(n: number): number {
  return Math.round(n * 1e5) / 1e5
}

export function nominatimReverseQueryOptions(point: LngLat | null) {
  const lat = point ? roundCoord(point.lat) : 0
  const lng = point ? roundCoord(point.lng) : 0
  return queryOptions({
    queryKey: ['nominatim-reverse', lat, lng],
    queryFn: ({ signal }) => reverseGeocode({ lat, lng }, signal),
    enabled: point !== null,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  })
}
