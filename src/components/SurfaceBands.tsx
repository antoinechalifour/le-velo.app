import {
  SURFACE_META,
  SURFACE_ORDER,
  type SurfaceBand,
  type SurfaceCategory,
} from '../lib/segments'
import { formatDistance } from '../lib/format'

type SurfaceBandsProps = {
  bands: SurfaceBand[]
}

export function SurfaceBands({ bands }: SurfaceBandsProps) {
  if (bands.length === 0) return null
  const total = bands[bands.length - 1].endM
  if (total <= 0) return null

  const totals: Partial<Record<SurfaceCategory, number>> = {}
  for (const b of bands) {
    totals[b.category] = (totals[b.category] ?? 0) + b.distanceM
  }
  const legend = SURFACE_ORDER.filter((c) => (totals[c] ?? 0) > 0)

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Revêtement</h2>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {bands.map((b, idx) => {
          const meta = SURFACE_META[b.category]
          const title = b.rawSurface
            ? `${meta.label} (${b.rawSurface}) — ${formatDistance(b.distanceM / 1000)}`
            : `${meta.label} — ${formatDistance(b.distanceM / 1000)}`
          return (
            <div
              key={idx}
              style={{
                width: `${(b.distanceM / total) * 100}%`,
                backgroundColor: meta.color,
              }}
              title={title}
            />
          )
        })}
      </div>
      <ul className="mt-3 space-y-1.5 text-xs">
        {legend.map((cat) => {
          const meta = SURFACE_META[cat]
          const dist = totals[cat]!
          return (
            <li key={cat} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <span className="flex-1 text-slate-700">{meta.label}</span>
              <span className="font-medium tabular-nums text-slate-900">
                {((dist / total) * 100).toFixed(0)}%
              </span>
              <span className="w-16 text-right tabular-nums text-slate-500">
                {formatDistance(dist / 1000)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
