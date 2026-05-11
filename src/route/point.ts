import { createParser } from 'nuqs'
import type { LngLat } from '../geo/lngLat'

export type RoutePoint = {
  point: LngLat
  label: string | null
}

export type Endpoint = 'start' | 'end'

const LABEL_MAX = 80

function round5(n: number): number {
  return Math.round(n * 1e5) / 1e5
}

function parsePoint(raw: string): RoutePoint | null {
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

function serializePoint(p: RoutePoint): string {
  const lat = round5(p.point.lat)
  const lng = round5(p.point.lng)
  const base = `${lat},${lng}`
  if (!p.label) return base
  const label = p.label.replace(/[,;]/g, ' ').slice(0, LABEL_MAX).trim()
  return label ? `${base},${label}` : base
}

export const parseAsRoutePoints = createParser<RoutePoint[]>({
  parse(value) {
    if (!value) return []
    const out: RoutePoint[] = []
    for (const chunk of value.split(';')) {
      const p = parsePoint(chunk)
      if (p) out.push(p)
    }
    return out
  },
  serialize(value) {
    if (value.length === 0) return ''
    return value.map(serializePoint).join(';')
  },
  eq(a, b) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i].point.lat !== b[i].point.lat) return false
      if (a[i].point.lng !== b[i].point.lng) return false
      if (a[i].label !== b[i].label) return false
    }
    return true
  },
})
