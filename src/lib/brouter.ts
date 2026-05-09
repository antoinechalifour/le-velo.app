import type { LngLat, RouteResult, RouteStats } from '../types'

const BROUTER_BASE = 'https://brouter.de/brouter'

type BrouterFormat = 'geojson' | 'gpx'

export function buildBrouterUrl(
  start: LngLat,
  end: LngLat,
  profile: string,
  format: BrouterFormat,
): string {
  const lonlats = `${start.lng},${start.lat}|${end.lng},${end.lat}`
  const params = new URLSearchParams({
    lonlats,
    profile,
    alternativeidx: '0',
    format,
  })
  return `${BROUTER_BASE}?${params.toString()}`
}

type BrouterMessage = [string, string, string, string, string, string, string]

type BrouterTrackProps = {
  creator?: string
  name?: string
  'track-length'?: string
  'filtered ascend'?: string
  'plain-ascend'?: string
  'total-time'?: string
  'total-energy'?: string
  cost?: string
  messages?: BrouterMessage[]
  times?: number[]
}

function parseStats(props: BrouterTrackProps): RouteStats {
  const distanceM = Number(props['track-length'] ?? 0)
  const ascentM = Number(props['filtered ascend'] ?? 0)
  const plainAscentM = Number(props['plain-ascend'] ?? 0)
  const descentM = Math.max(0, ascentM - plainAscentM)
  const durationS = Number(props['total-time'] ?? 0)
  return {
    distanceKm: distanceM / 1000,
    ascentM,
    descentM,
    durationMin: durationS / 60,
  }
}

export async function fetchRoute(
  start: LngLat,
  end: LngLat,
  profile = 'trekking',
): Promise<RouteResult> {
  const url = buildBrouterUrl(start, end, profile, 'geojson')
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`BRouter ${res.status}: ${text.slice(0, 200)}`)
  }
  const geojson = (await res.json()) as GeoJSON.FeatureCollection
  const feature = geojson.features?.[0]
  const props = (feature?.properties ?? {}) as BrouterTrackProps
  return {
    geojson,
    stats: parseStats(props),
    rawGpxUrl: buildBrouterUrl(start, end, profile, 'gpx'),
  }
}
