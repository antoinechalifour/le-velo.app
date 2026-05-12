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
    <div className="relative h-full md:flex md:gap-4 md:p-4">
      <main className="absolute inset-0 md:static md:flex-1 md:overflow-hidden md:rounded-2xl md:shadow-[inset_4px_4px_10px_rgba(28,25,23,0.22),inset_-2px_-2px_6px_rgba(255,253,247,0.6),inset_0_0_0_1px_rgba(28,25,23,0.08)]">
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
