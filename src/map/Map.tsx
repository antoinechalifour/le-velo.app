import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
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
import { useRoutesQuery } from '../brouter/query'
import type { LngLat } from '../geo/lngLat'
import {
  pointRole,
  ROLE_META,
  roleLetter,
  roleTooltipLabel,
} from '../route/pointRole'
import { CATEGORY_META, CATEGORY_ORDER } from '../route/segmentCategory'
import { cameraCommandAtom } from '../state/camera'
import { highlightedSegmentIdxAtom } from '../state/highlight'
import { profileHoverAtom } from '../state/hover'
import { usePointsParam, useSelectedRouteParam } from '../url/params'

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
      id: 'paper',
      type: 'background' as const,
      paint: {
        'background-color': '#efe6d2',
      },
    },
    {
      id: 'osm',
      type: 'raster' as const,
      source: 'osm',
      paint: {
        'raster-saturation': -0.3,
        'raster-contrast': 0.12,
        'raster-brightness-min': 0.08,
        'raster-brightness-max': 1,
        'raster-hue-rotate': 10,
        'raster-opacity': 1,
      },
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

export function Map() {
  const [points, setPoints] = usePointsParam()
  const [selectedRouteIdx, setSelectedRouteIdx] = useSelectedRouteParam()
  const { data } = useRoutesQuery()
  const routes = useMemo(() => data ?? [], [data])
  const clampedIdx =
    routes.length > 0
      ? Math.min(Math.max(selectedRouteIdx, 0), routes.length - 1)
      : 0

  const highlightedSegmentIdx = useAtomValue(highlightedSegmentIdxAtom)
  const setHighlightedSegmentIdx = useSetAtom(highlightedSegmentIdxAtom)
  const hover = useAtomValue(profileHoverAtom)
  const cameraCommand = useAtomValue(cameraCommandAtom)

  const mapRef = useRef<MapRef | null>(null)

  const colorExpression = useMemo(() => buildCategoryColorExpression(), [])

  const alternativesGeoJson = useMemo<FeatureCollection>(() => {
    const features: Feature<LineString>[] = []
    routes.forEach((r, idx) => {
      if (idx === clampedIdx) return
      const f = r.geojson.features?.[0]
      if (!f || f.geometry?.type !== 'LineString') return
      features.push({
        type: 'Feature',
        properties: { routeIdx: idx },
        geometry: f.geometry as LineString,
      })
    })
    return { type: 'FeatureCollection', features }
  }, [routes, clampedIdx])

  const selectedSegmentsGeoJson = routes[clampedIdx]?.segmentsGeoJson ?? null

  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      const features = e.features ?? []
      const altFeature = features.find((f) => f.layer?.id === ALT_LAYER_ID)
      if (altFeature) {
        const idx = altFeature.properties?.routeIdx
        if (typeof idx === 'number') {
          setSelectedRouteIdx(idx)
          return
        }
      }
      setHighlightedSegmentIdx(null)
      setPoints((prev) => [
        ...prev,
        { point: { lng: e.lngLat.lng, lat: e.lngLat.lat }, label: null },
      ])
    },
    [setHighlightedSegmentIdx, setPoints, setSelectedRouteIdx],
  )

  useEffect(() => {
    if (!cameraCommand) return
    const map = mapRef.current
    if (!map) return
    if (cameraCommand.type === 'flyTo') {
      const current = map.getZoom()
      map.flyTo({
        center: [cameraCommand.point.lng, cameraCommand.point.lat],
        zoom: Math.max(current, cameraCommand.zoom ?? 12),
        duration: 1200,
        essential: true,
      })
    } else {
      const [a, b] = cameraCommand.bbox
      const sw: [number, number] = [
        Math.min(a.lng, b.lng),
        Math.min(a.lat, b.lat),
      ]
      const ne: [number, number] = [
        Math.max(a.lng, b.lng),
        Math.max(a.lat, b.lat),
      ]
      map.fitBounds([sw, ne], {
        padding: 80,
        duration: 1000,
        maxZoom: 13,
      })
    }
  }, [cameraCommand])

  const hoverPoint: LngLat | null = hover?.point ?? null

  return (
    <MapLibre
      ref={mapRef}
      initialViewState={FRANCE_VIEW}
      mapStyle={OSM_STYLE}
      onClick={handleClick}
      interactiveLayerIds={[ALT_LAYER_ID]}
      style={{ width: '100%', height: '100%', backgroundColor: '#efe6d2' }}
    >
      {points.map((p, idx) => {
        const role = pointRole(idx, points.length)
        return (
          <Marker
            key={`pt-${idx}-${p.point.lat}-${p.point.lng}`}
            longitude={p.point.lng}
            latitude={p.point.lat}
            anchor="bottom"
          >
            <Pin
              color={ROLE_META[role].color}
              label={roleLetter(role, idx)}
              tooltip={roleTooltipLabel(role, idx)}
            />
          </Marker>
        )
      })}

      {hoverPoint && (
        <Marker
          longitude={hoverPoint.lng}
          latitude={hoverPoint.lat}
          anchor="center"
        >
          <HoverDot />
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
              'line-color': '#fbf6e9',
              'line-width': 8,
              'line-opacity': 0.85,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
          <Layer
            id={ALT_LAYER_ID}
            type="line"
            paint={{
              'line-color': '#6b5d4f',
              'line-width': 4,
              'line-opacity': 0.75,
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
              'line-color': '#1c1917',
              'line-width': 9,
              'line-opacity': 0.85,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
          <Layer
            id="route-paper"
            type="line"
            paint={{
              'line-color': '#fbf6e9',
              'line-width': 7,
              'line-opacity': 1,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
          <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': colorExpression,
              'line-width': 5,
              'line-opacity': 0.95,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
          {highlightedSegmentIdx !== null && (
            <Layer
              id="route-highlight"
              type="line"
              filter={['==', ['get', 'idx'], highlightedSegmentIdx]}
              paint={{
                'line-color': '#fbf6e9',
                'line-width': 11,
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
                'line-width': 5.5,
              }}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            />
          )}
        </Source>
      )}
    </MapLibre>
  )
}

function Pin({
  color,
  label,
  tooltip,
}: {
  color: string
  label: string
  tooltip: string
}) {
  return (
    <div className="relative -translate-y-1 flex flex-col items-center">
      <div className="mb-1 flex flex-col items-center">
        <div
          className="eyebrow-tight whitespace-nowrap px-2 py-[3px]"
          style={{
            color: color,
            backgroundColor: 'var(--color-paper-soft)',
            border: `1px solid ${color}`,
            boxShadow:
              '0 2px 4px -1px rgba(28,25,23,0.30), inset 0 0 0 1px rgba(251,246,233,0.65)',
            fontSize: '0.62rem',
            letterSpacing: '0.16em',
          }}
        >
          {tooltip}
        </div>
        <div
          className="-mt-[4px] h-1.5 w-1.5 rotate-45"
          style={{
            backgroundColor: 'var(--color-paper-soft)',
            borderRight: `1px solid ${color}`,
            borderBottom: `1px solid ${color}`,
          }}
        />
      </div>
      <div
        className="display-serif flex h-9 w-9 items-center justify-center rounded-full text-[1rem] font-semibold text-paper-soft shadow-[0_3px_6px_-1px_rgba(28,25,23,0.45)] ring-[3px] ring-paper-soft"
        style={{ backgroundColor: color }}
      >
        {label}
      </div>
      <div
        className="-mt-1 h-2 w-2 rotate-45"
        style={{ backgroundColor: color, boxShadow: '0 2px 3px -1px rgba(28,25,23,0.35)' }}
      />
    </div>
  )
}

function HoverDot() {
  return (
    <div
      className="h-3.5 w-3.5 rounded-full border-2 border-paper-soft shadow-md"
      style={{ backgroundColor: '#b8501a' }}
    />
  )
}
