import type { FeatureCollection } from 'geojson'
import type { BreakdownEntry } from './breakdown'
import type { ElevationPoint } from './elevation'
import type { Segment } from './segments'
import type { SurfaceBand } from './surfaceBands'

export type RouteStats = {
  distanceKm: number
  ascentM: number
  descentM: number
  durationMin: number
}

export type RouteResult = {
  alternativeIdx: number
  geojson: FeatureCollection
  segmentsGeoJson: FeatureCollection
  segments: Segment[]
  breakdown: BreakdownEntry[]
  surfaceBands: SurfaceBand[]
  elevationProfile: ElevationPoint[]
  stats: RouteStats
  rawGpxUrl: string
}
