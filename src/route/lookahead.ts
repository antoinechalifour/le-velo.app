import { haversine } from '../geo/haversine'
import type { LngLat } from '../geo/lngLat'

// Project `user` onto the polyline `coords`, then walk forward along the
// route accumulating `lookaheadM` meters of true distance. Returns the
// resulting point — used to derive a camera bearing that keeps the next
// stretch of route facing the rider.
export function findRouteLookahead(
  coords: [number, number][],
  user: LngLat,
  lookaheadM: number,
): LngLat | null {
  if (coords.length < 2) return null

  // Approximate orthogonal projection in lng/lat space — fine over the
  // tens-of-meters scale we use for finding the nearest segment.
  let bestSqDist = Infinity
  let bestIdx = 0
  let bestT = 0
  for (let i = 0; i < coords.length - 1; i++) {
    const [ax, ay] = coords[i]
    const [bx, by] = coords[i + 1]
    const dx = bx - ax
    const dy = by - ay
    const len2 = dx * dx + dy * dy
    if (len2 === 0) continue
    let t = ((user.lng - ax) * dx + (user.lat - ay) * dy) / len2
    if (t < 0) t = 0
    else if (t > 1) t = 1
    const px = ax + t * dx
    const py = ay + t * dy
    const ex = user.lng - px
    const ey = user.lat - py
    const sq = ex * ex + ey * ey
    if (sq < bestSqDist) {
      bestSqDist = sq
      bestIdx = i
      bestT = t
    }
  }

  const [ax, ay] = coords[bestIdx]
  const [bx, by] = coords[bestIdx + 1]
  let prevLng = ax + bestT * (bx - ax)
  let prevLat = ay + bestT * (by - ay)

  let remaining = lookaheadM
  for (let i = bestIdx + 1; i < coords.length; i++) {
    const [nx, ny] = coords[i]
    const d = haversine(prevLng, prevLat, nx, ny)
    if (d >= remaining) {
      const t = d === 0 ? 0 : remaining / d
      return {
        lng: prevLng + t * (nx - prevLng),
        lat: prevLat + t * (ny - prevLat),
      }
    }
    remaining -= d
    prevLng = nx
    prevLat = ny
  }
  return { lng: prevLng, lat: prevLat }
}
