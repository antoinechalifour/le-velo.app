# Le Vélo — Tâches à venir

Liste des améliorations identifiées au-delà du MVP. Voir [CADRAGE.md](./CADRAGE.md) pour le contexte général.

## 1. Saisie d'adresse manuelle

Permettre la saisie d'une adresse au clavier en plus du clic sur la carte pour définir départ et arrivée.

- Champ de recherche avec autocomplétion via Nominatim (ou Photon).
- Respect du fair-use : user-agent identifiable, debounce des requêtes.
- Garder le clic sur la carte comme alternative.

## 2. Persistance de l'état dans l'URL

Sérialiser l'état de l'itinéraire dans l'URL pour permettre le partage et le rechargement.

- Points (départ, arrivée, waypoints) encodés dans l'URL.
- Mode/profil de routage également persisté.
- Format compact (ex. polyline encoding ou simple `lat,lon` séparés).
- Synchronisation bidirectionnelle URL ↔ état applicatif.

## 3. Widget dénivelé sur distance

Graphique du profil altimétrique le long de l'itinéraire, intégré aux détails.

- Axe X : distance cumulée. Axe Y : altitude.
- Survol synchronisé avec la carte (highlight du point correspondant).
- Données d'altitude issues de la réponse BRouter.

## 4. Widget type de revêtement sur distance

Même principe que le dénivelé, mais pour le type de surface (asphalte, gravier, terre…).

- Visualisation par bandes colorées le long de la distance.
- Utiliser les tags `surface` / `tracktype` d'OSM via la réponse BRouter.
- Légende claire des types.

## 5. Multi-waypoints avec réordonnancement

Ajouter des points intermédiaires à l'itinéraire et pouvoir les réorganiser.

- Ajout via clic sur la carte ou champ de recherche.
- Liste ordonnée dans la sidebar avec drag & drop pour réordonner.
- Suppression individuelle.
- Recalcul automatique de l'itinéraire à chaque modification.

## 6. Libellés explicites et hypothèses affichées

Rendre explicites les conventions implicites de l'UI.

- Labels des modes/profils plus parlants (ex. « mixte » → description claire de ce que ça privilégie).
- Temps estimé : préciser la vitesse moyenne supposée (et idéalement la rendre paramétrable).
- Types de routes/voies : légende ou tooltips expliquant chaque catégorie.
