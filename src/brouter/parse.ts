import type { RouteStats } from '../route/route'
import type { BrouterTrackProps } from './types'

export function parseStats(props: BrouterTrackProps): RouteStats {
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
