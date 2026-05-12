export type WeatherCondition =
  | 'clear'
  | 'mostlyClear'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavyRain'
  | 'snow'
  | 'showers'
  | 'thunderstorm'

export type WeatherMeta = {
  condition: WeatherCondition
  label: string
  color: string
}

export const WEATHER_META: Record<WeatherCondition, WeatherMeta> = {
  clear: { condition: 'clear', label: 'Ciel dégagé', color: '#f0d68c' },
  mostlyClear: {
    condition: 'mostlyClear',
    label: 'Peu nuageux',
    color: '#e6d9b4',
  },
  cloudy: { condition: 'cloudy', label: 'Nuageux', color: '#c7c2b3' },
  overcast: { condition: 'overcast', label: 'Couvert', color: '#9a978b' },
  fog: { condition: 'fog', label: 'Brouillard', color: '#b8b5ab' },
  drizzle: { condition: 'drizzle', label: 'Bruine', color: '#a5bcc7' },
  rain: { condition: 'rain', label: 'Pluie', color: '#6b8ea3' },
  heavyRain: { condition: 'heavyRain', label: 'Pluie forte', color: '#3f6478' },
  snow: { condition: 'snow', label: 'Neige', color: '#d8dde2' },
  showers: { condition: 'showers', label: 'Averses', color: '#5a829a' },
  thunderstorm: {
    condition: 'thunderstorm',
    label: 'Orage',
    color: '#4a3f5e',
  },
}

export function classifyWmoCode(code: number): WeatherCondition {
  if (code === 0) return 'clear'
  if (code === 1 || code === 2) return 'mostlyClear'
  if (code === 3) return 'overcast'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'drizzle'
  if (code === 61 || code === 63 || code === 66) return 'rain'
  if (code === 65 || code === 67) return 'heavyRain'
  if (code >= 71 && code <= 77) return 'snow'
  if (code >= 80 && code <= 82) return 'showers'
  if (code === 85 || code === 86) return 'snow'
  if (code >= 95 && code <= 99) return 'thunderstorm'
  return 'cloudy'
}
