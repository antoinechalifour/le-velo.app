import type { FeatureCollection, LineString } from 'geojson'

export type SegmentCategory =
  | 'cycleway'
  | 'shared-bike'
  | 'quiet-road'
  | 'minor-road'
  | 'major-road'
  | 'highway-fast'
  | 'unknown'

export type CategoryMeta = {
  label: string
  description: string
  color: string
}

export const CATEGORY_META: Record<SegmentCategory, CategoryMeta> = {
  cycleway: {
    label: 'Voie cyclable',
    description: 'Piste dédiée vélo',
    color: '#16a34a',
  },
  'shared-bike': {
    label: 'Partagé vélo',
    description: 'Voie partagée signalée vélo (bande, chemin mixte)',
    color: '#84cc16',
  },
  'quiet-road': {
    label: 'Route calme',
    description: 'Résidentielle, voie de service, chemin',
    color: '#2563eb',
  },
  'minor-road': {
    label: 'Petite route',
    description: 'Route tertiaire',
    color: '#eab308',
  },
  'major-road': {
    label: 'Route principale',
    description: 'Secondaire / primaire — trafic plus dense',
    color: '#f97316',
  },
  'highway-fast': {
    label: 'Voie rapide',
    description: 'Voie rapide / autoroute — à éviter',
    color: '#dc2626',
  },
  unknown: {
    label: 'Autre',
    description: 'Type non classifié',
    color: '#94a3b8',
  },
}

export const CATEGORY_ORDER: SegmentCategory[] = [
  'cycleway',
  'shared-bike',
  'quiet-road',
  'minor-road',
  'major-road',
  'highway-fast',
  'unknown',
]

export type Segment = {
  category: SegmentCategory
  distanceM: number
  startKm: number
  endKm: number
  coordinates: [number, number][]
  primaryHighway: string | null
  surface: string | null
}

export type BreakdownEntry = {
  category: SegmentCategory
  distanceM: number
  share: number
}

export type SurfaceCategory =
  | 'paved'
  | 'compacted'
  | 'gravel'
  | 'loose'
  | 'unknown'

export type SurfaceMeta = {
  label: string
  description: string
  color: string
}

export const SURFACE_META: Record<SurfaceCategory, SurfaceMeta> = {
  paved: {
    label: 'Bitume',
    description: 'Asphalte, béton, pavés',
    color: '#475569',
  },
  compacted: {
    label: 'Compacté',
    description: 'Stabilisé, fin gravier compacté',
    color: '#a16207',
  },
  gravel: {
    label: 'Gravier',
    description: 'Gravier, cailloux, non revêtu',
    color: '#92400e',
  },
  loose: {
    label: 'Meuble',
    description: 'Terre, sable, herbe',
    color: '#b91c1c',
  },
  unknown: {
    label: 'Inconnu',
    description: 'Revêtement non précisé',
    color: '#cbd5e1',
  },
}

export const SURFACE_ORDER: SurfaceCategory[] = [
  'paved',
  'compacted',
  'gravel',
  'loose',
  'unknown',
]

export type SurfaceBand = {
  category: SurfaceCategory
  rawSurface: string | null
  startM: number
  endM: number
  distanceM: number
}

export type SegmentBundle = {
  segments: Segment[]
  segmentsGeoJson: FeatureCollection
  breakdown: BreakdownEntry[]
  surfaceBands: SurfaceBand[]
}

export function classifySurface(surface: string | null | undefined): SurfaceCategory {
  if (!surface) return 'unknown'
  const s = surface.toLowerCase()
  if (
    s === 'asphalt' ||
    s === 'paved' ||
    s === 'concrete' ||
    s === 'paving_stones' ||
    s === 'sett' ||
    s === 'cobblestone' ||
    s === 'chipseal' ||
    s === 'metal' ||
    s === 'wood'
  ) {
    return 'paved'
  }
  if (s === 'compacted' || s === 'fine_gravel') return 'compacted'
  if (s === 'gravel' || s === 'pebblestone' || s === 'unpaved') return 'gravel'
  if (
    s === 'dirt' ||
    s === 'earth' ||
    s === 'ground' ||
    s === 'sand' ||
    s === 'mud' ||
    s === 'grass'
  ) {
    return 'loose'
  }
  return 'unknown'
}

