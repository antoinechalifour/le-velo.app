import { useEffect, useRef } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useStartGeolocationWatch } from './geolocation/useGeolocation'
import { Map } from './map/Map'
import { Sidebar } from './sidebar/Sidebar'
import { pushCameraCommandAtom } from './state/camera'
import { userLocationAtom } from './state/userLocation'
import { usePointsParam } from './url/params'

export default function App() {
  useStartGeolocationWatch()
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
  const userLocation = useAtomValue(userLocationAtom)
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current) return
    if (hasInitialPoints) return
    if (!userLocation) return
    pushCamera({ type: 'flyTo', point: userLocation })
    doneRef.current = true
  }, [userLocation, pushCamera, hasInitialPoints])
}
