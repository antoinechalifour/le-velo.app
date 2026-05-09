import { useCallback } from 'react'
import {
  Map as MapLibre,
  Marker,
  Source,
  Layer,
  type MapMouseEvent,
} from 'react-map-gl/maplibre'
import type { LngLat } from '../types'

type MapProps = {
  start: LngLat | null
  end: LngLat | null
  routeGeoJson: GeoJSON.FeatureCollection | null
  onMapClick: (lngLat: LngLat) => void
}

const FRANCE_VIEW = {
  longitude: 2.5,
  latitude: 46.5,
  zoom: 5.2,
}

const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster' as const,
      source: 'osm',
    },
  ],
}

export function Map({ start, end, routeGeoJson, onMapClick }: MapProps) {
  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat })
    },
    [onMapClick],
  )

  return (
    <MapLibre
      initialViewState={FRANCE_VIEW}
      mapStyle={OSM_STYLE}
      onClick={handleClick}
      style={{ width: '100%', height: '100%' }}
    >
      {start && (
        <Marker longitude={start.lng} latitude={start.lat} anchor="bottom">
          <Pin color="#16a34a" label="A" />
        </Marker>
      )}
      {end && (
        <Marker longitude={end.lng} latitude={end.lat} anchor="bottom">
          <Pin color="#dc2626" label="B" />
        </Marker>
      )}
      {routeGeoJson && (
        <Source id="route" type="geojson" data={routeGeoJson}>
          <Layer
            id="route-casing"
            type="line"
            paint={{
              'line-color': '#1e3a8a',
              'line-width': 7,
              'line-opacity': 0.9,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
          <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': '#3b82f6',
              'line-width': 4,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
        </Source>
      )}
    </MapLibre>
  )
}

function Pin({ color, label }: { color: string; label: string }) {
  return (
    <div
      className="flex h-8 w-8 -translate-y-1 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white shadow-lg"
      style={{ backgroundColor: color }}
    >
      {label}
    </div>
  )
}
