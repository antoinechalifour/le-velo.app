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

export function surfaceLabel(surface: string | null | undefined): string {
  return SURFACE_META[classifySurface(surface)].label
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
