import type { FeatureCollection } from 'geojson'
import type {
  BreakdownEntry,
  Segment,
  SurfaceBand,
} from './lib/segments'
import type { ElevationPoint } from './lib/elevation'

export type LngLat = {
  lng: number
  lat: number
}

export type RoutePoint = {
  point: LngLat
  label: string | null
}

export type Endpoint = 'start' | 'end'

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

export type RoutingProfile = 'fastbike' | 'trekking' | 'safety' | 'shortest'

export type ProfileMeta = {
  id: RoutingProfile
  label: string
  hint: string
}

export const PROFILES: ProfileMeta[] = [
  {
    id: 'fastbike',
    label: 'Route',
    hint: 'Vélo route — privilégie le bitume',
  },
  {
    id: 'trekking',
    label: 'Mixte',
    hint: 'Trekking — bitume + chemins, défaut polyvalent',
  },
  {
    id: 'safety',
    label: 'Tranquille',
    hint: 'Minimise le trafic motorisé',
  },
  {
    id: 'shortest',
    label: 'Court',
    hint: 'Le plus direct, ignore le confort',
  },
]
