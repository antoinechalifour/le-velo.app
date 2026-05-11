import type { RoutePoint } from '../route/point'
import type { RouteResult } from '../route/route'

export type PeekStatus =
  | { kind: 'idle' }
  | { kind: 'instruction'; text: string }
  | { kind: 'fetching' }
  | { kind: 'error' }
  | { kind: 'route'; route: RouteResult }

export function computePeekStatus(
  points: RoutePoint[],
  route: RouteResult | null,
  isFetching: boolean,
  error: Error | null,
): PeekStatus {
  if (error) return { kind: 'error' }
  if (isFetching) return { kind: 'fetching' }
  if (route) return { kind: 'route', route }
  if (points.length === 0) {
    return { kind: 'instruction', text: 'Posez le départ sur la carte' }
  }
  if (points.length === 1) {
    return { kind: 'instruction', text: 'Posez l\u2019arrivée sur la carte' }
  }
  return { kind: 'idle' }
}
