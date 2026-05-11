import { formatDistance } from '../format/format'
import type { BreakdownEntry } from '../route/breakdown'
import { CATEGORY_META } from '../route/segmentCategory'

export function Composition({ breakdown }: { breakdown: BreakdownEntry[] }) {
  return (
    <div className="paper-card rounded-xl p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[0.7rem] italic text-sepia-soft">
          d’après tags OSM
        </span>
      </div>
      <div className="flex h-4 w-full overflow-hidden rounded-full border border-ink/15 bg-paper-deep">
        {breakdown.map((b) => (
          <div
            key={b.category}
            style={{
              width: `${b.share * 100}%`,
              backgroundColor: CATEGORY_META[b.category].color,
            }}
            title={`${CATEGORY_META[b.category].label} — ${(b.share * 100).toFixed(0)}%`}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-2.5">
        {breakdown.map((b) => {
          const meta = CATEGORY_META[b.category]
          return (
            <li key={b.category} className="flex items-start gap-2.5">
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
                      {(b.share * 100).toFixed(0)}
                      <span className="text-[0.7rem] text-sepia">%</span>
                    </span>
                    <span className="numeral w-16 text-right text-[0.72rem] text-sepia">
                      {formatDistance(b.distanceM / 1000)}
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
