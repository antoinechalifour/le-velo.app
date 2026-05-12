import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  bulkPutItineraries,
  deleteItinerary,
  listItineraries,
  putItinerary,
} from './db'
import type { SavedItinerary } from './types'

const LIST_KEY = ['itineraries'] as const

export function useSavedItineraries() {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: listItineraries,
    staleTime: Infinity,
  })
}

export function useSaveItinerary() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (it: SavedItinerary) => putItinerary(it),
    onSuccess: () => qc.invalidateQueries({ queryKey: LIST_KEY }),
  })
}

export function useDeleteItinerary() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteItinerary(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: LIST_KEY }),
  })
}

export function useImportItineraries() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (list: SavedItinerary[]) => bulkPutItineraries(list),
    onSuccess: () => qc.invalidateQueries({ queryKey: LIST_KEY }),
  })
}
