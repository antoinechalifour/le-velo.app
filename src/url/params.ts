import { parseAsInteger, parseAsStringEnum, useQueryState } from 'nuqs'
import { parseAsRoutePoints } from '../route/point'
import { PROFILE_IDS, type RoutingProfile } from '../route/profile'

const pointsParser = parseAsRoutePoints.withDefault([])
const profileParser = parseAsStringEnum<RoutingProfile>(PROFILE_IDS).withDefault(
  'trekking',
)
const selectedRouteParser = parseAsInteger.withDefault(0)

export function usePointsParam() {
  return useQueryState('pts', pointsParser)
}

export function useProfileParam() {
  return useQueryState('p', profileParser)
}

export function useSelectedRouteParam() {
  return useQueryState('alt', selectedRouteParser)
}
