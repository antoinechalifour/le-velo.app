import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchRoutes } from './client'
import type { RoutePoint } from '../route/point'
import type { RoutingProfile } from '../route/profile'
import { usePointsParam, useProfileParam } from '../url/params'

export function pointsKey(points: RoutePoint[]): string {
  return points
    .map((p) => `${p.point.lat.toFixed(5)},${p.point.lng.toFixed(5)}`)
    .join('|')
}

export function routesQueryOptions(
  points: RoutePoint[],
  profile: RoutingProfile,
) {
  return queryOptions({
    queryKey: ['routes', pointsKey(points), profile],
    queryFn: () => fetchRoutes(points.map((p) => p.point), profile),
    enabled: points.length >= 2,
  })
}

export function useRoutesQuery() {
  const [points] = usePointsParam()
  const [profile] = useProfileParam()
  return useQuery(routesQueryOptions(points, profile))
}

export function useSelectedRoute() {
  const { data } = useRoutesQuery()
  return data ?? []
}