function parseTags(s: string): Record<string, string> {
  const out: Record<string, string> = {}
  if (!s) return out
  for (const pair of s.split(/\s+/)) {
    if (!pair) continue
    const idx = pair.indexOf('=')
    if (idx > 0) {
      out[pair.slice(0, idx)] = pair.slice(idx + 1)
    }
  }
  return out
}

export function classifyTags(tagsStr: string): SegmentCategory {
  const tags = parseTags(tagsStr)
  const highway = tags.highway

  if (highway === 'cycleway') return 'cycleway'

  if (
    tags.bicycle === 'designated' &&
    (highway === 'path' || highway === 'footway' || highway === 'pedestrian')
  ) {
    return 'shared-bike'
  }

  const cyclewayLane =
    tags.cycleway === 'lane' ||
    tags.cycleway === 'track' ||
    tags['cycleway:left'] === 'lane' ||
    tags['cycleway:right'] === 'lane' ||
    tags['cycleway:both'] === 'lane'
  if (cyclewayLane) return 'shared-bike'

  if (
    highway === 'motorway' ||
    highway === 'motorway_link' ||
    highway === 'trunk' ||
    highway === 'trunk_link'
  ) {
    return 'highway-fast'
  }

  if (
    highway === 'primary' ||
    highway === 'primary_link' ||
    highway === 'secondary' ||
    highway === 'secondary_link'
  ) {
    return 'major-road'
  }

  if (highway === 'tertiary' || highway === 'tertiary_link') return 'minor-road'

  if (
    highway === 'residential' ||
    highway === 'living_street' ||
    highway === 'unclassified' ||
    highway === 'service' ||
    highway === 'track' ||
    highway === 'path' ||
    highway === 'footway' ||
    highway === 'pedestrian' ||
    highway === 'bridleway'
  ) {
    return 'quiet-road'
  }

  return 'unknown'
}

type RawMessage = string[]

type FeatureProps = {
  messages?: RawMessage[]
}

