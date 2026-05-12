import { useRef, useState } from 'react'
import { formatDistance, formatElevation } from '../format/format'
import { useHaptics } from '../hooks/useHaptics'
import {
  usePointsParam,
  useProfileParam,
  useSelectedRouteParam,
} from '../url/params'
import { exportItineraries, parseImportFile } from './exportImport'
import {
  useDeleteItinerary,
  useImportItineraries,
  useSavedItineraries,
} from './query'
import type { SavedItinerary } from './types'

export function SavedItineraries() {
  const { data: itineraries = [] } = useSavedItineraries()
  const importMut = useImportItineraries()
  const deleteMut = useDeleteItinerary()
  const fileRef = useRef<HTMLInputElement>(null)
  const [, setPoints] = usePointsParam()
  const [, setProfile] = useProfileParam()
  const [, setSelectedIdx] = useSelectedRouteParam()
  const haptic = useHaptics()
  const [importError, setImportError] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState<number | null>(null)

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError(null)
    setImportedCount(null)
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const list = await parseImportFile(file)
      await importMut.mutateAsync(list)
      setImportedCount(list.length)
      haptic('success')
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'Fichier illisible',
      )
      haptic('error')
    }
  }

  function handleLoad(it: SavedItinerary) {
    haptic('selection')
    setProfile(it.profile)
    setSelectedIdx(0)
    setPoints(it.points)
  }

  function handleDelete(it: SavedItinerary) {
    if (!confirm(`Supprimer « ${it.name} » ?`)) return
    haptic('warning')
    deleteMut.mutate(it.id)
  }

  const hasItems = itineraries.length > 0

  return (
    <div className="paper-card flex flex-col overflow-hidden rounded-xl">
      <div className="flex items-center justify-between gap-2 border-b border-ink/10 px-4 py-2.5">
        <span className="eyebrow-tight text-sepia">
          {hasItems ? `${itineraries.length} enregistré${itineraries.length > 1 ? 's' : ''}` : 'Aucun itinéraire'}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="focus-ring eyebrow-tight rounded-full border border-ink/25 bg-paper-soft px-2.5 py-1 text-[0.65rem] text-ink-soft"
          >
            ↑ Importer
          </button>
          <button
            type="button"
            onClick={() => {
              haptic('soft')
              exportItineraries()
            }}
            disabled={!hasItems}
            className="focus-ring eyebrow-tight rounded-full border border-ink/25 bg-paper-soft px-2.5 py-1 text-[0.65rem] text-ink-soft disabled:opacity-40"
          >
            ↓ Exporter
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </div>

      {importError && (
        <div className="border-b border-burgundy/30 bg-burgundy/8 px-4 py-2 text-[0.75rem] text-burgundy">
          Import impossible : {importError}
        </div>
      )}
      {importedCount !== null && (
        <div className="border-b border-forest/30 bg-forest/8 px-4 py-2 text-[0.75rem] text-forest">
          {importedCount} itinéraire{importedCount > 1 ? 's' : ''} importé{importedCount > 1 ? 's' : ''}.
        </div>
      )}

      {hasItems ? (
        <ul className="divide-y divide-ink/8">
          {itineraries.map((it) => (
            <li key={it.id}>
              <ItineraryRow
                it={it}
                onLoad={() => handleLoad(it)}
                onDelete={() => handleDelete(it)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-4 text-[0.78rem] text-sepia">
          Tracez un itinéraire puis touchez{' '}
          <span className="text-ink-soft">Enregistrer l’itinéraire</span> dans
          le carnet de route pour le retrouver ici.
        </p>
      )}
    </div>
  )
}

function ItineraryRow({
  it,
  onLoad,
  onDelete,
}: {
  it: SavedItinerary
  onLoad: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-stretch">
      <button
        type="button"
        onClick={onLoad}
        className="focus-ring flex flex-1 flex-col items-start gap-0.5 px-4 py-3 text-left hover:bg-paper-deep/30"
      >
        <span className="display-serif truncate text-[1rem] font-medium leading-tight text-ink">
          {it.name}
        </span>
        <span className="numeral flex items-center gap-1.5 text-[0.72rem] text-sepia">
          {it.stats && <>{formatDistance(it.stats.distanceKm)}</>}
          {it.stats && <span className="text-sepia-soft">·</span>}
          {it.stats && <>↗ {formatElevation(it.stats.ascentM)}</>}
          {it.stats && <span className="text-sepia-soft">·</span>}
          <span>{formatRelativeDate(it.createdAt)}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Supprimer"
        className="focus-ring border-l border-ink/10 px-3 text-sepia hover:bg-burgundy/10 hover:text-burgundy"
      >
        ✕
      </button>
    </div>
  )
}

function formatRelativeDate(epoch: number): string {
  const d = new Date(epoch)
  const now = new Date()
  const sameDay =
    d.toDateString() === now.toDateString()
  if (sameDay) {
    return d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  const sameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}
