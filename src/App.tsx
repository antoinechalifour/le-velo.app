import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Map } from './components/Map'
import { Sidebar } from './components/Sidebar'
import { fetchRoute } from './lib/brouter'
import type { LngLat } from './types'

export default function App() {
  const [start, setStart] = useState<LngLat | null>(null)
  const [end, setEnd] = useState<LngLat | null>(null)

  const route = useQuery({
    queryKey: ['route', start?.lng, start?.lat, end?.lng, end?.lat],
    queryFn: () => fetchRoute(start!, end!),
    enabled: !!start && !!end,
  })

  function handleMapClick(p: LngLat) {
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
  }

  return (
    <div className="flex h-full">
      <Sidebar
        start={start}
        end={end}
        route={route.data ?? null}
        isFetching={route.isFetching}
        error={route.error as Error | null}
        onReset={handleReset}
      />
      <main className="relative flex-1">
        <Map
          start={start}
          end={end}
          routeGeoJson={route.data?.geojson ?? null}
          onMapClick={handleMapClick}
        />
      </main>
    </div>
  )
}
