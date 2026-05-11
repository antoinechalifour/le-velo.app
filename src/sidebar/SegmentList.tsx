import { useAtom } from 'jotai'
import { formatDistance } from '../format/format'
import { CATEGORY_META } from '../route/segmentCategory'
import type { Segment } from '../route/segments'
import { highlightedSegmentIdxAtom } from '../state/highlight'

export function SegmentList({ segments }: { segments: Segment[] }) {
  const [highlightedIdx, setHighlightedIdx] = useAtom(highlightedSegmentIdxAtom)

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
        onMouseLeave={() => setHighlightedIdx(null)}
      >
        {segments.map((s, idx) => {
          const meta = CATEGORY_META[s.category]
          const active = highlightedIdx === idx
          return (
            <li
              key={idx}
              onMouseEnter={() => setHighlightedIdx(idx)}
              onClick={() => setHighlightedIdx(active ? null : idx)}
              className={`flex cursor-pointer items-center gap-3 border-b border-ink/8 px-4 py-2.5 transition last:border-b-0 ${
                active ? 'bg-rust/8' : 'hover:bg-paper-deep/40'
              }`}
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
                  {[s.primaryHighway, s.surface].filter(Boolean).join(' · ') ||
                    '—'}
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
