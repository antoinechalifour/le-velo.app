import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Map } from './components/Map'
import { Sidebar } from './components/Sidebar'
import { fetchRoute } from './lib/brouter'
import { useGeolocation } from './lib/geolocation'
import type { LngLat } from './types'

export default function App() {
  const [start, setStart] = useState<LngLat | null>(null)
  const [end, setEnd] = useState<LngLat | null>(null)
  const [highlightedSegmentIdx, setHighlightedSegmentIdx] = useState<
    number | null
  >(null)

  const geo = useGeolocation()
  const initialCenter = geo.status === 'ready' ? geo.position : null

  const route = useQuery({
    queryKey: ['route', start?.lng, start?.lat, end?.lng, end?.lat],
    queryFn: () => fetchRoute(start!, end!),
    enabled: !!start && !!end,
  })

  function handleMapClick(p: LngLat) {
    setHighlightedSegmentIdx(null)
    if (!start) {
      setStart(p)
      return
    }
    if (!end) {
      setEnd(p)
      return
    }
    setStart(p)
    setEnd(null)
  }

  function handleReset() {
    setStart(null)
    setEnd(null)
    setHighlightedSegmentIdx(null)
  }

  return (
    <div className="flex h-full">
      <Sidebar
        start={start}
        end={end}
        route={route.data ?? null}
        isFetching={route.isFetching}
        error={route.error as Error | null}
        highlightedSegmentIdx={highlightedSegmentIdx}
        onHighlightSegment={setHighlightedSegmentIdx}
        onReset={handleReset}
      />
      <main className="relative flex-1">
        <Map
          start={start}
          end={end}
          segmentsGeoJson={route.data?.segmentsGeoJson ?? null}
          highlightedSegmentIdx={highlightedSegmentIdx}
          initialCenter={initialCenter}
          onMapClick={handleMapClick}
        />
      </main>
    </div>
  )
}
