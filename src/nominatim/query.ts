import { queryOptions } from '@tanstack/react-query'
import { searchAddress } from './client'

export function nominatimSearchQueryOptions(query: string) {
  const trimmed = query.trim()
  return queryOptions({
    queryKey: ['nominatim', trimmed],
    queryFn: ({ signal }) => searchAddress(trimmed, signal),
    enabled: trimmed.length >= 3,
    staleTime: 1000 * 60 * 10,
  })
}
