import type { RoutePoint } from '../route/point'

export function autoItineraryName(
  points: RoutePoint[],
  startName: string | null,
  endName: string | null,
): string {
  const start = startName ?? points[0]?.label ?? null
  const end = endName ?? points[points.length - 1]?.label ?? null
  if (start && end && start !== end) return `${start} → ${end}`
  const only = start ?? end
  if (only) return `Boucle depuis ${only}`
  const now = new Date()
  const date = now.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
  return `Itinéraire du ${date}`
}
