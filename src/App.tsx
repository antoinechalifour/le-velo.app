import { useEffect, useRef } from 'react'
import { useSetAtom } from 'jotai'
import { bboxOf } from './geo/bbox'
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
  const geo = useGeolocation()
  const initialPointsRef = useRef(points)
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current) return
    const init = initialPointsRef.current
    if (init.length >= 2) {
      const bbox = bboxOf(init.map((p) => p.point))
      if (bbox) {
        pushCamera({ type: 'fitBounds', bbox })
        doneRef.current = true
      }
    } else if (init.length === 1) {
      pushCamera({ type: 'flyTo', point: init[0].point })
      doneRef.current = true
    }
  }, [pushCamera])

  useEffect(() => {
    if (doneRef.current) return
    if (initialPointsRef.current.length > 0) return
    if (!geo.data) return
    pushCamera({ type: 'flyTo', point: geo.data })
    doneRef.current = true
  }, [geo, pushCamera])
}
