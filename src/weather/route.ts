import type { Forecast } from './client'
import { classifyWmoCode, type WeatherCondition } from './code'
import type { Waypoint } from './sampling'

export type WindClass = 'face' | 'travers' | 'dos'

export type WeatherSample = {
  temperatureC: number
  precipitationMm: number
  windSpeedKmh: number
  windFromDeg: number
  weatherCode: number
}

export type WeatherPoint = Waypoint & {
  sample: WeatherSample
  windRelativeDeg: number
  windClass: WindClass
  condition: WeatherCondition
}

function parseUtcHour(t: string): number {
  if (t.endsWith('Z')) return Date.parse(t)
  const hasSec = /T\d{2}:\d{2}:\d{2}/.test(t)
  return Date.parse(hasSec ? `${t}Z` : `${t}:00Z`)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpAngleDeg(a: number, b: number, t: number): number {
  const diff = ((b - a + 540) % 360) - 180
  return ((a + diff * t) % 360 + 360) % 360
}

function sampleForecast(f: Forecast, timeMs: number): WeatherSample | null {
  const times = f.hourly.time
  if (times.length === 0) return null
  const firstMs = parseUtcHour(times[0])
  const lastMs = parseUtcHour(times[times.length - 1])
  if (!Number.isFinite(firstMs) || !Number.isFinite(lastMs)) return null
  const clampedMs = Math.max(firstMs, Math.min(lastMs, timeMs))
  let lo = 0
  let hi = times.length - 1
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1
    if (parseUtcHour(times[mid]) <= clampedMs) lo = mid
    else hi = mid
  }
  const aMs = parseUtcHour(times[lo])
  const bMs = parseUtcHour(times[hi])
  const span = bMs - aMs
  const t = span > 0 ? (clampedMs - aMs) / span : 0
  const nearestIdx = t < 0.5 ? lo : hi
  const at = <T,>(arr: (T | null)[], idx: number): T | null =>
    idx >= 0 && idx < arr.length ? arr[idx] : null
  const aTemp = at(f.hourly.temperature_2m, lo)
  const bTemp = at(f.hourly.temperature_2m, hi)
  const aPrec = at(f.hourly.precipitation, lo)
  const bPrec = at(f.hourly.precipitation, hi)
  const aWs = at(f.hourly.wind_speed_10m, lo)
  const bWs = at(f.hourly.wind_speed_10m, hi)
  const aWd = at(f.hourly.wind_direction_10m, lo)
  const bWd = at(f.hourly.wind_direction_10m, hi)
  const code = at(f.hourly.weather_code, nearestIdx) ?? 0
  return {
    temperatureC:
      aTemp !== null && bTemp !== null ? lerp(aTemp, bTemp, t) : (aTemp ?? bTemp ?? 0),
    precipitationMm:
      aPrec !== null && bPrec !== null ? lerp(aPrec, bPrec, t) : (aPrec ?? bPrec ?? 0),
    windSpeedKmh:
      aWs !== null && bWs !== null ? lerp(aWs, bWs, t) : (aWs ?? bWs ?? 0),
    windFromDeg:
      aWd !== null && bWd !== null ? lerpAngleDeg(aWd, bWd, t) : (aWd ?? bWd ?? 0),
    weatherCode: code,
  }
}

export function windRelativeAngle(
  routeBearing: number,
  windFromDeg: number,
): number {
  const d = windFromDeg - routeBearing
  return ((d % 360) + 540) % 360 - 180
}

export function classifyWind(relativeDeg: number): WindClass {
  const abs = Math.abs(relativeDeg)
  if (abs < 60) return 'face'
  if (abs > 120) return 'dos'
  return 'travers'
}

export const WIND_CLASS_META: Record<
  WindClass,
  { label: string; color: string; short: string }
> = {
  face: { label: 'Vent de face', color: '#b8501a', short: 'face' },
  travers: { label: 'Vent travers', color: '#a98444', short: 'travers' },
  dos: { label: 'Vent dans le dos', color: '#3f6b3a', short: 'dos' },
}

export function buildRouteWeather(
  waypoints: Waypoint[],
  forecasts: Forecast[],
): WeatherPoint[] {
  if (waypoints.length === 0 || forecasts.length !== waypoints.length) return []
  const out: WeatherPoint[] = []
  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i]
    const sample = sampleForecast(forecasts[i], wp.timeMs)
    if (!sample) continue
    const rel = windRelativeAngle(wp.bearing, sample.windFromDeg)
    out.push({
      ...wp,
      sample,
      windRelativeDeg: rel,
      windClass: classifyWind(rel),
      condition: classifyWmoCode(sample.weatherCode),
    })
  }
  return out
}
