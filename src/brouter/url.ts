import type { LngLat } from '../geo/lngLat'

const BROUTER_BASE = 'https://brouter.de/brouter'

export type BrouterFormat = 'geojson' | 'gpx'

export function buildBrouterUrl(
  points: LngLat[],
  profile: string,
  format: BrouterFormat,
  alternativeIdx = 0,
): string {
  const lonlats = points.map((p) => `${p.lng},${p.lat}`).join('|')
  const params = new URLSearchParams({
    lonlats,
    profile,
    alternativeidx: String(alternativeIdx),
    format,
  })
  return `${BROUTER_BASE}?${params.toString()}`
}
