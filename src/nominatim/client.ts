import ky from 'ky'
import { z } from 'zod'
import type { LngLat } from '../geo/lngLat'

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search'
const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse'

export type NominatimResult = {
  point: LngLat
  label: string
  shortLabel: string
}

const nominatimRowSchema = z.object({
  lat: z.string(),
  lon: z.string(),
  display_name: z.string(),
  name: z.string().optional(),
  address: z.record(z.string(), z.string()).optional(),
})

const nominatimSearchSchema = z.array(nominatimRowSchema)

const nominatimReverseSchema = z.union([
  nominatimRowSchema,
  z.object({ error: z.string() }),
])

type NominatimRow = z.infer<typeof nominatimRowSchema>

export async function searchAddress(
  query: string,
  signal?: AbortSignal,
): Promise<NominatimResult[]> {
  const json = await ky
    .get(NOMINATIM_BASE, {
      signal,
      searchParams: {
        q: query,
        format: 'jsonv2',
        addressdetails: '1',
        limit: '6',
        countrycodes: 'fr',
        'accept-language': 'fr',
      },
    })
    .json()
  const rows = nominatimSearchSchema.parse(json)
  return rows.map(toResult)
}

export async function reverseGeocode(
  point: LngLat,
  signal?: AbortSignal,
): Promise<NominatimResult | null> {
  const json = await ky
    .get(NOMINATIM_REVERSE, {
      signal,
      searchParams: {
        lat: point.lat.toString(),
        lon: point.lng.toString(),
        format: 'jsonv2',
        addressdetails: '1',
        zoom: '14',
        'accept-language': 'fr',
      },
    })
    .json()
  const parsed = nominatimReverseSchema.parse(json)
  if ('error' in parsed) return null
  return toResult(parsed)
}

function toResult(row: NominatimRow): NominatimResult {
  const lat = Number(row.lat)
  const lng = Number(row.lon)
  return {
    point: { lat, lng },
    label: row.display_name,
    shortLabel: buildShortLabel(row),
  }
}

function buildShortLabel(row: NominatimRow): string {
  const a = row.address ?? {}
  const locality = a.city ?? a.town ?? a.village ?? a.municipality ?? a.county
  const street = [a.house_number, a.road].filter(Boolean).join(' ')
  const primary =
    row.name ||
    street ||
    a.suburb ||
    a.neighbourhood ||
    locality ||
    row.display_name.split(',')[0]
  if (locality && primary && primary !== locality) {
    return `${primary}, ${locality}`
  }
  return primary
}
