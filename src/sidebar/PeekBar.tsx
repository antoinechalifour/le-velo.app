import { useAtom } from 'jotai'
import {
  ChevronDown,
  MapPin,
  MoveUpRight,
  TriangleAlert,
} from 'lucide-react'
import { formatDistance, formatDuration, formatElevation } from '../format/format'
import { sheetOpenAtom } from '../state/sheet'
import { Logo } from './Logo'
import type { PeekStatus } from './peekStatus'

const PEEK_HEIGHT = '5.5rem'

export function PeekBar({ status }: { status: PeekStatus }) {
  const [open, setOpen] = useAtom(sheetOpenAtom)

  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-label={open ? 'Fermer le panneau' : 'Ouvrir le panneau'}
      className="flex shrink-0 flex-col items-stretch border-b border-ink/15 bg-paper-soft md:hidden"
      style={{ height: PEEK_HEIGHT }}
    >
      <div className="flex items-center justify-center pt-2 pb-1">
        <span className="block h-1 w-10 rounded-full bg-ink/25" />
      </div>
      <div className="flex flex-1 items-center gap-3 px-4 pb-3 text-left">
        <PeekIcon status={status} />
        <PeekText status={status} />
        <ChevronDown
          size={20}
          className={`shrink-0 text-sepia transition-transform ${
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
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full'
  if (status.kind === 'route') {
    return (
      <span className={`${cls} bg-forest text-paper-soft`}>
        <MoveUpRight size={16} />
      </span>
    )
  }
  if (status.kind === 'error') {
    return (
      <span className={`${cls} bg-burgundy/15 text-burgundy`}>
        <TriangleAlert size={16} />
      </span>
    )
  }
  if (status.kind === 'fetching') {
    return (
      <span className={`${cls} bg-rust/15 text-rust`}>
        <Logo spinning className="h-6 w-6" />
      </span>
    )
  }
  return (
    <span className={`${cls} bg-rust/15 text-rust`}>
      <MapPin size={16} />
    </span>
  )
}

function PeekText({ status }: { status: PeekStatus }) {
  if (status.kind === 'route') {
    const r = status.route
    return (
      <div className="min-w-0 flex-1">
        <div className="numeral truncate text-base font-semibold text-ink">
          {formatDistance(r.stats.distanceKm)}
          <span className="mx-1.5 text-sepia-soft">·</span>
          {formatDuration(r.stats.durationMin)}
        </div>
        <div className="numeral truncate text-[0.72rem] text-sepia">
          ↗ {formatElevation(r.stats.ascentM)}
          <span className="mx-1.5">·</span>↘ {formatElevation(r.stats.descentM)}
        </div>
      </div>
    )
  }
  if (status.kind === 'error') {
    return (
      <div className="min-w-0 flex-1 truncate text-sm font-medium text-burgundy">
        Erreur de calcul
      </div>
    )
  }
  if (status.kind === 'fetching') {
    return (
      <div className="min-w-0 flex-1 text-sm font-medium text-ink-soft">
        Tracé en cours…
      </div>
    )
  }
  if (status.kind === 'instruction') {
    return (
      <div className="min-w-0 flex-1 truncate text-sm font-medium text-ink-soft">
        {status.text}
      </div>
    )
  }
  return (
    <div className="min-w-0 flex-1">
      <div className="display-serif text-base font-semibold leading-none text-ink">
        Le <span className="italic">Vélo</span>
      </div>
      <div className="eyebrow-tight text-rust">Itinéraires Cyclables</div>
    </div>
  )
}
