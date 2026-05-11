import type { LngLat } from './lngLat'

export function bboxOf(points: LngLat[]): [LngLat, LngLat] | null {
  if (points.length < 2) return null
  let minLat = Infinity
  let minLng = Infinity
  let maxLat = -Infinity
  let maxLng = -Infinity
  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat
    if (p.lng < minLng) minLng = p.lng
    if (p.lat > maxLat) maxLat = p.lat
    if (p.lng > maxLng) maxLng = p.lng
  }
  return [
    { lat: minLat, lng: minLng },
    { lat: maxLat, lng: maxLng },
  ]
}
