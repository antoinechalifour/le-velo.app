# Le Vélo — Audit refacto

Scan du code post-MVP. Trois objectifs :
1. Moins de `useState` / `useEffect` (dériver depuis l'URL via **nuqs**, ou depuis les props).
2. Moins de composants verbeux (extraire entités/fonctions pures, passer des objets de domaine, store **jotai** pour l'état partagé).
3. Modulariser (colocaliser hook + queryOptions + types + fns ; séparer UI graphique de la donnée ; namespaces par feature).

Légende :
- ✅ **GOOD** — à conserver tel quel
- 🟡 **FINE** — petit polish, pas prioritaire
- 🔧 **REWRITE** — à retoucher dans le cadre de cette passe

---

## 0. Décisions à arbitrer avant de coder

| Question | Mon avis |
|---|---|
| **nuqs sans router ou avec TanStack Router ?** | Il n'y a aucun router aujourd'hui. nuqs marche très bien en standalone avec `<NuqsAdapter>`. Inutile d'introduire TanStack Router pour une SPA mono-écran. Si on en ajoute un un jour, l'adapter `tanstack-router` est trivial à brancher. **→ nuqs en standalone pour l'instant.** |
| **jotai partout ou ciblé ?** | Cibler. État partagé entre composants éloignés (Map ↔ Sidebar) : atomes jotai. URL : nuqs. État local à un composant : `useState`. Pas de "store global" pour tout. |
| **Hash (#…) ou search (?…) ?** | nuqs gère les deux. Le hash actuel fonctionne mais le search est plus propre côté partage/SEO/copier-coller. **→ migration vers search params.** |
| **Format URL points** | On garde `lat,lng,label` séparés par `;` pour rester compact et lisible — `parseAsArrayOf` de nuqs sait faire. |

---

## 1. État inventorié — où va quoi

État actuel d'`App.tsx` :

| State | Verdict | Cible |
|---|---|---|
| `points` | 🔧 dérivable URL | **nuqs** `parseAsArrayOf(point)` |
| `profile` | 🔧 dérivable URL | **nuqs** `parseAsStringEnum(PROFILES)` |
| `selectedRouteIdx` | 🔧 partageable | **nuqs** `parseAsInteger.withDefault(0)` (clamp côté lecteur) |
| `highlightedSegmentIdx` | 🔧 partagé Map↔Sidebar | **jotai** `highlightedSegmentIdxAtom` |
| `profileHover` | 🔧 partagé Chart↔Map↔Sidebar | **jotai** `profileHoverAtom` |
| `sheetOpen` | 🟡 UI mobile | **jotai** ou `useState` remonté dans `Sidebar` — pas besoin que `Map` le voie |
| `flyRequest` / `fitRequest` | 🔧 nonce-keyed = code smell | événement caméra (voir §3) |
| `initialFlyFromUrlRef` | 🔧 hack one-shot | déduit au montage par `Map` |
| `hadDataRef` (ouverture sheet) | 🔧 effet bricolé | hook dédié `useAutoOpenSheetOnFirstResult` |

Et `useEffect` à supprimer / déplacer :
- ❌ Effet de sérialisation URL → nuqs s'en charge.
- ❌ Effet "reset selectedRouteIdx sur changement de data" → dérivé : `Math.min(idx, routes.length - 1)`.
- ❌ Effet "fly initial depuis URL" → déduit une fois au montage de `Map`.
- 🟡 Effet "ouverture sheet à la 1ère donnée" → isolé dans un hook custom.

---

## 2. Fichier par fichier

### `App.tsx` — 🔧 REWRITE

185 lignes, 8 `useState`, 4 `useEffect`. C'est le hub à éclater.

Cible : ~40 lignes, juste le layout + le branchement `useRoutesQuery()` (issu de `brouter/queryOptions.ts`).

À extraire :
- `pointsKey()` → déménage dans `brouter/queryOptions.ts` (c'est la clé de cache du module brouter).
- Calcul du `fitRequest` initial (bbox des points URL) → `geo/bbox.ts` (`bboxOf(points: LngLat[])`).
- Handlers `handleAddPoint`, `handleRemovePoint`, `handleReorderPoints`, `handleReset` → soit jotai actions, soit `usePoints()` hook qui expose `{ points, add, remove, reorder, reset }` et écrit dans nuqs.

### `components/Map.tsx` — 🔧 REWRITE léger

- ✅ `MapLibre` + `Source`/`Layer` bien utilisés.
- 🔧 `flyRequest`/`fitRequest`/`initialCenter` = 3 props imperatives nonce-keyed. **À fusionner** en un seul "camera command" : une action jotai `cameraAtom.set({ type: 'flyTo', point })` consommée par un `useMapCamera(mapRef)` à l'intérieur de `Map`. Une seule source de vérité pour les commandes.
- 🔧 `buildCategoryColorExpression()` + `alternativesGeoJson` → déménagent dans `map/expressions.ts` (purs).
- 🔧 Le bloc `Pin` + `HoverDot` + le rendu des markers → `map/RoutePointMarkers.tsx` qui prend `points: RoutePoint[]` et c'est tout. La règle `start/waypoint/end` est déjà dans la Sidebar (`pointRole`) : **dédupliquer** dans `route/point-role.ts`.

### `components/Sidebar.tsx` — 🔧 REWRITE (le pire offender)

**758 lignes, 14 props.** Le composant racine est en réalité 8 mini-composants colocalisés.

Découpe proposée (un fichier par bloc) :

```
sidebar/
  Sidebar.tsx           # juste layout + Drawer mobile + slots
  PeekBar.tsx           # + computePeekStatus pure fn
  ProfilePicker.tsx     # lit/écrit profile via nuqs
  PointList.tsx         # lit/écrit points via nuqs (drag&drop local)
  Alternatives.tsx      # lit/écrit selectedRouteIdx via nuqs
  Stats.tsx
  Composition.tsx
  SegmentList.tsx       # lit highlightedSegmentIdx via jotai
  hooks/useDragReorder.ts  # extrait du PointList
  icons/{Logo,Chevron,Close}.tsx
```

Avec nuqs + jotai, `Sidebar` n'a **plus de props** (sauf peut-être `routes` issu du query). Chaque sous-composant lit ce dont il a besoin. Fini le prop-drilling.

### `components/AddressSearch.tsx` — 🔧 REWRITE

5 `useState` + 2 `useEffect`. Le gros effet "debounce + fetch + abort" disparaît avec react-query :

```ts
const debouncedQuery = useDebouncedValue(query, 300)
const { data: results = [], isFetching } = useQuery(
  nominatimSearchQueryOptions(debouncedQuery),
)
```

→ on tombe à `query`, `open`, `activeIdx` (3 states locaux), zéro effet métier. Garder un seul `useEffect` pour le click-outside, ou mieux : `useClickOutside(ref, () => setOpen(false))`.

### `components/ElevationChart.tsx` — 🔧 REWRITE structurel

Aujourd'hui le chart **connaît** `ElevationPoint` (avec sa `LngLat`) et émet un `point` au survol. Trop couplé.

Cible : un composant générique de série temporelle.

```
charts/
  AreaChart.tsx          # props: { points: { x, y }[], hoveredX, onHoverX }
  buildPath.ts           # pure: { areaPath, linePath, xScale, yScale }
  nearestX.ts            # pure: binary search
```

Puis un wrapper `ElevationChart` qui :
- traduit `ElevationPoint[]` en `{x: distanceM, y: elevationM}[]`
- traduit `hoveredX` retour en `{ distanceM, point }` pour émettre vers la Map.

Bénéfice : le jour où on ajoute un chart de surface ou de pente, c'est gratuit.

### `components/SurfaceBands.tsx` — ✅ GOOD

Composant purement présentationnel, déjà propre.

Petit polish : sortir `totals` en pure fn `surfaceTotals(bands)` dans `route/surface-bands.ts` à côté du type.

### `lib/brouter.ts` — 🟡 FINE, mais à scinder en namespace

Logique solide. Réorganiser pour colocaliser :

```
brouter/
  url.ts                # buildBrouterUrl + pointsKey
  types.ts              # BrouterMessage, BrouterTrackProps
  parse.ts              # parseStats
  client.ts             # fetchRoutes, fetchSingleRoute
  queryOptions.ts       # routesQueryOptions(points, profile) + useRoutesQuery
```

Le `pointsKey()` qui traîne dans `App.tsx` revient ici (sa raison d'être est la clé de cache).

### `lib/elevation.ts` — ✅ GOOD

Pur, court, lisible. Déménager sous `route/elevation.ts` pour cohérence.

### `lib/segments.ts` — 🔧 REWRITE (organisation)

569 lignes qui mélangent 5 préoccupations. À éclater :

```
route/
  segment-category.ts   # SegmentCategory + CATEGORY_META + CATEGORY_ORDER
  surface.ts            # SurfaceCategory + SURFACE_META + classifySurface
  tags.ts               # parseTags + classifyTags  (pure OSM-tags logic)
  segments.ts           # Segment type + buildSegments
  breakdown.ts          # BreakdownEntry + buildBreakdown
  surface-bands.ts      # SurfaceBand + buildSurfaceBands
```

Logique elle-même : ✅ bonne, à ne pas toucher. Juste la séparation des modules.

### `lib/urlState.ts` — ❌ SUPPRIMER

Remplacé intégralement par nuqs + un `route/point.ts` qui exporte un `parseAsPoint` (parser custom nuqs pour `lat,lng,label`).

### `lib/geolocation.ts` — ✅ GOOD

Un hook, un état machine propre. Rien à faire.

### `lib/nominatim.ts` — 🟡 FINE

Ajouter un `nominatimSearchQueryOptions(query)` dans le même fichier (colocalisation requête / queryOptions).

### `lib/format.ts` — ✅ GOOD

Petites pures fns d'affichage. Reste tel quel.

### `types.ts` — 🔧 à diluer

Le module fourre-tout disparaît. Chaque type rejoint son domaine :
- `LngLat` → `geo/lng-lat.ts` (le seul vraiment transverse)
- `RoutePoint`, `Endpoint` → `route/point.ts`
- `RouteResult`, `RouteStats` → `route/route.ts`
- `RoutingProfile`, `PROFILES`, `ProfileMeta` → `route/profile.ts`

Pas besoin de garder un `types.ts` global après ça.

---

## 3. Pattern "camera command" pour la Map

Aujourd'hui, pour dire à la Map "vole sur ce point", on incrémente un `nonce`. Trois props nonce-keyed. Couplage fort App ↔ Map.

Cible :

```ts
// map/camera.ts
type CameraCommand =
  | { type: 'flyTo'; point: LngLat; zoom?: number }
  | { type: 'fitBounds'; bbox: [LngLat, LngLat] }

export const cameraCommandAtom = atom<CameraCommand | null>(null)
```

Dans `Map`, un seul `useEffect` consomme l'atom et réinitialise à `null` après application. Émetteurs (sélection d'adresse, init depuis URL…) écrivent dans l'atom. Plus de nonces, plus de refs jonglées.

---

## 4. Cible architecturale après refacto

```
src/
  geo/                  # primitives géographiques (LngLat, bbox, haversine)
  route/                # tout ce qui décrit un itinéraire (point, profile, segment, ...)
  brouter/              # client + queryOptions
  nominatim/            # client + queryOptions  (ex-AddressSearch)
  map/                  # composants MapLibre + atoms caméra + expressions
  sidebar/              # composants UI du panneau latéral
  charts/               # composants graphiques agnostiques + wrappers
  state/                # atomes jotai transverses (highlight, hover, sheet)
  ui/                   # primitives (icons, layout) si réutilisables
  App.tsx
  main.tsx
```

Règle : **un composant ne reçoit jamais en props ce qu'il peut lire dans un atom ou dans nuqs**. Les props restent pour les objets de domaine (`route`, `segments`, …), pas pour leurs morceaux.

---

## 5. Ordre d'attaque suggéré

1. **Installer nuqs + jotai**, brancher `<NuqsAdapter>` et le `Provider` jotai dans `main.tsx`.
2. **Éclater `lib/segments.ts`** en `route/*` (zéro changement comportemental, gain immédiat de lisibilité).
3. **Migrer URL state vers nuqs**, supprimer `lib/urlState.ts` et les effets correspondants.
4. **Atomes jotai** pour `highlightedSegmentIdx`, `profileHover`, `cameraCommand`.
5. **Éclater `Sidebar`** en modules `sidebar/*`, supprimer les props devenues inutiles.
6. **Refactor `AddressSearch`** en react-query + `useDebouncedValue`.
7. **Génériciser `ElevationChart`**, isoler `charts/AreaChart`.
8. **Renommer `App.tsx`** en simple layout (~40 lignes).

Chaque étape est mergeable indépendamment et testable visuellement.
