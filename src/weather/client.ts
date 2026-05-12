import ky from 'ky'
import { z } from 'zod'
import type { LngLat } from '../geo/lngLat'

const hourlySchema = z.object({
  time: z.array(z.string()),
  temperature_2m: z.array(z.number().nullable()),
  precipitation: z.array(z.number().nullable()),
  wind_speed_10m: z.array(z.number().nullable()),
  wind_direction_10m: z.array(z.number().nullable()),
  weather_code: z.array(z.number().nullable()),
})

const forecastSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  hourly: hourlySchema,
})

const responseSchema = z.union([forecastSchema, z.array(forecastSchema)])

export type Forecast = z.infer<typeof forecastSchema>

const HOURLY_VARS = [
  'temperature_2m',
  'precipitation',
  'wind_speed_10m',
  'wind_direction_10m',
  'weather_code',
].join(',')

export async function fetchForecasts(points: LngLat[]): Promise<Forecast[]> {
  if (points.length === 0) return []
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set(
    'latitude',
    points.map((p) => p.lat.toFixed(4)).join(','),
  )
  url.searchParams.set(
    'longitude',
    points.map((p) => p.lng.toFixed(4)).join(','),
  )
  url.searchParams.set('hourly', HOURLY_VARS)
  url.searchParams.set('windspeed_unit', 'kmh')
  url.searchParams.set('forecast_days', '2')
  url.searchParams.set('timezone', 'GMT')
  const json = await ky.get(url.toString(), { timeout: 15000 }).json()
  const parsed = responseSchema.parse(json)
  return Array.isArray(parsed) ? parsed : [parsed]
}
