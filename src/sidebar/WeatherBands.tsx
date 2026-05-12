import { useAtom } from 'jotai'
import { ArrowUp } from 'lucide-react'
import { useMemo } from 'react'
import { Logo } from './Logo'
import { formatDistance, formatDuration } from '../format/format'
import { pointAtDistance, type ElevationPoint } from '../route/elevation'
import type { RouteResult } from '../route/route'
import { routeHoverAtom } from '../state/hover'
import { WEATHER_META } from '../weather/code'
import { useRouteWeather } from '../weather/query'
import {
  WIND_CLASS_META,
  type WeatherPoint,
  type WindClass,
} from '../weather/route'

const HOUR_FORMAT = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
})

function formatHour(ms: number): string {
  return HOUR_FORMAT.format(new Date(ms))
}

export function WeatherBands({ route }: { route: RouteResult }) {
  const { data, isFetching, error } = useRouteWeather(route)

  if (error) {
    return (
      <div className="rounded-lg border border-burgundy/30 bg-burgundy/8 px-4 py-3 text-[0.78rem] text-burgundy">
        Impossible de récupérer la météo. {error.message}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="paper-card flex items-center gap-3 rounded-xl px-4 py-3 text-sm">
        <Logo spinning={isFetching} className="h-5 w-5 text-forest" />
        <span className="font-medium text-ink-soft">
          Consultation du bulletin météo…
        </span>
      </div>
    )
  }

  return <WeatherFrise weather={data} profile={route.elevationProfile} />
}

function WeatherFrise({
  weather,
  profile,
}: {
  weather: WeatherPoint[]
  profile: ElevationPoint[]
}) {
  const [hover, setHover] = useAtom(routeHoverAtom)
  const last = profile[profile.length - 1]
  const total = last?.distanceM ?? 0
  if (weather.length === 0 || total <= 0) return null

  const activeIdx =
    hover !== null ? bandIdxAtDistance(weather.length, total, hover.distanceM) : null
  const activeWp = activeIdx !== null ? weather[activeIdx] : null
  const markerPct =
    hover !== null
      ? Math.max(0, Math.min(1, hover.distanceM / total)) * 100
      : null

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const t = (e.clientX - rect.left) / rect.width
    const clamped = Math.max(0, Math.min(1, t))
    const distanceM = clamped * total
    const p = pointAtDistance(profile, distanceM)
    if (!p) return
    setHover({ distanceM: p.distanceM, point: p.point })
  }

  const cellWidthPct = 100 / weather.length

  return (
    <div className="paper-card rounded-xl p-4">
      <div className="mb-2 flex items-baseline justify-between">
        {activeWp ? (
          <span className="text-[0.78rem] text-ink">
            <span className="font-medium">
              {WEATHER_META[activeWp.condition].label}
            </span>
            <span className="numeral ml-1.5 text-sepia">
              · {Math.round(activeWp.sample.temperatureC)}°
            </span>
            <span className="numeral ml-1.5 text-sepia">
              · {formatHour(activeWp.timeMs)}
            </span>
          </span>
        ) : (
          <span className="text-[0.78rem] italic text-sepia-soft">
            survol pour détailler
          </span>
        )}
        <span className="eyebrow-tight text-sepia-soft">Météo en chemin</span>
      </div>

      <div
        className="relative cursor-crosshair"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <div className="relative flex h-[5.25rem] w-full overflow-hidden rounded-lg border border-ink/15">
          {weather.map((w, i) => {
            const meta = WEATHER_META[w.condition]
            const windMeta = WIND_CLASS_META[w.windClass]
            const rotation = ((w.windRelativeDeg + 180) % 360 + 360) % 360
            const isActive = activeIdx === i
            return (
              <div
                key={i}
                className="flex flex-1 flex-col items-center justify-between py-1.5 transition-colors"
                style={{
                  width: `${cellWidthPct}%`,
                  backgroundColor: meta.color,
                  borderRight:
                    i < weather.length - 1
                      ? '1px solid rgba(28,25,23,0.10)'
                      : undefined,
                  opacity: activeIdx === null || isActive ? 1 : 0.78,
                }}
              >
                <div
                  aria-hidden
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    color: windMeta.color,
                    lineHeight: 0,
                  }}
                >
                  <ArrowUp size={18} strokeWidth={2.5} />
                </div>
                <span
                  className="numeral text-[0.62rem]"
                  style={{ color: windMeta.color }}
                >
                  {Math.round(w.sample.windSpeedKmh)}
                </span>
                <span className="numeral text-[0.86rem] font-semibold text-ink">
                  {Math.round(w.sample.temperatureC)}°
                </span>
              </div>
            )
          })}
          {markerPct !== null && (
            <div
              className="pointer-events-none absolute top-0 bottom-0"
              style={{
                left: `${markerPct}%`,
                transform: 'translateX(-50%)',
                width: '2px',
                backgroundColor: '#1c1917',
                boxShadow:
                  '0 0 0 1px rgba(251,246,233,0.85), 0 1px 2px rgba(28,25,23,0.4)',
              }}
            />
          )}
        </div>

        <PrecipStrip points={weather} />
      </div>

      <div className="numeral mt-1.5 flex justify-between text-[0.7rem] text-sepia">
        <span>
          <span className="eyebrow-tight mr-1 text-sepia-soft">Départ</span>
          {formatHour(weather[0].timeMs)}
        </span>
        <span>
          <span className="eyebrow-tight mr-1 text-sepia-soft">Arrivée</span>
          {formatHour(weather[weather.length - 1].timeMs)}
        </span>
      </div>

      <DetailRow weather={weather} activeWp={activeWp} total={total} />
    </div>
  )
}

