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
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <h2 className="mb-2 text-sm font-semibold text-slate-900">
        Variantes ({routes.length})
      </h2>
      <ul className="space-y-1.5">
        {routes.map((r, idx) => {
          const selected = idx === clamped
          return (
            <li key={idx}>
              <button
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
                  selected
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                      selected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-medium">
                    {formatDistance(r.stats.distanceKm)}
                  </span>
                </span>
                <span className="text-xs tabular-nums text-slate-500">
                  {formatDuration(r.stats.durationMin)} ·{' '}
                  {formatElevation(r.stats.ascentM)} D+
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
