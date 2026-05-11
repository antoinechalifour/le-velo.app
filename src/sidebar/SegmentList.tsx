import { useAtom } from 'jotai'
import { formatDistance } from '../format/format'
import { CATEGORY_META } from '../route/segmentCategory'
import type { Segment } from '../route/segments'
import { highlightedSegmentIdxAtom } from '../state/highlight'

export function SegmentList({ segments }: { segments: Segment[] }) {
  const [highlightedIdx, setHighlightedIdx] = useAtom(highlightedSegmentIdxAtom)

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
