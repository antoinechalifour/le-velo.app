import * as turf from '@turf/turf'
import type { LngLat } from '../geo/lngLat'

export type DetourSide = 'left' | 'right'

export type DetourVariant = {
  side: DetourSide
  label: string
}

export const DETOUR_VARIANTS: DetourVariant[] = [
  { side: 'left', label: 'Boucle nord' },
  { side: 'right', label: 'Boucle sud' },
]

function toFeature(p: LngLat) {
  return turf.point([p.lng, p.lat])
}

function fromFeature(f: ReturnType<typeof turf.point>): LngLat {
  const [lng, lat] = f.geometry.coordinates as [number, number]
  return { lng, lat }
}

export function geoDistanceKm(a: LngLat, b: LngLat): number {
  return turf.distance(toFeature(a), toFeature(b))
}

export function midpoint(a: LngLat, b: LngLat): LngLat {
  return fromFeature(turf.midpoint(toFeature(a), toFeature(b)))
}

export function bearingDeg(a: LngLat, b: LngLat): number {
  return turf.bearing(toFeature(a), toFeature(b))
}

export function offsetWaypoint(
  a: LngLat,
  b: LngLat,
  offsetKm: number,
  side: DetourSide,
): LngLat {
  const mid = midpoint(a, b)
  const brg = bearingDeg(a, b)
  const perp = side === 'left' ? brg - 90 : brg + 90
  return fromFeature(turf.destination(toFeature(mid), offsetKm, perp))
}

// Pour un triangle isocèle de base d (distance directe A↔B) et de périmètre
// hors-base = target − d, l'offset perpendiculaire vaut :
//   offset = √((target/2)² − (d/2)²)
// C'est l'offset géodésique théorique ; BRouter routant sur du réseau réel,
// la distance effective sera systématiquement supérieure → on itère ensuite.
export function initialOffsetKm(directKm: number, targetKm: number): number {
  if (targetKm <= directKm) return 0
  return Math.sqrt((targetKm / 2) ** 2 - (directKm / 2) ** 2)
}
