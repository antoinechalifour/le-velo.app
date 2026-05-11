import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatSpeed,
} from '../format/format'
import type { RouteResult } from '../route/route'

export function Stats({ route }: { route: RouteResult }) {
  const avgSpeed = formatSpeed(route.stats.distanceKm, route.stats.durationMin)
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Itinéraire</h2>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Distance" value={formatDistance(route.stats.distanceKm)} />
        <Stat
          label="Durée estimée"
          value={formatDuration(route.stats.durationMin)}
        />
        <Stat label="D+ (montée)" value={formatElevation(route.stats.ascentM)} />
        <Stat
          label="D− (descente)"
          value={formatElevation(route.stats.descentM)}
        />
      </dl>
      {avgSpeed && (
        <p className="mt-3 text-xs text-slate-500">
          Vitesse moyenne estimée :{' '}
          <span className="font-medium text-slate-700">{avgSpeed}</span>. Le
          moteur BRouter pondère cette vitesse selon le type de voie, la pente
          et le profil sélectionné — c'est une estimation, pas une cible.
        </p>
      )}
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
      <dt className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 font-semibold text-slate-900">{value}</dd>
    </div>
  )
}
