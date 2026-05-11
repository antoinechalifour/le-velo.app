import { useSetAtom } from 'jotai'
import { GripVertical, X } from 'lucide-react'
import { AddressSearch } from '../addressSearch/AddressSearch'
import type { LngLat } from '../geo/lngLat'
import { pointRole, ROLE_META, roleLetter } from '../route/pointRole'
import type { RoutePoint } from '../route/point'
import { pushCameraCommandAtom } from '../state/camera'
import { usePointsParam } from '../url/params'
import { useDragReorder } from './useDragReorder'

function formatPoint(p: LngLat): string {
  return `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`
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
    <div className="space-y-2">
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
            display={p.label ?? formatPoint(p.point)}
            highlighted={drag.isOverTarget(idx)}
            dragging={drag.isDragging(idx)}
            dragHandlers={drag.handlers(idx)}
            onRemove={() => handleRemove(idx)}
          />
        )
      })}

      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/50 p-3">
        <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
          {addLabel(points.length)}
        </div>
        <AddressSearch
          placeholder={addPlaceholder(points.length)}
          onSelect={handleAdd}
        />
        <p className="mt-1 text-[11px] text-slate-500">
          ou cliquez sur la carte
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
  display: string
  highlighted: boolean
  dragging: boolean
  dragHandlers: ReturnType<ReturnType<typeof useDragReorder>['handlers']>
  onRemove: () => void
}

function PointRow({
  roleLabel,
  roleColor,
  letter,
  display,
  highlighted,
  dragging,
  dragHandlers,
  onRemove,
}: PointRowProps) {
  return (
    <div
      {...dragHandlers}
      className={`flex items-center gap-3 rounded-md border bg-white p-3 transition ${
        highlighted ? 'border-blue-400 ring-2 ring-blue-200' : 'border-slate-200'
      } ${dragging ? 'opacity-50' : ''}`}
    >
      <span
        className="flex h-6 w-6 shrink-0 cursor-grab items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: roleColor }}
        title="Glisser pour réordonner"
      >
        {letter}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          <GripVertical size={12} className="text-slate-300" />
          {roleLabel}
        </div>
        <div className="mt-0.5 truncate text-sm text-slate-900">{display}</div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Retirer ce point"
        className="text-slate-400 hover:text-red-600"
      >
        <X size={18} />
      </button>
    </div>
  )
}
