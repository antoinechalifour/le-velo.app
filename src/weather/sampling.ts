import { bearingDeg } from '../geo/bearing'
import type { LngLat } from '../geo/lngLat'
import { pointAtDistance, type ElevationPoint } from '../route/elevation'

export type Waypoint = {
  distanceM: number
  point: LngLat
  bearing: number
  timeMs: number
}

export const WAYPOINT_COUNT = 8

export function sampleRouteWaypoints(
  profile: ElevationPoint[],
  totalDistanceM: number,
  durationMs: number,
  departureMs: number,
): Waypoint[] {
  if (profile.length === 0 || totalDistanceM <= 0) return []
  const out: Waypoint[] = []
  for (let i = 0; i < WAYPOINT_COUNT; i++) {
    const t = (i + 0.5) / WAYPOINT_COUNT
    const distanceM = t * totalDistanceM
    const p = pointAtDistance(profile, distanceM)
    if (!p) continue
    const ahead = pointAtDistance(
      profile,
      Math.min(distanceM + 100, totalDistanceM),
    )
    const behind = pointAtDistance(profile, Math.max(distanceM - 100, 0))
    const from = behind ?? p
    const to = ahead ?? p
    const sameSpot =
      from.point.lng === to.point.lng && from.point.lat === to.point.lat
    const bearing = sameSpot ? 0 : bearingDeg(from.point, to.point)
    out.push({
      distanceM,
      point: p.point,
      bearing,
      timeMs: departureMs + t * durationMs,
    })
  }
  return out
}
