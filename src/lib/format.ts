export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

export function formatDuration(min: number): string {
  if (min < 60) return `${Math.round(min)} min`
  const h = Math.floor(min / 60)
  const m = Math.round(min - h * 60)
  return `${h}h${m.toString().padStart(2, '0')}`
}

export function formatElevation(m: number): string {
  return `${Math.round(m)} m`
}

export function formatSpeed(distanceKm: number, durationMin: number): string | null {
  if (durationMin <= 0 || distanceKm <= 0) return null
  const kmh = distanceKm / (durationMin / 60)
  return `${kmh.toFixed(1)} km/h`
}
