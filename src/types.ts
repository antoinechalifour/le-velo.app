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
  geojson: GeoJSON.FeatureCollection
  stats: RouteStats
  rawGpxUrl: string
}
