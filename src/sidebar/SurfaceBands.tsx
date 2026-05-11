import { formatDistance } from '../format/format'
import { SURFACE_META, SURFACE_ORDER } from '../route/surface'
import { surfaceTotals, type SurfaceBand } from '../route/surfaceBands'

export function SurfaceBands({ bands }: { bands: SurfaceBand[] }) {
  if (bands.length === 0) return null
  const total = bands[bands.length - 1].endM
  if (total <= 0) return null

  const totals = surfaceTotals(bands)
  const legend = SURFACE_ORDER.filter((c) => (totals[c] ?? 0) > 0)

  return (
    <div className="paper-card rounded-xl p-4">
      <div className="flex h-4 w-full overflow-hidden rounded-full border border-ink/15 bg-paper-deep">
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
      <ul className="mt-4 space-y-2.5">
        {legend.map((cat) => {
          const meta = SURFACE_META[cat]
          const dist = totals[cat]!
          return (
            <li key={cat} className="flex items-start gap-2.5">
              <span
                className="mt-1 h-3 w-3 shrink-0 rounded-sm ring-1 ring-ink/20"
                style={{ backgroundColor: meta.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[0.86rem] font-medium text-ink">
                    {meta.label}
                  </span>
                  <span className="flex items-baseline gap-2.5">
                    <span className="numeral text-[0.95rem] font-semibold text-ink">
                      {((dist / total) * 100).toFixed(0)}
                      <span className="text-[0.7rem] text-sepia">%</span>
                    </span>
                    <span className="numeral w-16 text-right text-[0.72rem] text-sepia">
                      {formatDistance(dist / 1000)}
                    </span>
                  </span>
                </div>
                <div className="text-[0.72rem] leading-snug text-sepia-soft">
                  {meta.description}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
