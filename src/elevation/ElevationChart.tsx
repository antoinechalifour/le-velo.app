import { useMemo } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { AreaChart } from '../charts/AreaChart'
import { formatDistance, formatElevation } from '../format/format'
import type { ElevationPoint } from '../route/elevation'
import { pointAtDistance } from '../route/elevation'
import type { Segment } from '../route/segments'
import { highlightedSegmentIdxAtom } from '../state/highlight'
import { profileHoverAtom } from '../state/hover'

export function ElevationChart({
  profile,
  segments,
}: {
  profile: ElevationPoint[]
  segments?: Segment[]
}) {
  const [hover, setHover] = useAtom(profileHoverAtom)
  const highlightedSegmentIdx = useAtomValue(highlightedSegmentIdxAtom)
  const setHighlightedSegmentIdx = useSetAtom(highlightedSegmentIdxAtom)

  const xyPoints = useMemo(
    () => profile.map((p) => ({ x: p.distanceM, y: p.elevationM })),
    [profile],
  )

  if (profile.length < 2) return null

  const segmentDrivenX =
    !hover && segments && highlightedSegmentIdx !== null
      ? segmentMidpointM(segments[highlightedSegmentIdx])
      : null

  const hoveredX = hover?.distanceM ?? segmentDrivenX
  const hoveredPoint =
    hoveredX !== null ? pointAtDistance(profile, hoveredX) : null

  function handleHoverX(x: number | null) {
    if (x === null) {
      setHover(null)
      setHighlightedSegmentIdx(null)
      return
    }
    const p = pointAtDistance(profile, x)
    if (!p) return
    setHover({ distanceM: p.distanceM, point: p.point })
    if (segments && segments.length > 0) {
      const idx = findSegmentIdxAt(segments, p.distanceM)
      setHighlightedSegmentIdx(idx)
    }
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

function segmentMidpointM(segment: Segment | undefined): number | null {
  if (!segment) return null
  return ((segment.startKm + segment.endKm) / 2) * 1000
}

function findSegmentIdxAt(segments: Segment[], distanceM: number): number | null {
  const km = distanceM / 1000
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]
    if (km >= s.startKm && km <= s.endKm) return i
  }
  return null
}
