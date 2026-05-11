import { useAtomValue, useSetAtom } from 'jotai'
import { useRoutesQuery } from '../brouter/query'
import { ElevationChart } from '../elevation/ElevationChart'
import { highlightedSegmentIdxAtom } from '../state/highlight'
import { sheetOpenAtom } from '../state/sheet'
import {
  usePointsParam,
  useSelectedRouteParam,
} from '../url/params'
import { Alternatives } from './Alternatives'
import { Composition } from './Composition'
import { Logo } from './Logo'
import { PeekBar } from './PeekBar'
import { computePeekStatus } from './peekStatus'
import { PointList } from './PointList'
import { ProfilePicker } from './ProfilePicker'
import { SegmentList } from './SegmentList'
import { Stats } from './Stats'
import { SurfaceBands } from './SurfaceBands'
import { useAutoOpenSheet } from './useAutoOpenSheet'

export function Sidebar() {
  const [points, setPoints] = usePointsParam()
  const [selectedRouteIdx, setSelectedRouteIdx] = useSelectedRouteParam()
  const setHighlightedSegmentIdx = useSetAtom(highlightedSegmentIdxAtom)
  const sheetOpen = useAtomValue(sheetOpenAtom)
  const { data, isFetching, error } = useRoutesQuery()

  const routes = data ?? []
  const selectedRoute =
    routes.length > 0
      ? routes[Math.min(Math.max(selectedRouteIdx, 0), routes.length - 1)]
      : null

  useAutoOpenSheet(routes.length > 0, points.length)

  const peekStatus = computePeekStatus(
    points,
    selectedRoute,
    isFetching,
    (error as Error | null) ?? null,
  )

  function handleReset() {
    setPoints([])
    setSelectedRouteIdx(0)
    setHighlightedSegmentIdx(null)
  }

  return (
    <aside
      className={`
        fixed bottom-0 left-0 right-0 z-10 flex h-[85dvh] max-h-[85dvh] flex-col
        overflow-hidden rounded-t-2xl bg-white shadow-2xl
        transition-transform duration-300 ease-out
        ${sheetOpen ? 'translate-y-0' : 'translate-y-[calc(100%-5.5rem)]'}
        md:static md:h-full md:max-h-none md:w-96 md:translate-y-0 md:rounded-none
        md:border-r md:border-slate-200 md:shadow-none md:transition-none
      `}
    >
      <PeekBar status={peekStatus} />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 pt-2 md:pt-5">
        <header className="hidden md:block">
          <div className="flex items-center gap-2.5">
            <Logo className="h-7 w-7" />
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Le Vélo
            </h1>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Itinéraires vélo qui suivent les voies cyclables référencées — OSM
            + BRouter.
          </p>
        </header>

        <ProfilePicker />

        <PointList />

        {isFetching && (
          <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
            Calcul des itinéraires…
          </p>
        )}

        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {(error as Error).message}
          </p>
        )}

        {routes.length > 1 && <Alternatives routes={routes} />}

        {selectedRoute && (
          <>
            <Stats route={selectedRoute} />
            {selectedRoute.elevationProfile.length > 1 && (
              <ElevationChart profile={selectedRoute.elevationProfile} />
            )}
            {selectedRoute.breakdown.length > 0 && (
              <Composition breakdown={selectedRoute.breakdown} />
            )}
            {selectedRoute.surfaceBands.length > 0 && (
              <SurfaceBands bands={selectedRoute.surfaceBands} />
            )}
            {selectedRoute.segments.length > 0 && (
              <SegmentList segments={selectedRoute.segments} />
            )}
          </>
        )}

        {points.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="mt-auto rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Réinitialiser
          </button>
        )}

        <footer className="text-xs text-slate-400">
          Données &copy; OpenStreetMap. Routage : brouter.de.
        </footer>
      </div>
    </aside>
  )
}
