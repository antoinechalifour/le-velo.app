import type { FeatureCollection } from 'geojson'
import type {
  LngLat,
  RouteResult,
  RouteStats,
  RoutingProfile,
} from '../types'
import { buildSegments } from './segments'
import { buildElevationProfile } from './elevation'

const BROUTER_BASE = 'https://brouter.de/brouter'

type BrouterFormat = 'geojson' | 'gpx'

export function buildBrouterUrl(
  start: LngLat,
  end: LngLat,
  profile: string,
  format: BrouterFormat,
  alternativeIdx = 0,
): string {
  const lonlats = `${start.lng},${start.lat}|${end.lng},${end.lat}`
  const params = new URLSearchParams({
    lonlats,
    profile,
    alternativeidx: String(alternativeIdx),
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

async function fetchSingleRoute(
  start: LngLat,
  end: LngLat,
  profile: RoutingProfile,
  alternativeIdx: number,
): Promise<RouteResult> {
  const url = buildBrouterUrl(start, end, profile, 'geojson', alternativeIdx)
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`BRouter ${res.status}: ${text.slice(0, 200)}`)
  }
  const geojson = (await res.json()) as FeatureCollection
  const feature = geojson.features?.[0]
  const props = (feature?.properties ?? {}) as BrouterTrackProps
  const { segments, segmentsGeoJson, breakdown, surfaceBands } =
    buildSegments(geojson)
  const elevationProfile = buildElevationProfile(geojson)
  return {
    alternativeIdx,
    geojson,
    segmentsGeoJson,
    segments,
    breakdown,
    surfaceBands,
    elevationProfile,
    stats: parseStats(props),
    rawGpxUrl: buildBrouterUrl(start, end, profile, 'gpx', alternativeIdx),
  }
}

export async function fetchRoutes(
  start: LngLat,
  end: LngLat,
  profile: RoutingProfile,
): Promise<RouteResult[]> {
  // Fetch up to 3 alternatives in parallel. BRouter may not always return one
  // for every index — failures are filtered out so we keep what's available.
  const indices = [0, 1, 2]
  const settled = await Promise.allSettled(
    indices.map((idx) => fetchSingleRoute(start, end, profile, idx)),
  )
  const results: RouteResult[] = []
  for (const s of settled) {
    if (s.status === 'fulfilled') results.push(s.value)
  }
  if (results.length === 0) {
    // Surface the first failure so the UI can show an error.
    const firstReject = settled.find((s) => s.status === 'rejected')
    if (firstReject && firstReject.status === 'rejected') {
      throw firstReject.reason instanceof Error
        ? firstReject.reason
        : new Error(String(firstReject.reason))
    }
    throw new Error('Aucun itinéraire trouvé')
  }
  return results
}