export function buildSegments(geojson: FeatureCollection): SegmentBundle {
  const empty: SegmentBundle = {
    segments: [],
    segmentsGeoJson: { type: 'FeatureCollection', features: [] },
    breakdown: [],
    surfaceBands: [],
  }

  const feature = geojson.features?.[0]
  if (!feature || feature.geometry?.type !== 'LineString') return empty

  const coords = (feature.geometry as LineString).coordinates as [
    number,
    number,
    ...number[],
  ][]
  const props = (feature.properties ?? {}) as FeatureProps
  const messages = props.messages ?? []
  if (messages.length < 2) return empty

  const header = messages[0]
  const wayTagsIdx = header.indexOf('WayTags')
  const distIdx = header.indexOf('Distance')
  const lngIdx = header.indexOf('Longitude')
  const latIdx = header.indexOf('Latitude')
  if (wayTagsIdx === -1 || distIdx === -1 || lngIdx === -1 || latIdx === -1) {
    return empty
  }

  // BRouter emits one message per way transition (NOT per coordinate point), so
  // messages.length << coords.length. Each row carries the lng/lat of the node
  // where the way changes. We map each row to a position in the LineString and
  // slice the polyline accordingly.

  type Mini = {
    coords: [number, number][]
    distanceM: number
    category: SegmentCategory
    tags: Record<string, string>
  }

  const minis: Mini[] = []
  let prevCoordIdx = 0

  for (let row = 1; row < messages.length; row++) {
    const r = messages[row]
    const lng = decodeMessageCoord(r[lngIdx])
    const lat = decodeMessageCoord(r[latIdx])
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
    const tagsStr = r[wayTagsIdx] ?? ''
    const distM = Number(r[distIdx] ?? 0)
    const endIdx = nearestCoordIdx(coords, lng, lat, prevCoordIdx)
    if (endIdx <= prevCoordIdx) continue
    const slice = coords
      .slice(prevCoordIdx, endIdx + 1)
      .map((c) => [c[0], c[1]] as [number, number])
    const tags = parseTags(tagsStr)
    minis.push({
      coords: slice,
      distanceM: Number.isFinite(distM) && distM > 0 ? distM : 0,
      category: classifyTags(tagsStr),
      tags,
    })
    prevCoordIdx = endIdx
  }

  // Trailing tail: append remaining coords to the last mini so the route reaches B.
  if (minis.length > 0 && prevCoordIdx < coords.length - 1) {
    const last = minis[minis.length - 1]
    for (let i = prevCoordIdx + 1; i < coords.length; i++) {
      last.coords.push([coords[i][0], coords[i][1]])
    }
  }

  if (minis.length === 0) return fallbackSingleSegment(coords)

  const surfaceBands = computeSurfaceBands(minis)

  const groups: Segment[] = []
  let cumStart = 0
  let current: {
    category: SegmentCategory
    coords: [number, number][]
    distanceM: number
    highwayCounts: Record<string, number>
    surfaceCounts: Record<string, number>
  } | null = null

  const flush = () => {
    if (!current) return
    if (current.coords.length < 2) {
      current = null
      return
    }
    groups.push({
      category: current.category,
      distanceM: current.distanceM,
      startKm: cumStart / 1000,
      endKm: (cumStart + current.distanceM) / 1000,
      coordinates: current.coords,
      primaryHighway: dominant(current.highwayCounts),
      surface: dominant(current.surfaceCounts),
    })
    cumStart += current.distanceM
    current = null
  }

  for (const mini of minis) {
    if (!current || current.category !== mini.category) {
      flush()
      current = {
        category: mini.category,
        coords: [...mini.coords],
        distanceM: mini.distanceM,
        highwayCounts: {},
        surfaceCounts: {},
      }
    } else {
      // Skip the first point of the new mini — it duplicates the last point
      // of the previous mini.
      for (let i = 1; i < mini.coords.length; i++) {
        current.coords.push(mini.coords[i])
      }
      current.distanceM += mini.distanceM
    }
    if (mini.tags.highway) {
      current.highwayCounts[mini.tags.highway] =
        (current.highwayCounts[mini.tags.highway] ?? 0) + mini.distanceM
    }
    if (mini.tags.surface) {
      current.surfaceCounts[mini.tags.surface] =
        (current.surfaceCounts[mini.tags.surface] ?? 0) + mini.distanceM
    }
  }
  flush()

  const segmentsGeoJson: FeatureCollection = {
    type: 'FeatureCollection',
    features: groups.map((g, idx) => ({
      type: 'Feature',
      properties: {
        category: g.category,
        idx,
      },
      geometry: {
        type: 'LineString',
        coordinates: g.coordinates,
      },
    })),
  }

  const totalDist = groups.reduce((s, g) => s + g.distanceM, 0) || 1
  const byCat: Partial<Record<SegmentCategory, number>> = {}
  for (const g of groups) {
    byCat[g.category] = (byCat[g.category] ?? 0) + g.distanceM
  }
  const breakdown: BreakdownEntry[] = CATEGORY_ORDER.filter(
    (c) => (byCat[c] ?? 0) > 0,
  ).map((c) => ({
    category: c,
    distanceM: byCat[c]!,
    share: byCat[c]! / totalDist,
  }))

  return { segments: groups, segmentsGeoJson, breakdown, surfaceBands }
}

