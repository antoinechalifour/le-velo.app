import ky from 'ky'
import type { LngLat } from '../geo/lngLat'
import {
  DETOUR_VARIANTS,
  type DetourSide,
  geoDistanceKm,
  initialOffsetKm,
  offsetWaypoint,
} from '../route/detour'
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
  const json = await ky.get(url, { timeout: false }).json()
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

const DETOUR_MAX_ITER = 4
const DETOUR_TOLERANCE = 0.08 // ±8 % de la cible
const DETOUR_MIN_OFFSET_KM = 0.2

async function fetchDetourRoute(
  start: LngLat,
  end: LngLat,
  profile: RoutingProfile,
  targetKm: number,
  side: DetourSide,
): Promise<RouteResult> {
  const directKm = geoDistanceKm(start, end)
  let offsetKm = initialOffsetKm(directKm, targetKm)
  if (offsetKm < DETOUR_MIN_OFFSET_KM) {
    offsetKm = DETOUR_MIN_OFFSET_KM
  }

  let best: RouteResult | null = null
  let bestErr = Infinity
  for (let i = 0; i < DETOUR_MAX_ITER; i++) {
    const waypoint = offsetWaypoint(start, end, offsetKm, side)
    const route = await fetchSingleRoute([start, waypoint, end], profile, 0)
    const actualKm = route.stats.distanceKm
    const err = Math.abs(actualKm - targetKm) / targetKm
    if (err < bestErr) {
      best = route
      bestErr = err
    }
    if (err < DETOUR_TOLERANCE) break
    // Le réseau routier inflate l'offset → on rescale proportionnellement
    // mais sous-amorti pour éviter d'osciller.
    const ratio = targetKm / Math.max(actualKm, 0.1)
    const damped = 1 + (ratio - 1) * 0.7
    offsetKm = Math.max(DETOUR_MIN_OFFSET_KM, offsetKm * damped)
  }
  if (!best) throw new Error('Aucun itinéraire de détour trouvé')
  return best
}

export async function fetchRoutes(
  points: LngLat[],
  profile: RoutingProfile,
  minDistanceKm = 0,
): Promise<RouteResult[]> {
  if (points.length < 2) {
    throw new Error('Au moins deux points sont nécessaires')
  }

  // Mode "distance minimum" : uniquement supporté pour 2 points (A → B).
  // Génère plusieurs détours géométriques (côté gauche / droit) et itère
  // pour approcher la distance cible.
  if (minDistanceKm > 0 && points.length === 2) {
    const direct = geoDistanceKm(points[0], points[1])
    if (minDistanceKm > direct * 1.05) {
      const settled = await Promise.allSettled(
        DETOUR_VARIANTS.map((v) =>
          fetchDetourRoute(points[0], points[1], profile, minDistanceKm, v.side),
        ),
      )
      const results: RouteResult[] = []
      settled.forEach((s, idx) => {
        if (s.status === 'fulfilled') {
          results.push({ ...s.value, alternativeIdx: idx })
        }
      })
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
