import type { FeatureCollection, LineString } from 'geojson'
import type { LngLat } from '../types'

export type ElevationPoint = {
  distanceM: number
  elevationM: number
  point: LngLat
}

export function buildElevationProfile(
  geojson: FeatureCollection,
): ElevationPoint[] {
  const feature = geojson.features?.[0]
  if (!feature || feature.geometry?.type !== 'LineString') return []
  const coords = (feature.geometry as LineString).coordinates
  if (coords.length === 0) return []

  const profile: ElevationPoint[] = []
  let cumDist = 0
  for (let i = 0; i < coords.length; i++) {
    const c = coords[i] as number[]
    const lng = c[0]
    const lat = c[1]
    const ele = Number.isFinite(c[2]) ? (c[2] as number) : 0
    if (i > 0) {
      const prev = coords[i - 1] as number[]
      cumDist += haversine(prev[0], prev[1], lng, lat)
    }
    profile.push({
      distanceM: cumDist,
      elevationM: ele,
      point: { lng, lat },
    })
  }
  return profile
}

export function pointAtDistance(
  profile: ElevationPoint[],
  distanceM: number,
): ElevationPoint | null {
  if (profile.length === 0) return null
  if (distanceM <= profile[0].distanceM) return profile[0]
  const last = profile[profile.length - 1]
  if (distanceM >= last.distanceM) return last
  let lo = 0
  let hi = profile.length - 1
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1
    if (profile[mid].distanceM <= distanceM) lo = mid
    else hi = mid
  }
  const a = profile[lo]
  const b = profile[hi]
  const span = b.distanceM - a.distanceM
  if (span === 0) return a
  const t = (distanceM - a.distanceM) / span
  return {
    distanceM,
    elevationM: a.elevationM + (b.elevationM - a.elevationM) * t,
    point: {
      lng: a.point.lng + (b.point.lng - a.point.lng) * t,
      lat: a.point.lat + (b.point.lat - a.point.lat) * t,
    },
  }
}

function haversine(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number,
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const meanLat = (((lat1 + lat2) / 2) * Math.PI) / 180
  const x = dLng * Math.cos(meanLat)
  return Math.sqrt(x * x + dLat * dLat) * 6_371_000
}
