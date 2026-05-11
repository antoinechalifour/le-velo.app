import { useMemo } from 'react'
import { useAtom } from 'jotai'
import { AreaChart } from '../charts/AreaChart'
import { formatDistance, formatElevation } from '../format/format'
import type { ElevationPoint } from '../route/elevation'
import { pointAtDistance } from '../route/elevation'
import { profileHoverAtom } from '../state/hover'

export function ElevationChart({ profile }: { profile: ElevationPoint[] }) {
  const [hover, setHover] = useAtom(profileHoverAtom)

  const xyPoints = useMemo(
    () => profile.map((p) => ({ x: p.distanceM, y: p.elevationM })),
    [profile],
  )

  if (profile.length < 2) return null

  const hoveredX = hover?.distanceM ?? null
  const hoveredPoint =
    hoveredX !== null ? pointAtDistance(profile, hoveredX) : null

  function handleHoverX(x: number | null) {
    if (x === null) {
      setHover(null)
      return
    }
    const p = pointAtDistance(profile, x)
    if (p) setHover({ distanceM: p.distanceM, point: p.point })
  }

  const yRange = (() => {
    let lo = Infinity
    let hi = -Infinity
    for (const p of profile) {
      if (p.elevationM < lo) lo = p.elevationM
      if (p.elevationM > hi) hi = p.elevationM
    }
    return { lo, hi }
  })()

  return (
    <div className="paper-card rounded-xl p-4">
      <div className="mb-2 flex items-baseline justify-between">
        {hoveredPoint ? (
          <span className="numeral text-[0.78rem] text-ink">
            {formatDistance(hoveredPoint.distanceM / 1000)}
            <span className="mx-1.5 text-sepia-soft">·</span>
            {formatElevation(hoveredPoint.elevationM)}
          </span>
        ) : (
          <span className="numeral text-[0.78rem] text-sepia">
            <span className="text-ink">{formatElevation(yRange.lo)}</span>
            <span className="mx-1.5">→</span>
            <span className="text-ink">{formatElevation(yRange.hi)}</span>
          </span>
        )}
        <span className="eyebrow-tight text-sepia-soft">Altitude</span>
      </div>
      <AreaChart
        points={xyPoints}
        hoveredX={hoveredX}
        onHoverX={handleHoverX}
        lineColor="#b8501a"
        areaColor="#b8501a"
        xAxisLabel={(distanceM) => formatDistance(distanceM / 1000)}
      />
    </div>
  )
}
