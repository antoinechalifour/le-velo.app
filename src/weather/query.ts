import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import type { RouteResult } from '../route/route'
import { departureAtom } from '../state/departure'
import { fetchForecasts } from './client'
import { buildRouteWeather, type WeatherPoint } from './route'
import { sampleRouteWaypoints, type Waypoint } from './sampling'

const HALF_HOUR_MS = 30 * 60_000

function bucketDeparture(ms: number): number {
  return Math.floor(ms / HALF_HOUR_MS) * HALF_HOUR_MS
}

function waypointKey(wps: Waypoint[]): string {
  return wps
    .map((w) => `${w.point.lat.toFixed(3)},${w.point.lng.toFixed(3)}`)
    .join('|')
}

export function useRouteWeather(route: RouteResult | null): {
  data: WeatherPoint[] | null
  isFetching: boolean
  error: Error | null
} {
  const departureOverride = useAtomValue(departureAtom)
  const [nowMs, setNowMs] = useState(() => Date.now())
  useEffect(() => {
    if (departureOverride !== null) return
    const id = window.setInterval(() => setNowMs(Date.now()), 60_000)
    return () => window.clearInterval(id)
  }, [departureOverride])

  const { waypoints, bucketMs } = useMemo(() => {
    if (!route) return { waypoints: [] as Waypoint[], bucketMs: 0 }
    const totalDistanceM = route.stats.distanceKm * 1000
    const durationMs = route.stats.durationMin * 60_000
    const rawDeparture = departureOverride ?? nowMs
    const bucketMs = bucketDeparture(rawDeparture)
    const wps = sampleRouteWaypoints(
      route.elevationProfile,
      totalDistanceM,
      durationMs,
      bucketMs,
    )
    return { waypoints: wps, bucketMs }
  }, [route, departureOverride, nowMs])

  const enabled = waypoints.length > 0
  const query = useQuery({
    queryKey: ['weather', waypointKey(waypoints), bucketMs],
    queryFn: async () => {
      const forecasts = await fetchForecasts(waypoints.map((w) => w.point))
      return buildRouteWeather(waypoints, forecasts)
    },
    enabled,
    staleTime: HALF_HOUR_MS,
    gcTime: 60 * 60_000,
  })

  return {
    data: query.data ?? null,
    isFetching: query.isFetching,
    error: (query.error as Error | null) ?? null,
  }
}
