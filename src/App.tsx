import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Map } from './components/Map'
import { Sidebar } from './components/Sidebar'
import { fetchRoutes } from './lib/brouter'
import { useGeolocation } from './lib/geolocation'
import type { LngLat, RoutingProfile } from './types'

export default function App() {
  const [start, setStart] = useState<LngLat | null>(null)
  const [end, setEnd] = useState<LngLat | null>(null)
  const [startLabel, setStartLabel] = useState<string | null>(null)
  const [endLabel, setEndLabel] = useState<string | null>(null)
  const [profile, setProfile] = useState<RoutingProfile>('trekking')
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0)
  const [highlightedSegmentIdx, setHighlightedSegmentIdx] = useState<
    number | null
  >(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [flyRequest, setFlyRequest] = useState<{
    point: LngLat
    nonce: number
  } | null>(null)
  const hadDataRef = useRef(false)

  const geo = useGeolocation()
  const initialCenter = geo.status === 'ready' ? geo.position : null

  const routes = useQuery({
    queryKey: ['routes', start?.lng, start?.lat, end?.lng, end?.lat, profile],
    queryFn: () => fetchRoutes(start!, end!, profile),
    enabled: !!start && !!end,
  })

  // Reset selection when a new set of routes arrives.
  useEffect(() => {
    setSelectedRouteIdx(0)
    setHighlightedSegmentIdx(null)
  }, [routes.data])

  // First time we get a route, auto-expand the bottom sheet so the user sees
  // composition / segments. Subsequent recomputes don't re-open it (so the
  // user can keep it folded after the first peek).
  useEffect(() => {
    if (routes.data && routes.data.length > 0 && !hadDataRef.current) {
      hadDataRef.current = true
      setSheetOpen(true)
    }
    if (!start && !end) {
      hadDataRef.current = false
    }
  }, [routes.data, start, end])

  function handleMapClick(p: LngLat) {
    setHighlightedSegmentIdx(null)
    if (!start) {
      setStart(p)
      setStartLabel(null)
      return
    }
    if (!end) {
      setEnd(p)
      setEndLabel(null)
      return
    }
    setStart(p)
    setStartLabel(null)
    setEnd(null)
    setEndLabel(null)
  }

  function handleSelectStart(p: LngLat, label: string) {
    setStart(p)
    setStartLabel(label)
    setFlyRequest({ point: p, nonce: Date.now() })
  }

  function handleSelectEnd(p: LngLat, label: string) {
    setEnd(p)
    setEndLabel(label)
    setFlyRequest({ point: p, nonce: Date.now() })
  }

  function handleClearStart() {
    setStart(null)
    setStartLabel(null)
  }

  function handleClearEnd() {
    setEnd(null)
    setEndLabel(null)
  }

  function handleReset() {
    setStart(null)
    setEnd(null)
    setStartLabel(null)
    setEndLabel(null)
    setHighlightedSegmentIdx(null)
    setSelectedRouteIdx(0)
  }

  const routesData = routes.data ?? []

  return (
    <div className="relative h-full md:flex">
      <main className="absolute inset-0 md:static md:flex-1">
        <Map
          start={start}
          end={end}
          routes={routesData}
          selectedRouteIdx={selectedRouteIdx}
          highlightedSegmentIdx={highlightedSegmentIdx}
          initialCenter={initialCenter}
          flyRequest={flyRequest}
          onMapClick={handleMapClick}
          onSelectRoute={setSelectedRouteIdx}
        />
      </main>
      <Sidebar
        start={start}
        end={end}
        startLabel={startLabel}
        endLabel={endLabel}
        profile={profile}
        routes={routesData}
        selectedRouteIdx={selectedRouteIdx}
        isFetching={routes.isFetching}
        error={routes.error as Error | null}
        highlightedSegmentIdx={highlightedSegmentIdx}
        sheetOpen={sheetOpen}
        onToggleSheet={() => setSheetOpen((o) => !o)}
        onProfileChange={setProfile}
        onSelectRoute={setSelectedRouteIdx}
        onHighlightSegment={setHighlightedSegmentIdx}
        onSelectStart={handleSelectStart}
        onSelectEnd={handleSelectEnd}
        onClearStart={handleClearStart}
        onClearEnd={handleClearEnd}
        onReset={handleReset}
      />
    </div>
  )
}
