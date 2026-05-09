import type { LngLat, RouteResult } from '../types'
import { formatDistance, formatDuration, formatElevation } from '../lib/format'
import {
  CATEGORY_META,
  type BreakdownEntry,
  type Segment,
} from '../lib/segments'

type SidebarProps = {
  start: LngLat | null
  end: LngLat | null
  route: RouteResult | null
  isFetching: boolean
  error: Error | null
  highlightedSegmentIdx: number | null
  onHighlightSegment: (idx: number | null) => void
  onReset: () => void
}

export function Sidebar({
  start,
  end,
  route,
  isFetching,
  error,
  highlightedSegmentIdx,
  onHighlightSegment,
  onReset,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-96 flex-col gap-4 overflow-y-auto border-r border-slate-200 bg-white p-5">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Velo Maps</h1>
        <p className="mt-1 text-sm text-slate-500">
          Itinéraires vélo orientés voies cyclables référencées (OSM + BRouter).
        </p>
      </header>

      <Step
        index={1}
        label="Point de départ"
        active={!start}
        value={formatPoint(start)}
      />
      <Step
        index={2}
        label="Point d'arrivée"
        active={!!start && !end}
        value={formatPoint(end)}
      />

      {!start && (
        <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
          Cliquez sur la carte pour poser le point de départ.
        </p>
      )}
      {start && !end && (
        <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
          Cliquez sur la carte pour poser le point d'arrivée.
        </p>
      )}

      {isFetching && (
        <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
          Calcul de l'itinéraire…
        </p>
      )}

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error.message}
        </p>
      )}

      {route && (
        <>
          <Stats route={route} />
          {route.breakdown.length > 0 && (
            <Composition breakdown={route.breakdown} />
          )}
          {route.segments.length > 0 && (
            <SegmentList
              segments={route.segments}
              highlightedIdx={highlightedSegmentIdx}
              onHighlight={onHighlightSegment}
            />
          )}
        </>
      )}

      {(start || end) && (
        <button
          type="button"
          onClick={onReset}
          className="mt-auto rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Réinitialiser
        </button>
      )}

      <footer className="text-xs text-slate-400">
        Données &copy; OpenStreetMap. Routage : brouter.de.
      </footer>
    </aside>
  )
}

function Step({
  index,
  label,
  active,
  value,
}: {
  index: number
  label: string
  active: boolean
  value: string | null
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-md border p-3 ${
        active
          ? 'border-blue-300 bg-blue-50'
          : value
            ? 'border-slate-200 bg-white'
            : 'border-slate-200 bg-slate-50/50'
      }`}
    >
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          value
            ? 'bg-slate-900 text-white'
            : active
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-500'
        }`}
      >
        {index}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <div className="mt-0.5 truncate text-sm text-slate-900">
          {value ?? '—'}
        </div>
      </div>
    </div>
  )
}

function Stats({ route }: { route: RouteResult }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Itinéraire</h2>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Distance" value={formatDistance(route.stats.distanceKm)} />
        <Stat label="Durée est." value={formatDuration(route.stats.durationMin)} />
        <Stat label="D+" value={formatElevation(route.stats.ascentM)} />
        <Stat label="D−" value={formatElevation(route.stats.descentM)} />
      </dl>
      <a
        href={route.rawGpxUrl}
        download="itineraire.gpx"
        className="mt-4 block w-full rounded-md bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-slate-800"
      >
        Télécharger GPX
      </a>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-semibold text-slate-900">{value}</dd>
    </div>
  )
}

function Composition({ breakdown }: { breakdown: BreakdownEntry[] }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Composition</h2>
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
      <ul className="mt-3 space-y-1.5 text-xs">
        {breakdown.map((b) => (
          <li key={b.category} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: CATEGORY_META[b.category].color }}
            />
            <span className="flex-1 text-slate-700">
              {CATEGORY_META[b.category].label}
            </span>
            <span className="font-medium tabular-nums text-slate-900">
              {(b.share * 100).toFixed(0)}%
            </span>
            <span className="w-16 text-right tabular-nums text-slate-500">
              {formatDistance(b.distanceM / 1000)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SegmentList({
  segments,
  highlightedIdx,
  onHighlight,
}: {
  segments: Segment[]
  highlightedIdx: number | null
  onHighlight: (idx: number | null) => void
}) {
  return (
    <details className="rounded-md border border-slate-200 bg-white">
      <summary className="cursor-pointer list-none p-3 text-sm font-semibold text-slate-900 marker:hidden">
        <span className="inline-flex items-center gap-2">
          <span>Détail des segments</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {segments.length}
          </span>
        </span>
      </summary>
      <ol
        className="max-h-72 overflow-y-auto border-t border-slate-100"
        onMouseLeave={() => onHighlight(null)}
      >
        {segments.map((s, idx) => {
          const meta = CATEGORY_META[s.category]
          const active = highlightedIdx === idx
          return (
            <li
              key={idx}
              onMouseEnter={() => onHighlight(idx)}
              onClick={() => onHighlight(active ? null : idx)}
              className={`flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 text-xs last:border-b-0 ${
                active ? 'bg-blue-50' : 'hover:bg-slate-50'
              }`}
            >
              <span
                className="h-3 w-1 shrink-0 rounded-sm"
                style={{ backgroundColor: meta.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-900">{meta.label}</div>
                <div className="truncate text-slate-500">
                  {[s.primaryHighway, s.surface].filter(Boolean).join(' · ') ||
                    '—'}
                </div>
              </div>
              <div className="text-right tabular-nums">
                <div className="font-medium text-slate-900">
                  {formatDistance(s.distanceM / 1000)}
                </div>
                <div className="text-slate-500">
                  {s.startKm.toFixed(1)}–{s.endKm.toFixed(1)}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </details>
  )
}

function formatPoint(p: LngLat | null): string | null {
  if (!p) return null
  return `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`
}
