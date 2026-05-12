import { z } from 'zod'

const lngLatSchema = z.object({
  lng: z.number().finite(),
  lat: z.number().finite().min(-90).max(90),
})

const routePointSchema = z.object({
  point: lngLatSchema,
  label: z.string().nullable(),
})

const routeStatsSchema = z.object({
  distanceKm: z.number(),
  ascentM: z.number(),
  descentM: z.number(),
  durationMin: z.number(),
})

const profileSchema = z.enum(['fastbike', 'trekking', 'safety', 'shortest'])

export const savedItinerarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  points: z.array(routePointSchema).min(2),
  profile: profileSchema,
  stats: routeStatsSchema.nullable(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
})

export type SavedItinerary = z.infer<typeof savedItinerarySchema>

export const itinerariesExportSchema = z.object({
  version: z.literal(1),
  exportedAt: z.number().int().nonnegative(),
  itineraries: z.array(savedItinerarySchema),
})

export type ItinerariesExport = z.infer<typeof itinerariesExportSchema>
