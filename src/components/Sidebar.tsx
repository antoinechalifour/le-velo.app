import type { LngLat, RouteResult } from '../types'
import { formatDistance, formatDuration, formatElevation } from '../lib/format'

type SidebarProps = {
  start: LngLat | null
  end: LngLat | null
  route: RouteResult | null
  isFetching: boolean
  error: Error | null
  onReset: () => void
}

export function Sidebar({
  start,
  end,
  route,
  isFetching,
  error,
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

      {route && <Stats route={route} />}

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

function formatPoint(p: LngLat | null): string | null {
  if (!p) return null
  return `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`
}
