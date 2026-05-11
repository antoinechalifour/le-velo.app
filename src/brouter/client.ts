import ky from 'ky'
import type { LngLat } from '../geo/lngLat'
import { buildElevationProfile } from '../route/elevation'
import type { RoutingProfile } from '../route/profile'
import type { RouteResult } from '../route/route'
import { buildSegments } from '../route/segments'
import { parseStats } from './parse'
import { brouterResponseSchema } from './types'
import { buildBrouterUrl } from './url'

async function fetchSingleRoute(
  points: LngLat[],
  profile: RoutingProfile,
  alternativeIdx: number,
): Promise<RouteResult> {
  const url = buildBrouterUrl(points, profile, 'geojson', alternativeIdx)
  const json = await ky.get(url).json()
  const geojson = brouterResponseSchema.parse(json)
  const feature = geojson.features[0]
  const props = feature?.properties ?? {}
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
    rawGpxUrl: buildBrouterUrl(points, profile, 'gpx', alternativeIdx),
  }
}

export async function fetchRoutes(
  points: LngLat[],
  profile: RoutingProfile,
): Promise<RouteResult[]> {
  if (points.length < 2) {
    throw new Error('Au moins deux points sont nécessaires')
  }
  // Fetch up to 3 alternatives in parallel. BRouter may not always return one
  // for every index — failures are filtered out so we keep what's available.
  const indices = [0, 1, 2]
  const settled = await Promise.allSettled(
    indices.map((idx) => fetchSingleRoute(points, profile, idx)),
  )
  const results: RouteResult[] = []
  for (const s of settled) {
    if (s.status === 'fulfilled') results.push(s.value)
  }
  if (results.length === 0) {
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
