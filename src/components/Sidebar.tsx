import {
  PROFILES,
  type LngLat,
  type RouteResult,
  type RoutingProfile,
} from '../types'
import { formatDistance, formatDuration, formatElevation } from '../lib/format'
import {
  CATEGORY_META,
  type BreakdownEntry,
  type Segment,
} from '../lib/segments'
import { AddressSearch } from './AddressSearch'

type SidebarProps = {
  start: LngLat | null
  end: LngLat | null
  startLabel: string | null
  endLabel: string | null
  profile: RoutingProfile
  routes: RouteResult[]
  selectedRouteIdx: number
  isFetching: boolean
  error: Error | null
  highlightedSegmentIdx: number | null
  sheetOpen: boolean
  onToggleSheet: () => void
  onProfileChange: (profile: RoutingProfile) => void
  onSelectRoute: (idx: number) => void
  onHighlightSegment: (idx: number | null) => void
  onSelectStart: (point: LngLat, label: string) => void
  onSelectEnd: (point: LngLat, label: string) => void
  onClearStart: () => void
  onClearEnd: () => void
  onReset: () => void
}

const PEEK_HEIGHT = '5.5rem'

export function Sidebar({
  start,
  end,
  startLabel,
  endLabel,
  profile,
  routes,
  selectedRouteIdx,
  isFetching,
  error,
  highlightedSegmentIdx,
  sheetOpen,
  onToggleSheet,
  onProfileChange,
  onSelectRoute,
  onHighlightSegment,
  onSelectStart,
  onSelectEnd,
  onClearStart,
  onClearEnd,
  onReset,
}: SidebarProps) {
  const selectedRoute = routes[selectedRouteIdx] ?? null
  const peekStatus = computePeekStatus(
    start,
    end,
    selectedRoute,
    isFetching,
    error,
  )

  return (
    <aside
      className={`
        fixed bottom-0 left-0 right-0 z-10 flex h-[85dvh] max-h-[85dvh] flex-col
        overflow-hidden rounded-t-2xl bg-white shadow-2xl
        transition-transform duration-300 ease-out
        md:static md:h-full md:max-h-none md:w-96 md:translate-y-0 md:rounded-none
        md:border-r md:border-slate-200 md:shadow-none md:transition-none
      `}
      style={
        sheetOpen
          ? undefined
          : { transform: `translateY(calc(100% - ${PEEK_HEIGHT}))` }
      }
    >
      <PeekBar
        status={peekStatus}
        sheetOpen={sheetOpen}
        onToggle={onToggleSheet}
      />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 pt-2 md:pt-5">
        <header className="hidden md:block">
          <h1 className="text-xl font-semibold text-slate-900">Velo Maps</h1>
          <p className="mt-1 text-sm text-slate-500">
            Itinéraires vélo orientés voies cyclables référencées (OSM +
            BRouter).
          </p>
        </header>

        <ProfilePicker value={profile} onChange={onProfileChange} />

        <AddressField
          index={1}
          label="Point de départ"
          active={!start}
          point={start}
          pointLabel={startLabel}
          placeholder="Saisir une adresse de départ…"
          onSelect={onSelectStart}
          onClear={onClearStart}
        />
        <AddressField
          index={2}
          label="Point d'arrivée"
          active={!!start && !end}
          point={end}
          pointLabel={endLabel}
          placeholder="Saisir une adresse d'arrivée…"
          onSelect={onSelectEnd}
          onClear={onClearEnd}
        />

        {isFetching && (
          <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
            Calcul des itinéraires…
          </p>
        )}

        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error.message}
          </p>
        )}

        {routes.length > 1 && (
          <Alternatives
            routes={routes}
            selectedIdx={selectedRouteIdx}
            onSelect={onSelectRoute}
          />
        )}

        {selectedRoute && (
          <>
            <Stats route={selectedRoute} />
            {selectedRoute.breakdown.length > 0 && (
              <Composition breakdown={selectedRoute.breakdown} />
            )}
            {selectedRoute.segments.length > 0 && (
              <SegmentList
                segments={selectedRoute.segments}
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
      </div>
    </aside>
  )
}

type PeekStatus =
  | { kind: 'idle' }
  | { kind: 'instruction'; text: string }
  | { kind: 'fetching' }
  | { kind: 'error' }
  | { kind: 'route'; route: RouteResult }

function computePeekStatus(
  start: LngLat | null,
  end: LngLat | null,
  route: RouteResult | null,
  isFetching: boolean,
  error: Error | null,
): PeekStatus {
  if (error) return { kind: 'error' }
  if (isFetching) return { kind: 'fetching' }
  if (route) return { kind: 'route', route }
  if (!start) {
    return { kind: 'instruction', text: 'Posez le départ sur la carte' }
  }
  if (!end) {
    return { kind: 'instruction', text: 'Posez l\u2019arrivée sur la carte' }
  }
  return { kind: 'idle' }
}

function PeekBar({
  status,
  sheetOpen,
  onToggle,
}: {
  status: PeekStatus
  sheetOpen: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={sheetOpen ? 'Fermer le panneau' : 'Ouvrir le panneau'}
      className="flex shrink-0 flex-col items-stretch border-b border-slate-100 md:hidden"
      style={{ height: PEEK_HEIGHT }}
    >
      <div className="flex items-center justify-center pt-2 pb-1">
        <span className="block h-1 w-10 rounded-full bg-slate-300" />
      </div>
      <div className="flex flex-1 items-center gap-3 px-4 pb-3 text-left">
        <PeekIcon status={status} />
        <PeekText status={status} />
        <ChevronIcon open={sheetOpen} />
      </div>
    </button>
  )
}

function PeekIcon({ status }: { status: PeekStatus }) {
  const cls =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold'
  if (status.kind === 'route') {
    return <span className={`${cls} bg-slate-900 text-white`}>↗</span>
  }
  if (status.kind === 'error') {
    return <span className={`${cls} bg-red-100 text-red-600`}>!</span>
  }
  if (status.kind === 'fetching') {
    return (
      <span className={`${cls} bg-blue-100 text-blue-600`}>
        <span className="block h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </span>
    )
  }
  return <span className={`${cls} bg-blue-100 text-blue-600`}>📍</span>
}

function PeekText({ status }: { status: PeekStatus }) {
  if (status.kind === 'route') {
    const r = status.route
    return (
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-slate-900">
          {formatDistance(r.stats.distanceKm)} ·{' '}
          {formatDuration(r.stats.durationMin)}
        </div>
        <div className="truncate text-xs text-slate-500">
          ↑ {formatElevation(r.stats.ascentM)} · ↓{' '}
          {formatElevation(r.stats.descentM)}
        </div>
      </div>
    )
  }
  if (status.kind === 'error') {
    return (
      <div className="min-w-0 flex-1 truncate text-sm font-medium text-red-700">
        Erreur de calcul
      </div>
    )
  }
  if (status.kind === 'fetching') {
    return (
      <div className="min-w-0 flex-1 text-sm font-medium text-slate-700">
        Calcul de l&apos;itinéraire…
      </div>
    )
  }
  if (status.kind === 'instruction') {
    return (
      <div className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
        {status.text}
      </div>
    )
  }
  return (
    <div className="min-w-0 flex-1 text-sm font-medium text-slate-700">
      Velo Maps
    </div>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-slate-400 transition-transform duration-300 ${
        open ? '' : 'rotate-180'
      }`}
      aria-hidden="true"
    >
      <polyline points="6 15 12 9 18 15" />
    </svg>
  )
}

function ProfilePicker({
  value,
  onChange,
}: {
  value: RoutingProfile
  onChange: (p: RoutingProfile) => void
}) {
  const active = PROFILES.find((p) => p.id === value)
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        Type de trajet
      </h2>
      <div className="grid grid-cols-4 gap-1 rounded-md bg-slate-100 p-1">
        {PROFILES.map((p) => {
          const selected = p.id === value
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={`rounded px-2 py-1.5 text-xs font-medium transition ${
                selected
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          )
        })}
      </div>
      {active && <p className="mt-2 text-xs text-slate-500">{active.hint}</p>}
    </div>
  )
}

