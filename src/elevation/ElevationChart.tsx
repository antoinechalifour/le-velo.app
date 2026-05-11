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
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          Profil altimétrique
        </h2>
        {hoveredPoint ? (
          <span className="text-xs tabular-nums text-slate-600">
            {formatDistance(hoveredPoint.distanceM / 1000)} ·{' '}
            {formatElevation(hoveredPoint.elevationM)}
          </span>
        ) : (
          <span className="text-xs text-slate-500">
            {formatElevation(yRange.lo)} – {formatElevation(yRange.hi)}
          </span>
        )}
      </div>
      <AreaChart
        points={xyPoints}
        hoveredX={hoveredX}
        onHoverX={handleHoverX}
        xAxisLabel={(distanceM) => formatDistance(distanceM / 1000)}
      />
    </div>
  )
}
