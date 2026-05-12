import { type DBSchema, type IDBPDatabase, openDB } from 'idb'
import type { SavedItinerary } from './types'

const DB_NAME = 'velo-maps'
const DB_VERSION = 1
const STORE = 'itineraries'

interface VeloMapsDB extends DBSchema {
  itineraries: {
    key: string
    value: SavedItinerary
    indexes: { byCreatedAt: number }
  }
}

let dbPromise: Promise<IDBPDatabase<VeloMapsDB>> | null = null

function getDb(): Promise<IDBPDatabase<VeloMapsDB>> {
  if (!dbPromise) {
    dbPromise = openDB<VeloMapsDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' })
          store.createIndex('byCreatedAt', 'createdAt')
        }
      },
    })
  }
  return dbPromise
}

export async function listItineraries(): Promise<SavedItinerary[]> {
  const db = await getDb()
  const all = await db.getAllFromIndex(STORE, 'byCreatedAt')
  return all.reverse()
}

export async function putItinerary(it: SavedItinerary): Promise<void> {
  const db = await getDb()
  await db.put(STORE, it)
}

export async function deleteItinerary(id: string): Promise<void> {
  const db = await getDb()
  await db.delete(STORE, id)
}

export async function bulkPutItineraries(
  list: SavedItinerary[],
): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(STORE, 'readwrite')
  await Promise.all([...list.map((it) => tx.store.put(it)), tx.done])
}