function Alternatives({
  routes,
  selectedIdx,
  onSelect,
}: {
  routes: RouteResult[]
  selectedIdx: number
  onSelect: (idx: number) => void
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <h2 className="mb-2 text-sm font-semibold text-slate-900">
        Variantes ({routes.length})
      </h2>
      <ul className="space-y-1.5">
        {routes.map((r, idx) => {
          const selected = idx === selectedIdx
          return (
            <li key={idx}>
              <button
                type="button"
                onClick={() => onSelect(idx)}
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

function AddressField({
  index,
  label,
  active,
  point,
  pointLabel,
  placeholder,
  onSelect,
  onClear,
}: {
  index: number
  label: string
  active: boolean
  point: LngLat | null
  pointLabel: string | null
  placeholder: string
  onSelect: (point: LngLat, label: string) => void
  onClear: () => void
}) {
  const hasValue = !!point
  const displayValue = pointLabel ?? formatPoint(point)
  return (
    <div
      className={`rounded-md border p-3 ${
        active
          ? 'border-blue-300 bg-blue-50'
          : hasValue
            ? 'border-slate-200 bg-white'
            : 'border-slate-200 bg-slate-50/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            hasValue
              ? 'bg-slate-900 text-white'
              : active
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-500'
          }`}
        >
          {index}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {label}
            </span>
            {hasValue && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                Effacer
              </button>
            )}
          </div>
          {hasValue ? (
            <div className="mt-0.5 truncate text-sm text-slate-900">
              {displayValue}
            </div>
          ) : (
            <div className="mt-1.5 space-y-1">
              <AddressSearch placeholder={placeholder} onSelect={onSelect} />
              <p className="text-[11px] text-slate-500">
                ou cliquez sur la carte
              </p>
            </div>
          )}
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
        <Stat
          label="Durée est."
          value={formatDuration(route.stats.durationMin)}
        />
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
      <dt className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </dt>
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
