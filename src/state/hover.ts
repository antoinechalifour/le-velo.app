import { atom } from 'jotai'
import type { LngLat } from '../geo/lngLat'

export type ProfileHover = {
  distanceM: number
  point: LngLat
} | null

export const profileHoverAtom = atom<ProfileHover>(null)
