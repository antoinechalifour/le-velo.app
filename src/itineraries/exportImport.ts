import { listItineraries } from './db'
import {
  itinerariesExportSchema,
  type ItinerariesExport,
  type SavedItinerary,
} from './types'

export async function exportItineraries(): Promise<void> {
  const itineraries = await listItineraries()
  const payload: ItinerariesExport = {
    version: 1,
    exportedAt: Date.now(),
    itineraries,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `velo-maps-itineraires-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function parseImportFile(
  file: File,
): Promise<SavedItinerary[]> {
  const text = await file.text()
  const raw = JSON.parse(text)
  const parsed = itinerariesExportSchema.parse(raw)
  return parsed.itineraries
}
