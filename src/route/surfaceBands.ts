import type { SurfaceCategory } from './surface'

export type SurfaceBand = {
  category: SurfaceCategory
  rawSurface: string | null
  startM: number
  endM: number
  distanceM: number
}

export function surfaceTotals(
  bands: SurfaceBand[],
): Partial<Record<SurfaceCategory, number>> {
  const totals: Partial<Record<SurfaceCategory, number>> = {}
  for (const b of bands) {
    totals[b.category] = (totals[b.category] ?? 0) + b.distanceM
  }
  return totals
}

export function bandIdxAtDistance(
  bands: SurfaceBand[],
  distanceM: number,
): number | null {
  for (let i = 0; i < bands.length; i++) {
    const b = bands[i]
    if (distanceM >= b.startM && distanceM <= b.endM) return i
  }
  return null
}
