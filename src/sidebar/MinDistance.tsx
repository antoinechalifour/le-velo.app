import { useMemo } from 'react'
import { formatDistance } from '../format/format'
import { useHaptics } from '../hooks/useHaptics'
import { geoDistanceKm } from '../route/detour'
import { useMinDistanceParam, usePointsParam } from '../url/params'

const MIN_FACTOR = 1.5 // au moins 1.5× la distance directe
const MAX_FACTOR = 6 // jusqu'à 6× la distance directe

function clampToStep(km: number, step: number): number {
  return Math.round(km / step) * step
}

export function MinDistance() {
  const [points] = usePointsParam()
  const [minKm, setMinKm] = useMinDistanceParam()
  const haptic = useHaptics()

  const direct = useMemo(() => {
    if (points.length !== 2) return null
    return geoDistanceKm(points[0].point, points[1].point)
  }, [points])

  if (points.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink/15 bg-paper-soft/40 px-4 py-3 text-[0.78rem] italic text-sepia-soft">
        Saisissez d'abord un départ et une arrivée.
      </p>
    )
  }

  if (points.length !== 2 || !direct) {
    return (
      <p className="rounded-xl border border-dashed border-ink/15 bg-paper-soft/40 px-4 py-3 text-[0.78rem] italic text-sepia-soft">
        Uniquement disponible pour un trajet A → B sans étape intermédiaire.
      </p>
    )
  }

  const active = minKm > 0
  const lower = Math.max(Math.ceil(direct * MIN_FACTOR), Math.ceil(direct) + 1)
  const upper = Math.max(lower + 5, Math.ceil(direct * MAX_FACTOR))
  const step = upper - lower >= 60 ? 5 : 1
  const sliderValue = active
    ? Math.min(Math.max(minKm, lower), upper)
    : lower

  function toggle() {
    haptic('selection')
    if (active) {
      setMinKm(0)
    } else {
      setMinKm(clampToStep(lower, step))
    }
  }

  function setKm(km: number) {
    setMinKm(clampToStep(km, step))
  }

  return (
    <div className="paper-card rounded-xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="eyebrow-tight text-rust">Distance minimum</div>
          <p className="mt-0.5 text-[0.78rem] leading-relaxed text-sepia">
            Force un détour pour atteindre une distance cible.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          onClick={toggle}
          className={`focus-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
            active
              ? 'border-forest bg-forest'
              : 'border-ink/25 bg-paper-soft'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-paper-soft shadow transition-transform ${
              active ? 'translate-x-6' : 'translate-x-1'
            } ${active ? 'bg-paper-soft' : 'bg-ink/60'}`}
          />
        </button>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-ink/10 pt-3">
        <div>
          <div className="eyebrow-tight text-sepia">Distance directe</div>
          <div className="numeral mt-0.5 text-sm font-semibold text-ink-soft">
            {formatDistance(direct)}
          </div>
        </div>
        {active && (
          <div className="text-right">
            <div className="eyebrow-tight text-sepia">Cible</div>
            <div className="numeral mt-0.5 text-base font-semibold text-forest">
              {formatDistance(sliderValue)}
            </div>
          </div>
        )}
      </div>

      {active && (
        <div className="mt-3">
          <input
            type="range"
            min={lower}
            max={upper}
            step={step}
            value={sliderValue}
            onChange={(e) => setKm(Number(e.target.value))}
            className="w-full accent-forest"
            aria-label="Distance minimum cible en kilomètres"
          />
          <div className="mt-1 flex justify-between text-[0.7rem] text-sepia-soft">
            <span className="numeral">{lower} km</span>
            <span className="numeral">{upper} km</span>
          </div>
          <p className="mt-2 text-[0.72rem] italic text-sepia-soft">
            Détours générés à gauche et à droite du milieu du trajet. Tolérance ±10 %.
          </p>
        </div>
      )}
    </div>
  )
}
