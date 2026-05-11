import type { LngLat } from '../geo/lngLat'

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search'

export type NominatimResult = {
  point: LngLat
  label: string
  shortLabel: string
}

type NominatimRow = {
  lat: string
  lon: string
  display_name: string
  name?: string
  address?: Record<string, string>
}

export async function searchAddress(
  query: string,
  signal?: AbortSignal,
): Promise<NominatimResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '6',
    countrycodes: 'fr',
    'accept-language': 'fr',
  })
  const res = await fetch(`${NOMINATIM_BASE}?${params.toString()}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Nominatim ${res.status}`)
  }
  const rows = (await res.json()) as NominatimRow[]
  return rows.map(toResult)
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
