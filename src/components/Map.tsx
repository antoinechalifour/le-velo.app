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
import type { Feature, FeatureCollection, LineString } from 'geojson'
import type { LngLat, RouteResult } from '../types'
import { CATEGORY_META, CATEGORY_ORDER } from '../lib/segments'

type MapProps = {
  start: LngLat | null
  end: LngLat | null
  routes: RouteResult[]
  selectedRouteIdx: number
  highlightedSegmentIdx: number | null
  initialCenter: LngLat | null
  flyRequest: { point: LngLat; nonce: number } | null
  onMapClick: (lngLat: LngLat) => void
  onSelectRoute: (idx: number) => void
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

const ALT_LAYER_ID = 'route-alternatives-line'

export function Map({
  start,
  end,
  routes,
  selectedRouteIdx,
  highlightedSegmentIdx,
  initialCenter,
  flyRequest,
  onMapClick,
  onSelectRoute,
}: MapProps) {
  const mapRef = useRef<MapRef | null>(null)
  const hasFlownToUserRef = useRef(false)

  const colorExpression = useMemo(() => buildCategoryColorExpression(), [])

  const alternativesGeoJson = useMemo<FeatureCollection>(() => {
    const features: Feature<LineString>[] = []
    routes.forEach((r, idx) => {
      if (idx === selectedRouteIdx) return
      const f = r.geojson.features?.[0]
      if (!f || f.geometry?.type !== 'LineString') return
      features.push({
        type: 'Feature',
        properties: { routeIdx: idx },
        geometry: f.geometry as LineString,
      })
    })
    return { type: 'FeatureCollection', features }
  }, [routes, selectedRouteIdx])

  const selectedSegmentsGeoJson =
    routes[selectedRouteIdx]?.segmentsGeoJson ?? null

  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      const features = e.features ?? []
      const altFeature = features.find((f) => f.layer?.id === ALT_LAYER_ID)
      if (altFeature) {
        const idx = altFeature.properties?.routeIdx
        if (typeof idx === 'number') {
          onSelectRoute(idx)
          return
        }
      }
      onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat })
    },
    [onMapClick, onSelectRoute],
  )

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

  useEffect(() => {
    if (!flyRequest) return
    const map = mapRef.current
    if (!map) return
    hasFlownToUserRef.current = true
    const current = map.getZoom()
    map.flyTo({
      center: [flyRequest.point.lng, flyRequest.point.lat],
      zoom: Math.max(current, 12),
      duration: 1200,
      essential: true,
    })
  }, [flyRequest])

  return (
    <MapLibre
      ref={mapRef}
      initialViewState={FRANCE_VIEW}
      mapStyle={OSM_STYLE}
      onClick={handleClick}
      interactiveLayerIds={[ALT_LAYER_ID]}
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

      {alternativesGeoJson.features.length > 0 && (
        <Source
          id="route-alternatives"
          type="geojson"
          data={alternativesGeoJson}
        >
          <Layer
            id="route-alternatives-casing"
            type="line"
            paint={{
              'line-color': '#fff',
              'line-width': 7,
              'line-opacity': 0.7,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
          <Layer
            id={ALT_LAYER_ID}
            type="line"
            paint={{
              'line-color': '#64748b',
              'line-width': 4,
              'line-opacity': 0.7,
              'line-dasharray': [2, 1.5],
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
        </Source>
      )}

      {selectedSegmentsGeoJson && selectedSegmentsGeoJson.features.length > 0 && (
        <Source id="route" type="geojson" data={selectedSegmentsGeoJson}>
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
