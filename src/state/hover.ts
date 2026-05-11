import { atom } from 'jotai'
import type { LngLat } from '../geo/lngLat'

export type RouteHover = {
  distanceM: number
  point: LngLat
} | null

export const routeHoverAtom = atom<RouteHover>(null)
