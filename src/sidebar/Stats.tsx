import {
  formatDistance,
  formatDuration,
  formatElevation,
} from '../format/format'
import { Ticker } from '../format/Ticker'
import type { RouteResult } from '../route/route'

export function Stats({ route }: { route: RouteResult }) {
  const { distanceKm, durationMin, ascentM, descentM } = route.stats
  const showSpeed = durationMin > 0 && distanceKm > 0
  const kmh = showSpeed ? distanceKm / (durationMin / 60) : 0
  return (
    <div className="paper-card overflow-hidden rounded-xl">
      <div className="grid grid-cols-2 divide-x divide-ink/10 border-b border-ink/10">
        <BigStat
          label="Distance"
          rawValue={distanceKm}
          format={formatDistance}
          accent="forest"
        />
        <BigStat
          label="Durée estimée"
          rawValue={durationMin}
          format={formatDuration}
          accent="ink"
        />
      </div>
      <div className="grid grid-cols-2 divide-x divide-ink/10">
        <BigStat
          label="D+ Montée"
          rawValue={ascentM}
          format={formatElevation}
          accent="rust"
          icon="↗"
        />
        <BigStat
          label="D− Descente"
          rawValue={descentM}
          format={formatElevation}
          accent="sky"
          icon="↘"
        />
      </div>

      {showSpeed && (
        <div className="border-t border-ink/10 bg-paper-deep/40 px-4 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="eyebrow-tight text-sepia">Allure moyenne</span>
            <Ticker
              value={kmh}
              format={(n) => `${n.toFixed(1)} km/h`}
              className="numeral text-base font-semibold text-ink"
            />
          </div>
          <p className="mt-1 text-[0.72rem] leading-relaxed text-sepia">
            Estimation BRouter pondérée par type de voie et pente — boussole,
            pas chronomètre.
          </p>
        </div>
      )}

      <a
        href={route.rawGpxUrl}
        download="itineraire.gpx"
        className="focus-ring group ink-wash ink-wash--inverse flex items-center justify-between gap-2 overflow-hidden border-t-2 border-dashed border-ink/25 bg-ink px-5 py-3.5 text-paper-soft"
      >
        <span className="flex items-center gap-3">
          <span
            aria-hidden
            className="numeral inline-flex h-7 w-7 items-center justify-center rounded-full border border-paper-soft/40 text-xs"
          >
            ↓
          </span>
          <span className="eyebrow-tight text-paper-soft">
            Télécharger le GPX
          </span>
        </span>
        <span className="numeral text-[0.7rem] tracking-widest text-mustard">
          .GPX
        </span>
      </a>
    </div>
  )
}

const ACCENT: Record<string, string> = {
  forest: 'text-forest',
  ink: 'text-ink',
  rust: 'text-rust',
  sky: 'text-sky-vtg',
}

function BigStat({
  label,
  rawValue,
  format,
  accent,
  icon,
}: {
  label: string
  rawValue: number
  format: (n: number) => string
  accent: keyof typeof ACCENT | string
  icon?: string
}) {
  return (
    <div className="px-4 py-3.5">
      <div className="eyebrow-tight text-sepia">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        {icon && (
          <span className={`text-sm ${ACCENT[accent] ?? 'text-ink'}`}>
            {icon}
          </span>
        )}
        <Ticker
          value={rawValue}
          format={format}
          className={`numeral text-[1.7rem] font-semibold leading-none ${
            ACCENT[accent] ?? 'text-ink'
          }`}
        />
      </div>
    </div>
  )
}
