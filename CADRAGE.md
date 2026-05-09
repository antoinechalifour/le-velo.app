# Velo Maps — Document de cadrage

## 1. Contexte & problème

Itinéraires vélo proposés par Google Maps souvent inadaptés : voies rapides, zones privées, détours dangereux.
Pourtant, il existe un réseau riche de voies cyclables **référencées et signalées** : EuroVélo, ViaRhôna, Durance à vélo, voies vertes régionales, etc. Toutes sont déjà cartographiées dans OpenStreetMap.

**Objectif** : une app web qui calcule un itinéraire A → B en France en privilégiant ces voies référencées, pour des trajets sûrs et plaisants à vélo.

**Cas d'usage de référence** : Avignon ↔ Saint-Rémy-de-Provence (et autres trajets Provence), extensible à toute la France.

## 2. Analyse de l'existant : cycle.travel

[cycle.travel](https://cycle.travel/) est l'état de l'art de ce qu'on cherche à faire. C'est essentiellement notre référence — autant en être conscient.

### Qui & quoi
- Construit par **Richard Fairhurst**, contributeur OSM depuis 2004 (ex-mainteneur de l'éditeur Potlatch). Projet largement solo.
- Web app + app iOS, basé entièrement sur **OpenStreetMap**.
- Couverture : UK, Europe (donc France), Amérique du Nord, Australie, Nouvelle-Zélande.
- Modèle : gratuit, financé par dons et abonnement optionnel pour features premium.

### Fonctionnalités principales
- **Routage A → B** vélo, multi-waypoints, avec turn-by-turn.
- **Style cartographique custom** qui met en avant les petites routes et minimise les grands axes (à l'inverse des cartes routières classiques).
- **Affichage des voies cyclables nationales et locales** (NCN/RCN) sans qu'elles dominent visuellement.
- **Évitement des routes à fort trafic** via des données de trafic réel (où disponibles) — pas seulement la signalisation.
- **Import GPX avec re-routage automatique** : tu importes un GPX, il reconstruit l'itinéraire avec ses propres règles + ajoute turn-by-turn et profil altimétrique.
- **Export multi-format** : GPX (track + route), TCX (course + activity), KML, PDF, embed HTML.
- **Données d'altitude** incluses dans les exports.
- **Recherche d'hébergements** (hôtels, campings) le long de l'itinéraire.
- **Planification multi-jours** pour cyclotourisme.
- Contenu éditorial : guides de longues distances, conseils urbains.

### Dessous techniques (ce qu'on en sait publiquement)
- **Plusieurs milliers de lignes de code** dédiées au pré-traitement d'OSM pour le rendre exploitable côté vélo (citations de Fairhurst lui-même).
- Moteur de routage **maison**, pas BRouter. Souvent décrit comme « peut-être le moteur de routage vélo le plus avancé au monde » — formulation de Fairhurst, à prendre comme telle.
- Tuiles vectorielles custom.
- Ingestion régulière de données OSM.

### Ce qu'on en retient pour notre projet
- **Validation** : l'approche "OSM + routage spécialisé + style adapté" fonctionne et a un public.
- **Le différenciateur n'est pas la techno mais le pré-traitement OSM et la qualité du moteur**. Le gap entre "BRouter avec profil custom" et "cycle.travel" mesure l'ampleur de ce travail invisible.
- **Pour un projet bidouille perso**, viser l'iso-fonctionnel serait absurde. On vise plutôt :
  - Un MVP fonctionnel pour les trajets qui nous concernent (Provence d'abord).
  - Le plaisir de comprendre comment ça marche en construisant.
  - Éventuellement des features que cycle.travel n'a pas : intégrations spécifiques (Google My Maps, partage simple), focus France/voies vertes signalées, UI ultra-épurée orientée "trajet régulier" vs "tour", etc.
- **Honnête disclaimer dans le README final** : citer cycle.travel comme inspiration et référence.

## 3. Périmètre du MVP

### Inclus
- Web app (pas de mobile natif).
- Routage **automatique** A → B : l'utilisateur saisit/clique deux points, l'app calcule.
- Couverture **France entière**.
- Préférence forte pour les voies cyclables référencées OSM (relations `route=bicycle`, niveaux `icn`/`ncn`/`rcn`/`lcn`).
- Affichage de l'itinéraire sur carte + export GPX (compatible Komoot, OsmAnd, Garmin, Google My Maps…).
- Visualisation du réseau de voies cyclables référencées en surimpression de la carte.

### Hors périmètre (pour plus tard)
- Édition manuelle de segments (mode "je clique les portions à inclure").
- Multi-waypoints, boucles, planification multi-jours.
- Compte utilisateur, sauvegarde d'itinéraires.
- Mobile, hors-ligne, navigation turn-by-turn.
- Export direct vers Google Maps (limité techniquement, GPX couvre 95% du besoin).

## 4. Architecture proposée

```
┌──────────────┐      ┌─────────────┐      ┌──────────────────┐
│  Web app     │─────▶│  BRouter    │─────▶│  OSM data        │
│  (React/SPA) │      │  (public)   │      │  (rd5 préprocessé)│
└──────┬───────┘      └─────────────┘      └──────────────────┘
       │
       │  Affichage couche "voies cyclables"
       ▼
┌──────────────┐
│  Overpass API│  (relations route=bicycle France)
└──────────────┘
```

### 4.1 Frontend
- SPA (React + Vite par exemple, à confirmer).
- Carte via **MapLibre GL JS** (ou Leaflet si on veut plus simple) avec tuiles **OpenStreetMap** ou **CyclOSM** (style spécifiquement vélo, met en avant pistes/voies).
- Géocodage des adresses : **Nominatim** (OSM) ou **Photon**.

### 4.2 Routage : BRouter
- Moteur open-source spécialisé vélo, basé sur OSM.
- API HTTP : `GET https://brouter.de/brouter?lonlats=...&profile=...&format=geojson`
- **Instance publique gratuite** pour démarrer (pas de clé, pas de quota strict pour usage perso).
- **Profil custom** à écrire : variante de `trekking` ou `safety` qui boost fortement les ways appartenant à une relation `rcn`/`ncn`/`icn`. Format `.brf` (texte).
- Si l'instance publique pose problème plus tard → self-host via Docker.

### 4.3 Affichage du réseau cyclable
- Requête **Overpass API** au chargement (ou par bbox) pour récupérer les relations `route=bicycle` sur la zone visible.
- Cache côté client + éventuellement génération d'un GeoJSON statique France entière (taille à mesurer, sinon découpé par région).
- Style différencié par niveau : EuroVélo en gras, national en couleur soutenue, régional plus discret.

### 4.4 Export
- **GPX** généré côté client à partir du GeoJSON renvoyé par BRouter.
- Bouton "télécharger .gpx".
- (Plus tard : URL partageable, export Komoot via leur API.)

## 5. Sources de données

| Source | Usage | Licence |
|---|---|---|
| **OpenStreetMap** | Données de base (routes, relations cyclables) | ODbL |
| **BRouter** (instance publique brouter.de) | Calcul d'itinéraire | Service gratuit |
| **Overpass API** (overpass-api.de) | Requêtes ciblées sur relations cyclables | Service gratuit, fair-use |
| **Tuiles OSM standard** ou **CyclOSM** | Fond de carte | Attribution requise |
| **Nominatim** | Géocodage adresses | Service gratuit, fair-use |

Tous gratuits, tous open. Aucune clé d'API à gérer pour le MVP.

**Note fair-use** : Overpass et Nominatim demandent un user-agent identifiable et un usage raisonnable. Si l'app prend de l'ampleur → self-host ou service payant.

## 6. Flow utilisateur (MVP)

1. L'utilisateur ouvre la web app, voit la carte de France avec le réseau cyclable en surimpression.
2. Il saisit ou clique un point de **départ** et un point d'**arrivée**.
3. L'app appelle BRouter avec un profil "prefer-signed-cycling-routes".
4. L'itinéraire s'affiche sur la carte, avec stats (distance, dénivelé, % sur voies référencées).
5. Bouton "Télécharger GPX" → fichier prêt à importer dans n'importe quelle app de nav.

## 7. Risques & inconnues

- **Qualité du profil BRouter** : c'est là que se joue la pertinence. Demande de l'itération et du test sur des trajets connus (le fameux Avignon ↔ St-Rémy comme banc d'essai).
- **Couverture OSM des relations cyclables** : excellente en France (la plupart des voies majeures sont mappées), mais inégale en local. À vérifier sur les trajets cibles.
- **Performance Overpass** sur la France entière** : possiblement lent. Plan B = générer un GeoJSON statique à partir d'un extract Geofabrik et le servir en tuiles vectorielles.
- **Limites de l'instance publique BRouter** : pas de SLA. Si ça pose problème → Docker self-hosted.

## 8. Étapes proposées

1. **Spike technique** : tester l'API BRouter publique avec un profil par défaut sur Avignon → St-Rémy. Comparer avec Google Maps. (~1h)
2. **Profil custom** : itérer un `.brf` qui privilégie les relations cyclables. Banc d'essai : 3-4 trajets connus. (~quelques heures)
3. **Squelette web app** : carte + saisie A/B + appel BRouter + tracé. (~1 jour)
4. **Couche réseau cyclable** : Overpass + style. (~½ jour)
5. **Export GPX** + polissage UI. (~½ jour)

À ce stade, MVP utilisable pour soi-même.

## 9. Questions ouvertes

- Stack frontend exacte (React/Vue/Svelte, MapLibre/Leaflet) — à figer au moment du spike.
- Hébergement : Vercel / Netlify / GitHub Pages suffisent (app 100% statique côté front, BRouter et Overpass sont externes).
- Nom de l'app / domaine.
