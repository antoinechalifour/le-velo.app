import { useAtom } from 'jotai'
import { formatDistance } from '../format/format'
import { useTouchScrubX } from '../hooks/useTouchScrubX'
import { pointAtDistance, type ElevationPoint } from '../route/elevation'
import { SURFACE_META, SURFACE_ORDER } from '../route/surface'
import {
  bandIdxAtDistance,
  surfaceTotals,
  type SurfaceBand,
} from '../route/surfaceBands'
import { routeHoverAtom } from '../state/hover'

export function SurfaceBands({
  bands,
  profile,
}: {
  bands: SurfaceBand[]
  profile: ElevationPoint[]
}) {
  const [hover, setHover] = useAtom(routeHoverAtom)
  const total = bands.length > 0 ? bands[bands.length - 1].endM : 0

  function setHoverAtT(t: number) {
    if (total <= 0) return
    const distanceM = Math.max(0, Math.min(1, t)) * total
    const p = pointAtDistance(profile, distanceM)
    if (!p) return
    setHover({ distanceM: p.distanceM, point: p.point })
  }

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    setHoverAtT((e.clientX - rect.left) / rect.width)
  }

  const touchHandlers = useTouchScrubX<HTMLDivElement>({
    onScrub: setHoverAtT,
    onEnd: () => setHover(null),
    getTick: (t) => bandIdxAtDistance(bands, t * total),
  })

  if (bands.length === 0 || total <= 0) return null

  const totals = surfaceTotals(bands)
  const legend = SURFACE_ORDER.filter((c) => (totals[c] ?? 0) > 0)
  const activeIdx =
    hover !== null ? bandIdxAtDistance(bands, hover.distanceM) : null
  const markerPct =
    hover !== null
      ? Math.max(0, Math.min(1, hover.distanceM / total)) * 100
      : null
  const activeBand = activeIdx !== null ? bands[activeIdx] : null

  return (
    <div className="paper-card rounded-xl p-4">
      <div className="mb-2 flex items-baseline justify-between">
        {activeBand ? (
          <span className="text-[0.78rem] text-ink">
            <span className="font-medium">
              {SURFACE_META[activeBand.category].label}
            </span>
            {activeBand.rawSurface && (
              <span className="ml-1.5 text-sepia">
                ({activeBand.rawSurface})
              </span>
            )}
            <span className="numeral ml-2 text-sepia">
              {formatDistance((hover?.distanceM ?? 0) / 1000)}
            </span>
          </span>
        ) : (
          <span className="text-[0.78rem] text-ink">
            survol pour détailler
          </span>
        )}
        <span className="eyebrow-tight text-sepia-soft">Revêtement</span>
      </div>
      <div
        className="relative h-4 w-full cursor-crosshair touch-none overflow-hidden rounded-full border border-ink/15 bg-paper-deep"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
        {...touchHandlers}
      >
        <div className="flex h-full w-full">
          {bands.map((b, idx) => {
            const meta = SURFACE_META[b.category]
            return (
              <div
                key={idx}
                style={{
                  width: `${(b.distanceM / total) * 100}%`,
                  backgroundColor: meta.color,
                  pointerEvents: 'none',
                }}
              />
            )
          })}
        </div>
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
      <ul className="mt-4 space-y-2.5">
        {legend.map((cat) => {
          const meta = SURFACE_META[cat]
          const dist = totals[cat]!
          return (
            <li key={cat} className="flex items-start gap-2.5">
              <span
                className="mt-1 h-3 w-3 shrink-0 rounded-sm ring-1 ring-ink/20"
                style={{ backgroundColor: meta.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[0.86rem] font-medium text-ink">
                    {meta.label}
                  </span>
                  <span className="flex items-baseline gap-2.5">
                    <span className="numeral text-[0.95rem] font-semibold text-ink">
                      {((dist / total) * 100).toFixed(0)}
                      <span className="text-[0.7rem] text-sepia">%</span>
                    </span>
                    <span className="numeral w-16 text-right text-[0.72rem] text-sepia">
                      {formatDistance(dist / 1000)}
                    </span>
                  </span>
                </div>
                <div className="text-[0.72rem] leading-snug text-sepia-soft">
                  {meta.description}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
