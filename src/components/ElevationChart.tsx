import { useMemo, useRef } from 'react'
import type { ElevationPoint } from '../lib/elevation'
import { formatDistance, formatElevation } from '../lib/format'
import type { LngLat } from '../types'

type ElevationChartProps = {
  profile: ElevationPoint[]
  hoveredDistanceM: number | null
  onHover: (state: { distanceM: number; point: LngLat } | null) => void
}

const VIEW_W = 400
const VIEW_H = 140
const PAD_LEFT = 36
const PAD_RIGHT = 8
const PAD_TOP = 8
const PAD_BOTTOM = 22
const PLOT_W = VIEW_W - PAD_LEFT - PAD_RIGHT
const PLOT_H = VIEW_H - PAD_TOP - PAD_BOTTOM

export function ElevationChart({
  profile,
  hoveredDistanceM,
  onHover,
}: ElevationChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  const { totalDist, minEle, maxEle, areaPath, linePath } = useMemo(() => {
    if (profile.length < 2) {
      return { totalDist: 0, minEle: 0, maxEle: 0, areaPath: '', linePath: '' }
    }
    let minE = Infinity
    let maxE = -Infinity
    for (const p of profile) {
      if (p.elevationM < minE) minE = p.elevationM
      if (p.elevationM > maxE) maxE = p.elevationM
    }
    if (maxE - minE < 10) maxE = minE + 10
    const total = profile[profile.length - 1].distanceM
    const xOf = (d: number) => PAD_LEFT + (d / total) * PLOT_W
    const yOf = (e: number) =>
      PAD_TOP + PLOT_H - ((e - minE) / (maxE - minE)) * PLOT_H
    let line = ''
    for (let i = 0; i < profile.length; i++) {
      const p = profile[i]
      line += i === 0 ? 'M' : 'L'
      line += `${xOf(p.distanceM).toFixed(1)} ${yOf(p.elevationM).toFixed(1)} `
    }
    const last = profile[profile.length - 1]
    const area =
      line +
      `L${xOf(last.distanceM).toFixed(1)} ${(PAD_TOP + PLOT_H).toFixed(1)} ` +
      `L${xOf(profile[0].distanceM).toFixed(1)} ${(PAD_TOP + PLOT_H).toFixed(1)} Z`
    return {
      totalDist: total,
      minEle: minE,
      maxEle: maxE,
      areaPath: area,
      linePath: line.trim(),
    }
  }, [profile])

  if (profile.length < 2) return null

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const xPx = e.clientX - rect.left
    const xView = (xPx / rect.width) * VIEW_W
    const t = (xView - PAD_LEFT) / PLOT_W
    if (t < 0 || t > 1) {
      onHover(null)
      return
    }
    const d = t * totalDist
    const idx = nearestProfileIdx(profile, d)
    const p = profile[idx]
    onHover({ distanceM: p.distanceM, point: p.point })
  }

  const xOf = (d: number) => PAD_LEFT + (d / totalDist) * PLOT_W
  const yOf = (e: number) =>
    PAD_TOP + PLOT_H - ((e - minEle) / (maxEle - minEle)) * PLOT_H

  let hoverElement: React.ReactNode = null
  if (hoveredDistanceM !== null) {
    const idx = nearestProfileIdx(profile, hoveredDistanceM)
    const p = profile[idx]
    const hx = xOf(p.distanceM)
    const hy = yOf(p.elevationM)
    hoverElement = (
      <g>
        <line
          x1={hx}
          x2={hx}
          y1={PAD_TOP}
          y2={PAD_TOP + PLOT_H}
          stroke="#0f172a"
          strokeWidth={1}
          strokeDasharray="2 2"
        />
        <circle cx={hx} cy={hy} r={4} fill="#0f172a" />
      </g>
    )
  }

  const hoveredPoint =
    hoveredDistanceM !== null
      ? profile[nearestProfileIdx(profile, hoveredDistanceM)]
      : null

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
            {formatElevation(minEle)} – {formatElevation(maxEle)}
          </span>
        )}
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="block h-36 w-full"
        onMouseMove={handleMove}
        onMouseLeave={() => onHover(null)}
        preserveAspectRatio="none"
      >
        <line
          x1={PAD_LEFT}
          y1={PAD_TOP}
          x2={PAD_LEFT}
          y2={PAD_TOP + PLOT_H}
          stroke="#cbd5e1"
          strokeWidth={1}
        />
        <line
          x1={PAD_LEFT}
          y1={PAD_TOP + PLOT_H}
          x2={VIEW_W - PAD_RIGHT}
          y2={PAD_TOP + PLOT_H}
          stroke="#cbd5e1"
          strokeWidth={1}
        />
        <path d={areaPath} fill="#bfdbfe" opacity={0.55} />
        <path d={linePath} fill="none" stroke="#2563eb" strokeWidth={1.5} />
        {hoverElement}
        <text
          x={PAD_LEFT - 4}
          y={PAD_TOP + 8}
          textAnchor="end"
          className="fill-slate-500"
          fontSize="9"
        >
          {Math.round(maxEle)}
        </text>
        <text
          x={PAD_LEFT - 4}
          y={PAD_TOP + PLOT_H}
          textAnchor="end"
          className="fill-slate-500"
          fontSize="9"
        >
          {Math.round(minEle)}
        </text>
        <text
          x={PAD_LEFT}
          y={VIEW_H - 6}
          textAnchor="start"
          className="fill-slate-500"
          fontSize="9"
        >
          0
        </text>
        <text
          x={VIEW_W - PAD_RIGHT}
          y={VIEW_H - 6}
          textAnchor="end"
          className="fill-slate-500"
          fontSize="9"
        >
          {formatDistance(totalDist / 1000)}
        </text>
      </svg>
    </div>
  )
}

function nearestProfileIdx(profile: ElevationPoint[], d: number): number {
  if (d <= profile[0].distanceM) return 0
  if (d >= profile[profile.length - 1].distanceM) return profile.length - 1
  let lo = 0
  let hi = profile.length - 1
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1
    if (profile[mid].distanceM <= d) lo = mid
    else hi = mid
  }
  const a = profile[lo]
  const b = profile[hi]
  return d - a.distanceM <= b.distanceM - d ? lo : hi
}
