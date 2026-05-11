import { useAtom } from 'jotai'
import { formatDistance } from '../format/format'
import { CATEGORY_META } from '../route/segmentCategory'
import {
  segmentIdxAtDistance,
  segmentMidpoint,
  type Segment,
} from '../route/segments'
import { surfaceLabel } from '../route/surface'
import { routeHoverAtom } from '../state/hover'

export function SegmentList({ segments }: { segments: Segment[] }) {
  const [hover, setHover] = useAtom(routeHoverAtom)
  const activeIdx =
    hover !== null ? segmentIdxAtDistance(segments, hover.distanceM) : null

  return (
    <details className="paper-card group overflow-hidden rounded-xl">
      <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
        <span className="flex items-center gap-2.5">
          <span className="eyebrow-tight text-ink">Voir le détail</span>
          <span className="numeral rounded-full bg-paper-deep px-2 py-0.5 text-[0.7rem] font-semibold text-sepia">
            {segments.length}
          </span>
        </span>
        <span
          aria-hidden
          className="text-sepia transition-transform group-open:rotate-90"
        >
          ›
        </span>
      </summary>
      <ol
        className="scroll-soft max-h-80 overflow-y-auto border-t border-ink/10"
        onMouseLeave={() => setHover(null)}
      >
        {segments.map((s, idx) => {
          const meta = CATEGORY_META[s.category]
          const active = activeIdx === idx
          return (
            <li
              key={idx}
              onMouseEnter={() => {
                const { distanceM, point } = segmentMidpoint(s)
                setHover({
                  distanceM,
                  point: { lng: point[0], lat: point[1] },
                })
              }}
              data-active={active}
              className="ink-wash flex cursor-pointer items-center gap-3 border-b border-ink/8 px-4 py-2.5 last:border-b-0"
            >
              <span
                className="h-8 w-1 shrink-0 rounded-sm"
                style={{ backgroundColor: meta.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[0.82rem] font-medium text-ink">
                  {meta.label}
                </div>
                <div className="truncate text-[0.72rem] text-sepia">
                  {surfaceLabel(s.surface)}
                </div>
              </div>
              <div className="numeral text-right">
                <div className="text-[0.82rem] font-semibold text-ink">
                  {formatDistance(s.distanceM / 1000)}
                </div>
                <div className="text-[0.7rem] text-sepia-soft">
                  {s.startKm.toFixed(1)}–{s.endKm.toFixed(1)} km
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </details>
  )
}
