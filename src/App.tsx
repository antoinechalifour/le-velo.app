import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Map } from './components/Map'
import { Sidebar } from './components/Sidebar'
import { fetchRoutes } from './lib/brouter'
import { useGeolocation } from './lib/geolocation'
import { parseUrlState, serializeUrlState } from './lib/urlState'
import type { LngLat, RoutePoint, RoutingProfile } from './types'

const INITIAL_URL_STATE =
  typeof window !== 'undefined'
    ? parseUrlState(window.location.hash)
    : { points: [], profile: null }

function pointsKey(points: RoutePoint[]): string {
  return points
    .map((p) => `${p.point.lat.toFixed(5)},${p.point.lng.toFixed(5)}`)
    .join('|')
}

export default function App() {
  const [points, setPoints] = useState<RoutePoint[]>(
    () => INITIAL_URL_STATE.points,
  )
  const [profile, setProfile] = useState<RoutingProfile>(
    () => INITIAL_URL_STATE.profile ?? 'trekking',
  )
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0)
  const [highlightedSegmentIdx, setHighlightedSegmentIdx] = useState<
    number | null
  >(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [flyRequest, setFlyRequest] = useState<{
    point: LngLat
    nonce: number
  } | null>(null)
  const [fitRequest] = useState<{
    bounds: [LngLat, LngLat]
    nonce: number
  } | null>(() => {
    const pts = INITIAL_URL_STATE.points
    if (pts.length < 2) return null
    let minLat = Infinity
    let minLng = Infinity
    let maxLat = -Infinity
    let maxLng = -Infinity
    for (const p of pts) {
      if (p.point.lat < minLat) minLat = p.point.lat
      if (p.point.lng < minLng) minLng = p.point.lng
      if (p.point.lat > maxLat) maxLat = p.point.lat
      if (p.point.lng > maxLng) maxLng = p.point.lng
    }
    return {
      bounds: [
        { lat: minLat, lng: minLng },
        { lat: maxLat, lng: maxLng },
      ],
      nonce: Date.now(),
    }
  })
  const initialFlyFromUrlRef = useRef<LngLat | null>(
    INITIAL_URL_STATE.points.length === 1
      ? INITIAL_URL_STATE.points[0].point
      : null,
  )
  const [profileHover, setProfileHover] = useState<{
    distanceM: number
    point: LngLat
  } | null>(null)
  const hadDataRef = useRef(false)

  const geo = useGeolocation()
  const skipGeo = INITIAL_URL_STATE.points.length > 0
  const initialCenter =
    !skipGeo && geo.status === 'ready' ? geo.position : null

  useEffect(() => {
    const p = initialFlyFromUrlRef.current
    if (!p) return
    initialFlyFromUrlRef.current = null
    setFlyRequest({ point: p, nonce: Date.now() })
  }, [])

  useEffect(() => {
    const hash = serializeUrlState({ points, profile })
    const target = hash || window.location.pathname + window.location.search
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', target)
    }
  }, [points, profile])

  const routes = useQuery({
    queryKey: ['routes', pointsKey(points), profile],
    queryFn: () => fetchRoutes(points.map((p) => p.point), profile),
    enabled: points.length >= 2,
  })

  useEffect(() => {
    setSelectedRouteIdx(0)
    setHighlightedSegmentIdx(null)
  }, [routes.data])

  useEffect(() => {
    if (routes.data && routes.data.length > 0 && !hadDataRef.current) {
      hadDataRef.current = true
      setSheetOpen(true)
    }
    if (points.length === 0) {
      hadDataRef.current = false
    }
  }, [routes.data, points.length])

  function handleMapClick(p: LngLat) {
    setHighlightedSegmentIdx(null)
    setPoints((prev) => [...prev, { point: p, label: null }])
  }

  function handleAddPoint(p: LngLat, label: string) {
    setPoints((prev) => [...prev, { point: p, label }])
    setFlyRequest({ point: p, nonce: Date.now() })
  }

  function handleRemovePoint(idx: number) {
    setPoints((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleReorderPoints(fromIdx: number, toIdx: number) {
    setPoints((prev) => {
      if (fromIdx === toIdx) return prev
      if (fromIdx < 0 || fromIdx >= prev.length) return prev
      if (toIdx < 0 || toIdx >= prev.length) return prev
      const next = prev.slice()
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
  }

  function handleReset() {
    setPoints([])
    setHighlightedSegmentIdx(null)
    setSelectedRouteIdx(0)
  }

  const routesData = routes.data ?? []

  return (
    <div className="relative h-full md:flex">
      <main className="absolute inset-0 md:static md:flex-1">
        <Map
          points={points}
          routes={routesData}
          selectedRouteIdx={selectedRouteIdx}
          highlightedSegmentIdx={highlightedSegmentIdx}
          initialCenter={initialCenter}
          flyRequest={flyRequest}
          fitRequest={fitRequest}
          hoverPoint={profileHover?.point ?? null}
          onMapClick={handleMapClick}
          onSelectRoute={setSelectedRouteIdx}
        />
      </main>
      <Sidebar
        points={points}
        profile={profile}
        routes={routesData}
        selectedRouteIdx={selectedRouteIdx}
        isFetching={routes.isFetching}
        error={routes.error as Error | null}
        highlightedSegmentIdx={highlightedSegmentIdx}
        hoveredDistanceM={profileHover?.distanceM ?? null}
        sheetOpen={sheetOpen}
        onToggleSheet={() => setSheetOpen((o) => !o)}
        onProfileHover={setProfileHover}
        onProfileChange={setProfile}
        onSelectRoute={setSelectedRouteIdx}
        onHighlightSegment={setHighlightedSegmentIdx}
        onAddPoint={handleAddPoint}
        onRemovePoint={handleRemovePoint}
        onReorderPoints={handleReorderPoints}
        onReset={handleReset}
      />
    </div>
  )
}
