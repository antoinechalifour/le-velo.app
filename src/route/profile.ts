export type RoutingProfile = 'fastbike' | 'trekking' | 'safety' | 'shortest'

export type ProfileMeta = {
  id: RoutingProfile
  label: string
  hint: string
}

export const PROFILES: ProfileMeta[] = [
  {
    id: 'fastbike',
    label: 'Route',
    hint: 'Vélo route — privilégie le bitume, allure rapide.',
  },
  {
    id: 'trekking',
    label: 'Mixte',
    hint: 'Polyvalent — alterne bitume et chemins stabilisés. Par défaut.',
  },
  {
    id: 'safety',
    label: 'Confort',
    hint: 'Minimise le trafic motorisé. Préfère pistes cyclables et routes calmes, quitte à rallonger.',
  },
  {
    id: 'shortest',
    label: 'Court',
    hint: 'Le plus direct kilométriquement. Ignore confort et sécurité.',
  },
]

export const PROFILE_IDS: RoutingProfile[] = PROFILES.map((p) => p.id)