function DetailRow({
  weather,
  activeWp,
  total,
}: {
  weather: WeatherPoint[]
  activeWp: WeatherPoint | null
  total: number
}) {
  const summary = useMemo(() => {
    if (weather.length === 0) return null
    let maxWind = 0
    let sumPrec = 0
    const counts: Record<WindClass, number> = { face: 0, travers: 0, dos: 0 }
    for (const w of weather) {
      if (w.sample.windSpeedKmh > maxWind) maxWind = w.sample.windSpeedKmh
      sumPrec += w.sample.precipitationMm
      counts[w.windClass]++
    }
    let dominant: WindClass = 'travers'
    let bestCount = -1
    for (const k of Object.keys(counts) as WindClass[]) {
      if (counts[k] > bestCount) {
        bestCount = counts[k]
        dominant = k
      }
    }
    const durationH = Math.max(
      0,
      (weather[weather.length - 1].timeMs - weather[0].timeMs) / 3_600_000,
    )
    const avgPrec = sumPrec / weather.length
    const cumMm = avgPrec * Math.max(durationH, 0.5)
    return { maxWind, dominant, cumMm, durationH }
  }, [weather])

  return (
    <div className="mt-3 grid min-h-[3.4rem] grid-cols-3 gap-3">
      {activeWp ? (
        <>
          <Stat
            label="Vent"
            value={`${Math.round(activeWp.sample.windSpeedKmh)} km/h`}
            sub={WIND_CLASS_META[activeWp.windClass].label}
            color={WIND_CLASS_META[activeWp.windClass].color}
          />
          <Stat
            label="Précipitations"
            value={`${activeWp.sample.precipitationMm.toFixed(1)} mm`}
            sub={
              activeWp.sample.precipitationMm > 0.1
                ? 'sur 1 h'
                : 'rien à signaler'
            }
          />
          <Stat
            label="Au km"
            value={formatDistance(activeWp.distanceM / 1000)}
            sub={formatHour(activeWp.timeMs)}
          />
        </>
      ) : summary ? (
        <>
          <Stat
            label="Vent dominant"
            value={`${Math.round(summary.maxWind)} km/h`}
            sub={WIND_CLASS_META[summary.dominant].label}
            color={WIND_CLASS_META[summary.dominant].color}
          />
          <Stat
            label="Précipitations"
            value={
              summary.cumMm < 0.1
                ? '0 mm'
                : `≈ ${summary.cumMm.toFixed(1)} mm`
            }
            sub={summary.cumMm < 0.1 ? 'trajet au sec' : 'cumul attendu'}
          />
          <Stat
            label="Trajet"
            value={formatDistance(total / 1000)}
            sub={
              summary.durationH > 0
                ? formatDuration(summary.durationH * 60)
                : '—'
            }
          />
        </>
      ) : null}
    </div>
  )
}

function bandIdxAtDistance(
  count: number,
  total: number,
  distanceM: number,
): number {
  if (count === 0 || total <= 0) return 0
  const t = Math.max(0, Math.min(0.999_999, distanceM / total))
  return Math.min(count - 1, Math.floor(t * count))
}

function PrecipStrip({ points }: { points: WeatherPoint[] }) {
  const cellWidthPct = 100 / points.length
  const hasAny = points.some((p) => p.sample.precipitationMm > 0.05)
  return (
    <div className="mt-1 flex h-1.5 w-full overflow-hidden rounded-full border border-ink/15 bg-paper-deep">
      {points.map((p, i) => {
        const mm = p.sample.precipitationMm
        const intensity = Math.min(1, mm / 3)
        const alpha = mm <= 0.05 ? 0 : 0.25 + intensity * 0.75
        return (
          <div
            key={i}
            style={{
              width: `${cellWidthPct}%`,
              backgroundColor:
                alpha === 0 ? 'transparent' : `rgba(63, 100, 120, ${alpha})`,
              pointerEvents: 'none',
            }}
            title={hasAny ? `${mm.toFixed(1)} mm/h` : undefined}
          />
        )
      })}
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub?: string
  color?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="eyebrow-tight text-sepia-soft"
        style={{ fontSize: '0.6rem' }}
      >
        {label}
      </span>
      <span
        className="numeral text-[0.92rem] font-semibold"
        style={{ color: color ?? 'var(--color-ink)' }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[0.68rem] leading-tight text-sepia">{sub}</span>
      )}
    </div>
  )
}
