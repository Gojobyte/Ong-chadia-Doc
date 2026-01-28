# Epic 9: Fonctionnalités Terrain & Mobile

## Objectif

Supporter le travail de terrain des ONG avec une interface mobile-first, un mode offline complet et des outils de collecte de données adaptés aux conditions terrain (connexion limitée, appareils mobiles). À la fin de cet epic, les bénévoles et agents terrain pourront travailler efficacement même sans connexion internet.

## Story 9.1: Mode Offline + Synchronisation

**As a** agent terrain,
**I want** utiliser l'application sans connexion internet,
**so that** je puisse continuer à travailler dans les zones sans réseau.

**Acceptance Criteria:**

1. Service Worker pour mise en cache des ressources statiques
2. IndexedDB pour stockage local des données
3. Indicateur visuel du mode offline/online
4. File d'attente des modifications en attente de sync
5. Synchronisation automatique au retour de connexion
6. Gestion des conflits de synchronisation (last-write-wins ou merge)
7. Notification des éléments synchronisés
8. Possibilité de forcer la synchronisation manuelle
9. Cache des documents récemment consultés
10. Tests de scénarios offline/online

---

## Story 9.2: Formulaires de Collecte Terrain Dynamiques

**As a** agent terrain,
**I want** remplir des formulaires de collecte sur mon mobile,
**so that** je puisse saisir les données bénéficiaires directement sur le terrain.

**Acceptance Criteria:**

1. Création de formulaires personnalisés (Staff+)
2. Types de champs : texte, nombre, date, choix unique, choix multiple, photo
3. Champs conditionnels (afficher si condition remplie)
4. Validation des champs (requis, format, min/max)
5. Sauvegarde brouillon automatique
6. Fonctionnement complet en mode offline
7. Soumission avec horodatage et géolocalisation
8. Liste des formulaires à remplir par projet
9. Export des réponses en CSV/Excel
10. Statistiques agrégées des réponses

---

## Story 9.3: Signature Électronique

**As a** coordinateur terrain,
**I want** faire signer des documents sur tablette/mobile,
**so that** je puisse valider des présences ou accords sans papier.

**Acceptance Criteria:**

1. Canvas de signature tactile (doigt ou stylet)
2. Capture de la signature en image PNG
3. Intégration de la signature dans les documents PDF
4. Horodatage automatique de la signature
5. Géolocalisation optionnelle au moment de la signature
6. Stockage sécurisé des signatures
7. Vérification de l'identité du signataire (nom, email)
8. Possibilité de refaire la signature avant validation
9. Historique des signatures par document
10. Export du document signé en PDF

---

## Story 9.4: Capture Photos + Géolocalisation

**As a** agent terrain,
**I want** prendre des photos géolocalisées depuis l'application,
**so that** je puisse documenter mes activités avec preuve visuelle et localisation.

**Acceptance Criteria:**

1. Accès caméra depuis l'application (web API)
2. Capture photo avec métadonnées EXIF
3. Géolocalisation automatique (latitude, longitude)
4. Horodatage automatique
5. Annotation des photos (texte, flèches, formes)
6. Compression automatique pour optimiser stockage
7. Galerie photos par projet
8. Association photo à un formulaire ou document
9. Visualisation sur carte des photos géolocalisées
10. Fonctionnement en mode offline avec sync ultérieure

---
