# Velo Maps

Web app de calcul d'itinéraires vélo en France, qui privilégie les voies cyclables référencées dans OpenStreetMap (EuroVélo, ViaRhôna, voies vertes régionales, etc.) — là où Google Maps a tendance à proposer des voies rapides ou des détours inadaptés.

L'app est 100 % statique côté frontend et s'appuie sur des services open source publics : pas de backend, pas de clé d'API, pas de compte.

Voir [`CADRAGE.md`](./CADRAGE.md) pour le contexte, l'analyse de [cycle.travel](https://cycle.travel/) (notre référence) et le périmètre du MVP.

## Fonctionnalités

- Calcul d'itinéraire A → B → … avec waypoints multiples et drag-to-reorder.
- 4 profils de routage : **Route** (vélo route), **Mixte** (par défaut), **Tranquille** (préfère pistes et routes calmes) et **Court**.
- Jusqu'à 3 alternatives renvoyées par BRouter, sélectionnables sur la carte.
- Profil altimétrique synchronisé avec le survol de la carte.
- Bandes de surface (revêtement, type de voie) pour visualiser la qualité du parcours.
- Géolocalisation au chargement + recherche d'adresse (Nominatim, restreinte à la France).
- Export GPX direct depuis BRouter (compatible Komoot, OsmAnd, Garmin, Google My Maps).
- État de l'itinéraire encodé dans l'URL (`#`) — partageable, rechargeable.

## Stack

| Couche | Choix |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Carte | MapLibre GL JS via `react-map-gl` |
| Styling | Tailwind CSS v4 (plugin Vite) |
| Data fetching | TanStack Query |
| Géométrie | Turf.js |
| Lint | ESLint + typescript-eslint |
| Déploiement | Cloudflare Pages (Wrangler) |

## Services externes

Tous gratuits et open, aucune clé à gérer.

| Service | Usage |
|---|---|
| [BRouter](https://brouter.de/) (instance publique `brouter.de`) | Calcul d'itinéraire vélo basé sur OSM |
| [Nominatim](https://nominatim.openstreetmap.org/) | Géocodage des adresses |
| [Tuiles OSM standard](https://tile.openstreetmap.org/) | Fond de carte raster |

Les données sous-jacentes (OpenStreetMap) sont publiées sous licence ODbL. Pour Nominatim et BRouter, l'instance publique est en *fair-use* : un self-host (Docker) sera nécessaire si l'usage prend de l'ampleur.

## Pré-requis

- Node.js 20+
- pnpm

## Installation

```bash
pnpm install
```

## Scripts

```bash
pnpm dev       # serveur de dev Vite (http://localhost:5173)
pnpm build     # type-check (tsc -b) + build de production dans dist/
pnpm preview   # sert le build local
pnpm lint      # ESLint sur tout le repo
pnpm deploy    # build + déploiement sur Cloudflare Pages (projet velo-maps)
```

Le déploiement nécessite [Wrangler](https://developers.cloudflare.com/workers/wrangler/) authentifié (`wrangler login`).

## Utilisation

1. Lancer `pnpm dev` et ouvrir [http://localhost:5173](http://localhost:5173).
2. Autoriser la géolocalisation (ou laisser le fallback France entière).
3. Ajouter un point en cliquant sur la carte, ou via la recherche d'adresse dans la sidebar.
4. Ajouter un ou plusieurs points supplémentaires — réordonner par drag depuis la sidebar.
5. Choisir un profil de routage (Mixte par défaut).
6. Comparer les alternatives, survoler le profil altimétrique, télécharger le GPX.

## Structure

```
src/
├── components/     # Map, Sidebar, AddressSearch, ElevationChart, SurfaceBands
├── lib/            # brouter, nominatim, segments, elevation, urlState, geolocation, format
├── App.tsx         # état global (points, profile, sélection) + URL sync
└── types.ts        # types partagés et liste des profils
```

## Inspiration

[cycle.travel](https://cycle.travel/) reste l'état de l'art du genre — moteur de routage maison, tuiles custom, contenu éditorial. Velo Maps est un projet beaucoup plus modeste qui mise sur l'écosystème existant (BRouter + OSM) plutôt que sur du pré-traitement custom.
