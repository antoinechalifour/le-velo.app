import { formatDistance, formatDuration, formatElevation } from '../format/format'
import type { RouteResult } from '../route/route'
import { useSelectedRouteParam } from '../url/params'

export function Alternatives({ routes }: { routes: RouteResult[] }) {
  const [selectedIdx, setSelectedIdx] = useSelectedRouteParam()
  const clamped =
    routes.length > 0
      ? Math.min(Math.max(selectedIdx, 0), routes.length - 1)
      : 0

  return (
    <ul className="space-y-2">
      {routes.map((r, idx) => {
        const selected = idx === clamped
        return (
          <li key={idx}>
            <button
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`focus-ring flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                selected
                  ? 'border-forest bg-forest/8 shadow-[inset_3px_0_0_var(--color-forest)]'
                  : 'paper-card hover:border-ink/25'
              }`}
            >
              <span
                className={`display-serif flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-semibold transition ${
                  selected
                    ? 'bg-forest text-paper-soft'
                    : 'bg-paper-deep text-ink-soft'
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="numeral text-base font-semibold text-ink">
                    {formatDistance(r.stats.distanceKm)}
                  </span>
                  <span className="text-[0.72rem] text-sepia-soft">
                    Variante {String.fromCharCode(65 + idx)}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[0.75rem] text-sepia">
                  <span className="numeral">
                    {formatDuration(r.stats.durationMin)}
                  </span>
                  <span className="text-sepia-soft">·</span>
                  <span className="numeral">
                    {formatElevation(r.stats.ascentM)} D+
                  </span>
                </div>
              </div>
              {selected && (
                <span
                  aria-hidden
                  className="eyebrow-tight text-forest"
                >
                  ✓ Choisie
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
