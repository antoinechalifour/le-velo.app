import { atom } from 'jotai'
import type { LngLat } from '../geo/lngLat'

export const userLocationAtom = atom<LngLat | null>(null)
