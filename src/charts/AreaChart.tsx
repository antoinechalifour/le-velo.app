import { useMemo, useRef } from 'react'
import {
  buildPaths,
  buildScales,
  type ChartViewport,
  type XY,
} from './buildPath'
import { nearestXIdx } from './nearestX'

type AreaChartProps = {
  points: XY[]
  hoveredX: number | null
  onHoverX: (x: number | null) => void
  lineColor?: string
  areaColor?: string
  className?: string
  xAxisLabel?: (x: number) => string
  yAxisLabel?: (y: number) => string
}

const DEFAULT_VIEWPORT: ChartViewport = {
  width: 400,
  height: 140,
  padLeft: 36,
  padRight: 8,
  padTop: 8,
  padBottom: 22,
}

export function AreaChart({
  points,
  hoveredX,
  onHoverX,
  lineColor = '#2563eb',
  areaColor = '#bfdbfe',
  className = 'block h-36 w-full',
  xAxisLabel,
  yAxisLabel = (y) => String(Math.round(y)),
}: AreaChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const viewport = DEFAULT_VIEWPORT

  const { scales, paths } = useMemo(() => {
    const scales = buildScales(points, viewport)
    const paths = buildPaths(points, viewport, scales)
    return { scales, paths }
  }, [points, viewport])

  if (points.length < 2) return null

  const plotW = viewport.width - viewport.padLeft - viewport.padRight
  const plotH = viewport.height - viewport.padTop - viewport.padBottom

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const xPx = e.clientX - rect.left
    const xView = (xPx / rect.width) * viewport.width
    const t = (xView - viewport.padLeft) / plotW
    if (t < 0 || t > 1) {
      onHoverX(null)
      return
    }
    const xSpan = scales.xMax - scales.xMin
    const xValue = scales.xMin + t * xSpan
    const idx = nearestXIdx(points, xValue)
    onHoverX(points[idx].x)
  }

  let hoverElement: React.ReactNode = null
  if (hoveredX !== null) {
    const idx = nearestXIdx(points, hoveredX)
    const p = points[idx]
    const hx = scales.xOf(p.x)
    const hy = scales.yOf(p.y)
    hoverElement = (
      <g>
        <line
          x1={hx}
          x2={hx}
          y1={viewport.padTop}
          y2={viewport.padTop + plotH}
          stroke="#0f172a"
          strokeWidth={1}
          strokeDasharray="2 2"
        />
        <circle cx={hx} cy={hy} r={4} fill="#0f172a" />
      </g>
    )
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${viewport.width} ${viewport.height}`}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={() => onHoverX(null)}
      preserveAspectRatio="none"
    >
      <line
        x1={viewport.padLeft}
        y1={viewport.padTop}
        x2={viewport.padLeft}
        y2={viewport.padTop + plotH}
        stroke="#cbd5e1"
        strokeWidth={1}
      />
      <line
        x1={viewport.padLeft}
        y1={viewport.padTop + plotH}
        x2={viewport.width - viewport.padRight}
        y2={viewport.padTop + plotH}
        stroke="#cbd5e1"
        strokeWidth={1}
      />
      <path d={paths.areaPath} fill={areaColor} opacity={0.55} />
      <path d={paths.linePath} fill="none" stroke={lineColor} strokeWidth={1.5} />
      {hoverElement}
      <text
        x={viewport.padLeft - 4}
        y={viewport.padTop + 8}
        textAnchor="end"
        className="fill-slate-500"
        fontSize="9"
      >
        {yAxisLabel(scales.yMax)}
      </text>
      <text
        x={viewport.padLeft - 4}
        y={viewport.padTop + plotH}
        textAnchor="end"
        className="fill-slate-500"
        fontSize="9"
      >
        {yAxisLabel(scales.yMin)}
      </text>
      {xAxisLabel && (
        <>
          <text
            x={viewport.padLeft}
            y={viewport.height - 6}
            textAnchor="start"
            className="fill-slate-500"
            fontSize="9"
          >
            {xAxisLabel(scales.xMin)}
          </text>
          <text
            x={viewport.width - viewport.padRight}
            y={viewport.height - 6}
            textAnchor="end"
            className="fill-slate-500"
            fontSize="9"
          >
            {xAxisLabel(scales.xMax)}
          </text>
        </>
      )}
    </svg>
  )
}
