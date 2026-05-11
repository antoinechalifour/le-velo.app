export type PointRole = 'start' | 'waypoint' | 'end'

export function pointRole(idx: number, total: number): PointRole {
  if (idx === 0) return 'start'
  if (idx === total - 1 && total > 1) return 'end'
  return 'waypoint'
}

export const ROLE_META: Record<PointRole, { label: string; color: string }> = {
  start: { label: 'Départ', color: '#1f4d2e' },
  waypoint: { label: 'Étape', color: '#3d6b8e' },
  end: { label: 'Arrivée', color: '#7c2229' },
}

export function roleLetter(role: PointRole, idx: number): string {
  if (role === 'start') return 'A'
  if (role === 'end') return 'B'
  return String(idx + 1)
}
