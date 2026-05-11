import { useAtom } from 'jotai'
import {
  ChevronDown,
  Loader2,
  MapPin,
  MoveUpRight,
  TriangleAlert,
} from 'lucide-react'
import { formatDistance, formatDuration, formatElevation } from '../format/format'
import { sheetOpenAtom } from '../state/sheet'
import type { PeekStatus } from './peekStatus'

const PEEK_HEIGHT = '5.5rem'

export function PeekBar({ status }: { status: PeekStatus }) {
  const [open, setOpen] = useAtom(sheetOpenAtom)

  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-label={open ? 'Fermer le panneau' : 'Ouvrir le panneau'}
      className="flex shrink-0 flex-col items-stretch border-b border-slate-100 md:hidden"
      style={{ height: PEEK_HEIGHT }}
    >
      <div className="flex items-center justify-center pt-2 pb-1">
        <span className="block h-1 w-10 rounded-full bg-slate-300" />
      </div>
      <div className="flex flex-1 items-center gap-3 px-4 pb-3 text-left">
        <PeekIcon status={status} />
        <PeekText status={status} />
        <ChevronDown
          size={20}
          className={`shrink-0 text-slate-400 transition-transform duration-300 ${
            open ? '' : 'rotate-180'
          }`}
          aria-hidden="true"
        />
      </div>
    </button>
  )
}

function PeekIcon({ status }: { status: PeekStatus }) {
  const cls =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full'
  if (status.kind === 'route') {
    return (
      <span className={`${cls} bg-slate-900 text-white`}>
        <MoveUpRight size={16} />
      </span>
    )
  }
  if (status.kind === 'error') {
    return (
      <span className={`${cls} bg-red-100 text-red-600`}>
        <TriangleAlert size={16} />
      </span>
    )
  }
  if (status.kind === 'fetching') {
    return (
      <span className={`${cls} bg-blue-100 text-blue-600`}>
        <Loader2 size={16} className="animate-spin" />
      </span>
    )
  }
  return (
    <span className={`${cls} bg-blue-100 text-blue-600`}>
      <MapPin size={16} />
    </span>
  )
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
      Le Vélo
    </div>
  )
}
