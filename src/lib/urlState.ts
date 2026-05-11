import type { RoutePoint, RoutingProfile } from '../types'

const PROFILE_VALUES: RoutingProfile[] = [
  'fastbike',
  'trekking',
  'safety',
  'shortest',
]

export type UrlState = {
  points: RoutePoint[]
  profile: RoutingProfile | null
}

const LABEL_MAX = 80

export function parseUrlState(hash: string): UrlState {
  const trimmed = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(trimmed)
  return {
    points: parsePoints(params.get('pts')),
    profile: parseProfile(params.get('p')),
  }
}

export function serializeUrlState(state: UrlState): string {
  const params = new URLSearchParams()
  if (state.points.length > 0) {
    params.set('pts', state.points.map(formatPoint).join(';'))
  }
  if (state.profile) params.set('p', state.profile)
  const s = params.toString()
  return s ? `#${s}` : ''
}

function parsePoints(raw: string | null): RoutePoint[] {
  if (!raw) return []
  const out: RoutePoint[] = []
  for (const chunk of raw.split(';')) {
    const p = parseSinglePoint(chunk)
    if (p) out.push(p)
  }
  return out
}

function parseSinglePoint(raw: string): RoutePoint | null {
  if (!raw) return null
  const parts = raw.split(',')
  if (parts.length < 2) return null
  const lat = Number(parts[0])
  const lng = Number(parts[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  const label = parts.slice(2).join(',').trim()
  return {
    point: { lat, lng },
    label: label.length > 0 ? label : null,
  }
}

function formatPoint(p: RoutePoint): string {
  const lat = round5(p.point.lat)
  const lng = round5(p.point.lng)
  const base = `${lat},${lng}`
  if (!p.label) return base
  const label = p.label.replace(/[,;]/g, ' ').slice(0, LABEL_MAX).trim()
  return label ? `${base},${label}` : base
}

function parseProfile(raw: string | null): RoutingProfile | null {
  if (!raw) return null
  return PROFILE_VALUES.includes(raw as RoutingProfile)
    ? (raw as RoutingProfile)
    : null
}

function round5(n: number): number {
  return Math.round(n * 1e5) / 1e5
}
