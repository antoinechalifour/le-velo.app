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
