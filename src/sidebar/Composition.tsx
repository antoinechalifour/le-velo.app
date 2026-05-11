import { formatDistance } from '../format/format'
import type { BreakdownEntry } from '../route/breakdown'
import { CATEGORY_META } from '../route/segmentCategory'

export function Composition({ breakdown }: { breakdown: BreakdownEntry[] }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Type de voies</h2>
        <span className="text-[11px] text-slate-500">d'après tags OSM</span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
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
      <ul className="mt-3 space-y-2 text-xs">
        {breakdown.map((b) => {
          const meta = CATEGORY_META[b.category]
          return (
            <li key={b.category} className="flex items-start gap-2">
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-800">
                    {meta.label}
                  </span>
                  <span className="flex items-center gap-2 tabular-nums">
                    <span className="font-medium text-slate-900">
                      {(b.share * 100).toFixed(0)}%
                    </span>
                    <span className="w-16 text-right text-slate-500">
                      {formatDistance(b.distanceM / 1000)}
                    </span>
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
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
