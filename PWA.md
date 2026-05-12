# PWA — Reste à faire pour "Add to Homescreen"

État actuel vérifié contre `vite.config.ts`, `index.html`, le `dist/` et `node_modules/vite-plugin-pwa`.

## Déjà bon (vérifié)

- Manifest généré (`dist/manifest.webmanifest`) avec `name`, `short_name`, `start_url: '/'`, `display: 'standalone'`, `scope: '/'`, `lang: 'fr'`, `theme_color`, `background_color`.
- Icônes : `pwa-192x192.png` (192×192), `pwa-512x512.png` (512×512), `pwa-maskable-512x512.png` (512×512, `purpose: 'maskable'`).
- `apple-touch-icon.png` est bien **180×180** (taille correcte iOS).
- Service Worker enregistré automatiquement : `dist/registerSW.js` est généré et injecté via `<script id="vite-plugin-pwa:register-sw" src="/registerSW.js">` dans `dist/index.html`. `registerType: 'autoUpdate'` active `skipWaiting` + `clientsClaim` côté Workbox par défaut.
- Métas iOS dans `index.html` : `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`, `theme-color`, viewport `viewport-fit=cover`.
- Runtime caching configuré pour les tuiles, fonts, etc. (`vite.config.ts`).

## Fait dans ce passage

- `index.html` : `<html lang="en">` → `<html lang="fr">` (cohérence avec le manifest).
- Manifest : ajout de `id: '/'`.
- Manifest : `purpose: 'any'` explicite sur les icônes 192/512.

## À tester en prod (hypothèses)

À valider depuis un Chrome Android et un Safari iOS sur l'URL prod (HTTPS requis) :

- L'invitation native "Ajouter à l'écran d'accueil" apparaît bien dans Chrome Android.
- Une fois installée, l'app démarre en standalone, theme color appliqué, icône correcte sur le springboard.
- Le SW prend le contrôle au premier load (DevTools → Application → Service Workers).
- Pas de warnings dans Lighthouse → PWA / Installability.

## Améliorations recommandées (non bloquantes)

### Manifest

- **`screenshots`** : sans capture `form_factor: 'narrow'` et `form_factor: 'wide'`, Chrome Android affiche le mini-infobar minimaliste à la place de la "rich install UI". Format PNG, 1080×1920 (narrow) et 1920×1080 (wide).
- Le PNG maskable est encodé en **16-bit RGB** alors que les autres icônes sont en 8-bit colormap. Curiosité, pas bloquant — vérifier juste que la safe zone (40 % du diamètre central) est bien respectée visuellement.

### UX d'install

- **Bouton install custom (Android/Chrome)** : sans intercepter `beforeinstallprompt`, l'utilisateur doit passer par le menu navigateur. Stocker l'évènement et exposer un bouton "Installer l'app" dans la sidebar. Hypothèse : améliore le taux d'install — à mesurer.
- **Hint iOS** : Safari n'expose pas `beforeinstallprompt`. Détecter Safari iOS + `!navigator.standalone`, afficher un petit hint "Partager → Ajouter à l'écran d'accueil".
- **Détection standalone** : `window.matchMedia('(display-mode: standalone)')` pour adapter l'UI une fois installée (masquer le bouton "Installer", retour custom, etc.).

## Optionnels (plus tard)

- `shortcuts` dans le manifest pour les raccourcis long-clic Android (ex. "Nouvel itinéraire").
- `share_target` pour recevoir une localisation depuis une autre app.
- Page offline dédiée plus parlante que `index.html` quand réseau down + tuiles absentes du cache.
