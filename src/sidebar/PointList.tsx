import { useQuery } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { GripVertical, X } from 'lucide-react'
import { AddressSearch } from '../addressSearch/AddressSearch'
import type { LngLat } from '../geo/lngLat'
import { nominatimReverseQueryOptions } from '../nominatim/query'
import { pointRole, ROLE_META, roleLetter } from '../route/pointRole'
import type { RoutePoint } from '../route/point'
import { pushCameraCommandAtom } from '../state/camera'
import { usePointsParam } from '../url/params'
import { useDragReorder } from './useDragReorder'

function formatPoint(p: LngLat): string {
  return `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`
}

function usePointDisplay(p: RoutePoint): string {
  const { data } = useQuery(nominatimReverseQueryOptions(p.label ? null : p.point))
  return p.label ?? data?.shortLabel ?? formatPoint(p.point)
}

function addLabel(count: number): string {
  if (count === 0) return 'Point de départ'
  if (count === 1) return 'Point d\u2019arrivée'
  return 'Étape suivante'
}

function addPlaceholder(count: number): string {
  if (count === 0) return 'Saisir une adresse de départ…'
  if (count === 1) return 'Saisir une adresse d\u2019arrivée…'
  return 'Ajouter une étape…'
}

export function PointList() {
  const [points, setPoints] = usePointsParam()
  const pushCamera = useSetAtom(pushCameraCommandAtom)

  const drag = useDragReorder((from, to) => {
    setPoints((prev) => {
      if (from === to) return prev
      if (from < 0 || from >= prev.length) return prev
      if (to < 0 || to >= prev.length) return prev
      const next = prev.slice()
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  })

  function handleAdd(point: LngLat, label: string) {
    setPoints((prev) => [...prev, { point, label }])
    pushCamera({ type: 'flyTo', point })
  }

  function handleRemove(idx: number) {
    setPoints((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-2.5">
      {points.map((p, idx) => {
        const role = pointRole(idx, points.length)
        const meta = ROLE_META[role]
        return (
          <PointRow
            key={`${idx}-${p.point.lat}-${p.point.lng}`}
            point={p}
            role={role}
            roleLabel={meta.label}
            roleColor={meta.color}
            letter={roleLetter(role, idx)}
            highlighted={drag.isOverTarget(idx)}
            dragging={drag.isDragging(idx)}
            dragHandlers={drag.handlers(idx)}
            onRemove={() => handleRemove(idx)}
          />
        )
      })}

      <div className="rounded-xl border-2 border-dashed border-ink/20 bg-paper-soft/40 p-3.5">
        <div className="eyebrow-tight mb-2 flex items-center gap-2 text-sepia">
          <span aria-hidden className="text-rust">＋</span>
          {addLabel(points.length)}
        </div>
        <AddressSearch
          placeholder={addPlaceholder(points.length)}
          onSelect={handleAdd}
        />
        <p className="mt-2 text-[0.72rem] italic text-sepia-soft">
          …ou pointez directement sur la carte.
        </p>
      </div>
    </div>
  )
}

type PointRowProps = {
  point: RoutePoint
  role: ReturnType<typeof pointRole>
  roleLabel: string
  roleColor: string
  letter: string
  highlighted: boolean
  dragging: boolean
  dragHandlers: ReturnType<ReturnType<typeof useDragReorder>['handlers']>
  onRemove: () => void
}

function PointRow({
  point,
  roleLabel,
  roleColor,
  letter,
  highlighted,
  dragging,
  dragHandlers,
  onRemove,
}: PointRowProps) {
  const display = usePointDisplay(point)
  return (
    <div
      {...dragHandlers}
      className={`paper-card flex items-center gap-3 rounded-xl p-3 transition ${
        highlighted ? '!border-rust ring-2 ring-rust/30' : ''
      } ${dragging ? 'opacity-50' : ''}`}
    >
      <span
        className="display-serif flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-full text-base font-semibold text-paper-soft shadow-[0_2px_0_rgba(28,25,23,0.18)]"
        style={{ backgroundColor: roleColor }}
        title="Glisser pour réordonner"
      >
        {letter}
      </span>
      <div className="min-w-0 flex-1">
        <div className="eyebrow-tight flex items-center gap-1 text-sepia">
          <GripVertical size={12} className="text-sepia-soft" />
          {roleLabel}
        </div>
        <div className="mt-0.5 truncate text-[0.92rem] font-medium text-ink">
          {display}
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Retirer ce point"
        className="focus-ring grid h-8 w-8 place-items-center rounded-full text-sepia-soft transition hover:bg-burgundy/10 hover:text-burgundy"
      >
        <X size={16} />
      </button>
    </div>
  )
}
