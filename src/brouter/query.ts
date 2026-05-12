import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchRoutes } from './client'
import type { RoutePoint } from '../route/point'
import type { RoutingProfile } from '../route/profile'
import {
  useMinDistanceParam,
  usePointsParam,
  useProfileParam,
} from '../url/params'

export function pointsKey(points: RoutePoint[]): string {
  return points
    .map((p) => `${p.point.lat.toFixed(5)},${p.point.lng.toFixed(5)}`)
    .join('|')
}

export function routesQueryOptions(
  points: RoutePoint[],
  profile: RoutingProfile,
  minDistanceKm: number,
) {
  // Le mode "distance minimum" ne s'applique que pour un A → B simple.
  const effectiveMin = points.length === 2 ? minDistanceKm : 0
  return queryOptions({
    queryKey: ['routes', pointsKey(points), profile, effectiveMin],
    queryFn: () =>
      fetchRoutes(points.map((p) => p.point), profile, effectiveMin),
    enabled: points.length >= 2,
  })
}

export function useRoutesQuery() {
  const [points] = usePointsParam()
  const [profile] = useProfileParam()
  const [minDistanceKm] = useMinDistanceParam()
  return useQuery(routesQueryOptions(points, profile, minDistanceKm))
}

export function useSelectedRoute() {
  const { data } = useRoutesQuery()
  return data ?? []
}
