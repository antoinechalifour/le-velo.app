import { useAtomValue, useSetAtom } from 'jotai'
import { useRoutesQuery } from '../brouter/query'
import { ElevationChart } from '../elevation/ElevationChart'
import { useMagnetic } from '../hooks/useMagnetic'
import { routeHoverAtom } from '../state/hover'
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
import { WeatherBands } from './WeatherBands'

export function Sidebar() {
  const [points, setPoints] = usePointsParam()
  const [selectedRouteIdx, setSelectedRouteIdx] = useSelectedRouteParam()
  const setHover = useSetAtom(routeHoverAtom)
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
    setHover(null)
  }

  return (
    <aside
      className={`
        paper-grain dur-flow fixed bottom-0 left-0 right-0 z-10 flex h-[85dvh] max-h-[85dvh]
        flex-col overflow-hidden rounded-t-[1.25rem] shadow-2xl transition-transform
        ${sheetOpen ? 'translate-y-0' : 'translate-y-[calc(100%-5.5rem)]'}
        md:static md:h-full md:max-h-none md:w-1/3 md:min-w-[26rem] md:max-w-[48rem] md:translate-y-0 md:rounded-none
        md:border-r md:border-ink/12 md:shadow-[6px_0_24px_-12px_rgba(28,25,23,0.18)] md:transition-none
      `}
    >
      <PeekBar status={peekStatus} />

      <div className="scroll-soft flex flex-1 flex-col overflow-y-auto">
        <header className="hidden px-7 pt-7 md:block">
          <BrandHeader />
        </header>

        <div className="flex flex-col gap-5 px-5 pt-2 pb-6 md:px-7 md:pt-6">
          <Section eyebrow="Nº 01 · Profil">
            <ProfilePicker />
          </Section>

          <Section eyebrow="Nº 02 · Étapes du parcours">
            <PointList />
          </Section>

          {isFetching && (
            <div className="paper-card flex items-center gap-3 rounded-lg px-4 py-3 text-sm">
              <Logo spinning className="h-5 w-5 text-forest" />
              <span className="font-medium text-ink-soft">
                Tracé de l’itinéraire en cours…
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border-2 border-burgundy/30 bg-burgundy/8 px-4 py-3 text-sm text-burgundy">
              <div className="eyebrow-tight text-burgundy">Avarie</div>
              <p className="mt-1">{(error as Error).message}</p>
            </div>
          )}

          {routes.length > 1 && (
            <Section eyebrow="Nº 03 · Variantes">
              <Alternatives routes={routes} />
            </Section>
          )}

          {selectedRoute && (
            <>
              <Section eyebrow="Carnet de route">
                <Stats route={selectedRoute} />
              </Section>
              {selectedRoute.elevationProfile.length > 1 && (
                <Section eyebrow="Profil altimétrique">
                  <ElevationChart profile={selectedRoute.elevationProfile} />
                </Section>
              )}
              <Section eyebrow="Bulletin météo en chemin">
                <WeatherBands route={selectedRoute} />
              </Section>
              {selectedRoute.breakdown.length > 0 && (
                <Section eyebrow="Composition des voies">
                  <Composition breakdown={selectedRoute.breakdown} />
                </Section>
              )}
              {selectedRoute.surfaceBands.length > 0 && (
                <Section eyebrow="Revêtement">
                  <SurfaceBands
                    bands={selectedRoute.surfaceBands}
                    profile={selectedRoute.elevationProfile}
                  />
                </Section>
              )}
              {selectedRoute.segments.length > 0 && (
                <Section eyebrow="Détail des segments">
                  <SegmentList segments={selectedRoute.segments} />
                </Section>
              )}
            </>
          )}

          {points.length > 0 && <ResetButton onClick={handleReset} />}

          <footer className="mt-2 border-t border-ink/15 pt-4 text-[11px] leading-relaxed text-sepia-soft">
            <div className="eyebrow-tight mb-1 text-sepia">Colophon</div>
            Données cartographiques © OpenStreetMap, contributeurs bénévoles.
            Calcul d’itinéraire confié à BRouter. Sans compte, sans publicité.
          </footer>
        </div>
      </div>
    </aside>
  )
}

function ResetButton({ onClick }: { onClick: () => void }) {
  const { ref, onMouseMove, onMouseLeave } = useMagnetic<HTMLButtonElement>({
    strength: 0.22,
    max: 5,
  })
  return (
    <button
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      type="button"
      onClick={onClick}
      className="focus-ring eyebrow-tight ink-wash mt-1 inline-flex items-center justify-center gap-2 self-start overflow-hidden rounded-full border border-ink/25 bg-paper-soft px-4 py-2 text-ink-soft"
    >
      <span aria-hidden>↺</span> Recommencer
    </button>
  )
}

function BrandHeader() {
  return (
    <div>
      <div className="rule-double mb-4" />
      <div className="flex items-end gap-3">
        <Logo className="h-14 w-14 text-ink" />
        <div className="min-w-0 flex-1 pb-1">
          <div className="eyebrow-tight text-rust">Cyclisme · Itinéraires</div>
          <h1 className="display-serif -mt-0.5 text-[2.4rem] font-medium leading-[0.95] tracking-tight text-ink">
            Le{' '}
            <span
              className="italic"
              style={{ fontVariationSettings: '"SOFT" 80, "opsz" 96' }}
            >
              Vélo
            </span>
          </h1>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="h-px flex-1 bg-ink/25" />
        <span className="eyebrow text-sepia">Édition Française</span>
        <span className="h-px flex-1 bg-ink/25" />
      </div>
      <p className="mt-3 max-w-[36ch] text-[0.82rem] leading-relaxed text-sepia">
        Tracés qui suivent les voies cyclables référencées par
        OpenStreetMap — moteur{' '}
        <span className="italic text-ink-soft">BRouter</span>, export GPX,
        aucune fioriture.
      </p>
    </div>
  )
}

function Section({
  eyebrow,
  children,
}: {
  eyebrow: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="eyebrow text-sepia">{eyebrow}</span>
        <span className="h-px flex-1 bg-ink/15" />
      </div>
      {children}
    </section>
  )
}
