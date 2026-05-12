import { Check, Star } from 'lucide-react'
import { useState } from 'react'
import { useHaptics } from '../hooks/useHaptics'
import type { RoutePoint } from '../route/point'
import type { RoutingProfile } from '../route/profile'
import type { RouteResult } from '../route/route'
import { autoItineraryName } from './naming'
import { useSaveItinerary } from './query'

type Props = {
  points: RoutePoint[]
  profile: RoutingProfile
  route: RouteResult
  startName: string | null
  endName: string | null
}

export function SaveButton({
  points,
  profile,
  route,
  startName,
  endName,
}: Props) {
  const { mutateAsync, isPending } = useSaveItinerary()
  const haptic = useHaptics()
  const [savedAt, setSavedAt] = useState<number | null>(null)

  async function handleSave() {
    if (points.length < 2) return
    haptic('success')
    const now = Date.now()
    await mutateAsync({
      id: crypto.randomUUID(),
      name: autoItineraryName(points, startName, endName),
      points,
      profile,
      stats: route.stats,
      createdAt: now,
      updatedAt: now,
    })
    setSavedAt(now)
    setTimeout(() => setSavedAt((t) => (t === now ? null : t)), 1800)
  }

  const showConfirm = savedAt !== null

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={isPending}
      className="focus-ring group ink-wash flex w-full items-center justify-between gap-2 overflow-hidden border-t border-ink/15 bg-paper-soft px-5 py-3.5 text-left text-ink"
    >
      <span className="flex items-center gap-3">
        <span
          aria-hidden
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink/30"
        >
          {showConfirm ? <Check size={14} /> : <Star size={14} />}
        </span>
        <span className="eyebrow-tight text-ink">
          {showConfirm ? 'Itinéraire enregistré' : 'Enregistrer l’itinéraire'}
        </span>
      </span>
      <span className="numeral text-[0.7rem] tracking-widest text-rust">
        {showConfirm ? 'OK' : 'CARNET'}
      </span>
    </button>
  )
}
