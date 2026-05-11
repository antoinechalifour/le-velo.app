type XY = { x: number; y: number }

export function nearestXIdx<P extends XY>(points: P[], x: number): number {
  if (points.length === 0) return -1
  if (x <= points[0].x) return 0
  if (x >= points[points.length - 1].x) return points.length - 1
  let lo = 0
  let hi = points.length - 1
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1
    if (points[mid].x <= x) lo = mid
    else hi = mid
  }
  const a = points[lo]
  const b = points[hi]
  return x - a.x <= b.x - x ? lo : hi
}
