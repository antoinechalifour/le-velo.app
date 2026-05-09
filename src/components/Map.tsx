import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  Map as MapLibre,
  Marker,
  Source,
  Layer,
  type MapMouseEvent,
  type MapRef,
} from 'react-map-gl/maplibre'
import type { ExpressionSpecification } from 'maplibre-gl'
import type { FeatureCollection } from 'geojson'
import type { LngLat } from '../types'
import { CATEGORY_META, CATEGORY_ORDER } from '../lib/segments'

type MapProps = {
  start: LngLat | null
  end: LngLat | null
  segmentsGeoJson: FeatureCollection | null
  highlightedSegmentIdx: number | null
  initialCenter: LngLat | null
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

function buildCategoryColorExpression(): ExpressionSpecification {
  const expr: unknown[] = ['match', ['get', 'category']]
  for (const cat of CATEGORY_ORDER) {
    expr.push(cat, CATEGORY_META[cat].color)
  }
  expr.push(CATEGORY_META.unknown.color)
  return expr as ExpressionSpecification
}

export function Map({
  start,
  end,
  segmentsGeoJson,
  highlightedSegmentIdx,
  initialCenter,
  onMapClick,
}: MapProps) {
  const mapRef = useRef<MapRef | null>(null)
  const hasFlownToUserRef = useRef(false)

  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat })
    },
    [onMapClick],
  )

  const colorExpression = useMemo(() => buildCategoryColorExpression(), [])

  useEffect(() => {
    if (hasFlownToUserRef.current) return
    if (!initialCenter) return
    const map = mapRef.current
    if (!map) return
    hasFlownToUserRef.current = true
    map.flyTo({
      center: [initialCenter.lng, initialCenter.lat],
      zoom: 12,
      duration: 1500,
      essential: true,
    })
  }, [initialCenter])

  return (
    <MapLibre
      ref={mapRef}
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
      {segmentsGeoJson && segmentsGeoJson.features.length > 0 && (
        <Source id="route" type="geojson" data={segmentsGeoJson}>
          <Layer
            id="route-casing"
            type="line"
            paint={{
              'line-color': '#0f172a',
              'line-width': 8,
              'line-opacity': 0.55,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
          <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': colorExpression,
              'line-width': 5,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
          {highlightedSegmentIdx !== null && (
            <Layer
              id="route-highlight"
              type="line"
              filter={['==', ['get', 'idx'], highlightedSegmentIdx]}
              paint={{
                'line-color': '#fff',
                'line-width': 9,
                'line-opacity': 1,
              }}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            />
          )}
          {highlightedSegmentIdx !== null && (
            <Layer
              id="route-highlight-fill"
              type="line"
              filter={['==', ['get', 'idx'], highlightedSegmentIdx]}
              paint={{
                'line-color': colorExpression,
                'line-width': 5,
              }}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            />
          )}
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
