import type { FeatureCollection } from 'geojson'
import type {
  BreakdownEntry,
  Segment,
} from './lib/segments'

export type LngLat = {
  lng: number
  lat: number
}

export type Endpoint = 'start' | 'end'

export type RouteStats = {
  distanceKm: number
  ascentM: number
  descentM: number
  durationMin: number
}

export type RouteResult = {
  geojson: FeatureCollection
  segmentsGeoJson: FeatureCollection
  segments: Segment[]
  breakdown: BreakdownEntry[]
  stats: RouteStats
  rawGpxUrl: string
}
