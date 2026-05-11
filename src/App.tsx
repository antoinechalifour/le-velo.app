import { useEffect, useRef } from 'react'
import { useSetAtom } from 'jotai'
import { useGeolocation } from './geolocation/useGeolocation'
import { Map } from './map/Map'
import { Sidebar } from './sidebar/Sidebar'
import { pushCameraCommandAtom } from './state/camera'
import { usePointsParam } from './url/params'

export default function App() {
  useInitialCamera()

  return (
    <div className="relative h-full md:flex">
      <main className="absolute inset-0 md:static md:flex-1">
        <Map />
      </main>
      <Sidebar />
    </div>
  )
}

function useInitialCamera() {
  const [points] = usePointsParam()
  const pushCamera = useSetAtom(pushCameraCommandAtom)
  const initialPointsRef = useRef(points)
  const hasInitialPoints = initialPointsRef.current.length > 0
  const geo = useGeolocation({ enabled: !hasInitialPoints })
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current) return
    if (hasInitialPoints) return
    if (!geo.data) return
    pushCamera({ type: 'flyTo', point: geo.data })
    doneRef.current = true
  }, [geo, pushCamera, hasInitialPoints])
}
