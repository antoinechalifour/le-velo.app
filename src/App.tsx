import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Map } from './components/Map'
import { Sidebar } from './components/Sidebar'
import { fetchRoutes } from './lib/brouter'
import { useGeolocation } from './lib/geolocation'
import { parseUrlState, serializeUrlState } from './lib/urlState'
import type { LngLat, RoutingProfile } from './types'

const INITIAL_URL_STATE =
  typeof window !== 'undefined'
    ? parseUrlState(window.location.hash)
    : { start: null, end: null, profile: null }

export default function App() {
  const [start, setStart] = useState<LngLat | null>(
    () => INITIAL_URL_STATE.start?.point ?? null,
  )
  const [end, setEnd] = useState<LngLat | null>(
    () => INITIAL_URL_STATE.end?.point ?? null,
  )
  const [startLabel, setStartLabel] = useState<string | null>(
    () => INITIAL_URL_STATE.start?.label ?? null,
  )
  const [endLabel, setEndLabel] = useState<string | null>(
    () => INITIAL_URL_STATE.end?.label ?? null,
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
  const [profileHover, setProfileHover] = useState<{
    distanceM: number
    point: LngLat
  } | null>(null)
  const [fitRequest] = useState<{
    bounds: [LngLat, LngLat]
    nonce: number
  } | null>(() => {
    const s = INITIAL_URL_STATE.start?.point
    const e = INITIAL_URL_STATE.end?.point
    if (s && e) return { bounds: [s, e], nonce: Date.now() }
    return null
  })
  const initialFlyFromUrlRef = useRef<LngLat | null>(
    INITIAL_URL_STATE.start && !INITIAL_URL_STATE.end
      ? INITIAL_URL_STATE.start.point
      : !INITIAL_URL_STATE.start && INITIAL_URL_STATE.end
        ? INITIAL_URL_STATE.end.point
        : null,
  )
  const hadDataRef = useRef(false)

  const geo = useGeolocation()
  const skipGeo = !!INITIAL_URL_STATE.start || !!INITIAL_URL_STATE.end
  const initialCenter =
    !skipGeo && geo.status === 'ready' ? geo.position : null

  useEffect(() => {
    const p = initialFlyFromUrlRef.current
    if (!p) return
    initialFlyFromUrlRef.current = null
    setFlyRequest({ point: p, nonce: Date.now() })
  }, [])

  useEffect(() => {
    const hash = serializeUrlState({
      start: start ? { point: start, label: startLabel } : null,
      end: end ? { point: end, label: endLabel } : null,
      profile,
    })
    const target = hash || window.location.pathname + window.location.search
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', target)
    }
  }, [start, end, startLabel, endLabel, profile])

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
          fitRequest={fitRequest}
          hoverPoint={profileHover?.point ?? null}
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
        hoveredDistanceM={profileHover?.distanceM ?? null}
        sheetOpen={sheetOpen}
        onToggleSheet={() => setSheetOpen((o) => !o)}
        onProfileHover={setProfileHover}
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