function computeSurfaceBands(
  minis: { distanceM: number; tags: Record<string, string> }[],
): SurfaceBand[] {
  const bands: SurfaceBand[] = []
  let cumStart = 0
  let current: {
    category: SurfaceCategory
    rawSurface: string | null
    distanceM: number
  } | null = null
  for (const m of minis) {
    const raw = m.tags.surface ?? null
    const cat = classifySurface(raw)
    if (!current || current.category !== cat) {
      if (current) {
        bands.push({
          category: current.category,
          rawSurface: current.rawSurface,
          startM: cumStart,
          endM: cumStart + current.distanceM,
          distanceM: current.distanceM,
        })
        cumStart += current.distanceM
      }
      current = { category: cat, rawSurface: raw, distanceM: m.distanceM }
    } else {
      current.distanceM += m.distanceM
      if (!current.rawSurface && raw) current.rawSurface = raw
    }
  }
  if (current) {
    bands.push({
      category: current.category,
      rawSurface: current.rawSurface,
      startM: cumStart,
      endM: cumStart + current.distanceM,
      distanceM: current.distanceM,
    })
  }
  return bands
}

function fallbackSingleSegment(
  coords: ArrayLike<ArrayLike<number>>,
): SegmentBundle {
  const polyline: [number, number][] = []
  for (let i = 0; i < coords.length; i++) {
    polyline.push([coords[i][0], coords[i][1]])
  }
  if (polyline.length < 2) {
    return {
      segments: [],
      segmentsGeoJson: { type: 'FeatureCollection', features: [] },
      breakdown: [],
      surfaceBands: [],
    }
  }
  const distanceM = approxLengthMeters(polyline)
  const segment: Segment = {
    category: 'unknown',
    distanceM,
    startKm: 0,
    endKm: distanceM / 1000,
    coordinates: polyline,
    primaryHighway: null,
    surface: null,
  }
  return {
    segments: [segment],
    segmentsGeoJson: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { category: 'unknown', idx: 0 },
          geometry: { type: 'LineString', coordinates: polyline },
        },
      ],
    },
    breakdown: [{ category: 'unknown', distanceM, share: 1 }],
    surfaceBands: [
      {
        category: 'unknown',
        rawSurface: null,
        startM: 0,
        endM: distanceM,
        distanceM,
      },
    ],
  }
}

function approxLengthMeters(coords: [number, number][]): number {
  let total = 0
  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1]
    const [lng2, lat2] = coords[i]
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLng = (lng2 - lng1) * (Math.PI / 180)
    const meanLat = ((lat1 + lat2) / 2) * (Math.PI / 180)
    const x = dLng * Math.cos(meanLat)
    total += Math.sqrt(x * x + dLat * dLat) * 6_371_000
  }
  return total
}

// BRouter encodes lng/lat in `messages` as integer microdegrees ("4805500" = 4.8055°).
// Older or alternate outputs might use decimal — fall back if the value looks decimal.
function decodeMessageCoord(s: string | undefined): number {
  if (s == null) return NaN
  const n = Number(s)
  if (!Number.isFinite(n)) return NaN
  if (Math.abs(n) > 1000) return n / 1_000_000
  return n
}

function nearestCoordIdx(
  coords: ArrayLike<ArrayLike<number>>,
  lng: number,
  lat: number,
  fromIdx: number,
): number {
  let bestIdx = fromIdx
  let bestDist = Infinity
  for (let i = fromIdx; i < coords.length; i++) {
    const c = coords[i]
    const dlng = c[0] - lng
    const dlat = c[1] - lat
    const d = dlng * dlng + dlat * dlat
    if (d < bestDist) {
      bestDist = d
      bestIdx = i
      if (d < 1e-12) break
    }
  }
  return bestIdx
}

function dominant(counts: Record<string, number>): string | null {
  let best: string | null = null
  let bestVal = 0
  for (const [k, v] of Object.entries(counts)) {
    if (v > bestVal) {
      bestVal = v
      best = k
    }
  }
  return best
}
