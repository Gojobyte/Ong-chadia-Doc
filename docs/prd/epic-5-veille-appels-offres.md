# Epic 5: Veille Appels d'Offres

## Objectif

Permettre aux ONG de surveiller automatiquement les appels d'offres et opportunités de financement depuis plusieurs sources (sites bailleurs, plateformes dédiées). Cette fonctionnalité centralise la veille et fait gagner un temps considérable aux équipes en charge du fundraising.

## Story 5.1: Configuration Sources de Veille

**As a** responsable fundraising,
**I want** configurer les sources d'appels d'offres à surveiller,
**so that** le système agrège automatiquement les opportunités pertinentes.

**Acceptance Criteria:**

1. Interface de gestion des sources de veille
2. Types de sources: URL RSS, API REST, scraping page web
3. Configuration fréquence de vérification (horaire, quotidienne, hebdomadaire)
4. Test de connexion avant sauvegarde
5. Activation/désactivation par source
6. Sources prédéfinies: DevEx, ReliefWeb, ECHO, AFD, UE (si disponibles)
7. Logs d'exécution des collectes
8. Alertes si source en erreur
9. Import/export configuration sources
10. Tests d'intégration

---

## Story 5.2: Agrégation et Parsing des Appels d'Offres

**As a** système,
**I want** collecter et parser les appels d'offres depuis les sources configurées,
**so that** les données soient normalisées et exploitables.

**Acceptance Criteria:**

1. Job planifié (CRON) pour collecte automatique
2. Parsing des données selon format source (RSS, JSON, HTML)
3. Normalisation vers schéma commun: titre, bailleur, date limite, montant, secteurs, zones géographiques
4. Détection des doublons (même appel sur plusieurs sources)
5. Stockage en base avec statut (nouveau, vu, candidaté, archivé)
6. Extraction automatique des mots-clés et tags
7. Gestion des erreurs de parsing avec retry
8. File d'attente pour traitement asynchrone
9. Métriques de collecte (nombre, sources, erreurs)
10. Tests unitaires parsing

---

## Story 5.3: Liste et Filtres des Appels d'Offres

**As a** chargé de projets,
**I want** consulter la liste des appels d'offres avec des filtres avancés,
**so that** je trouve rapidement les opportunités pertinentes pour mon organisation.

**Acceptance Criteria:**

1. Liste paginée des appels d'offres
2. Filtres: bailleur, secteur, zone géographique, montant (min/max), date limite
3. Recherche full-text dans titre et description
4. Tri par date limite, date de publication, pertinence
5. Vue carte des opportunités par pays/région
6. Indicateur "Nouveau" pour appels non consultés
7. Sauvegarde des filtres favoris
8. Export liste filtrée en CSV/Excel
9. Compteurs par statut
10. Responsive mobile

---

## Story 5.4: Détail et Actions sur Appel d'Offres

**As a** responsable projets,
**I want** consulter le détail d'un appel d'offres et effectuer des actions,
**so that** je puisse évaluer l'opportunité et initier une candidature.

**Acceptance Criteria:**

1. Page détail avec toutes les informations parsées
2. Lien vers source originale
3. Actions: Marquer comme lu, Archiver, Candidater
4. Notes internes sur l'appel (commentaires équipe)
5. Pièces jointes téléchargées depuis la source
6. Historique des consultations
7. Partage interne vers collègues (notification)
8. Évaluation rapide (étoiles ou go/no-go)
9. Lien direct vers création de proposition (Epic 6)
10. Tests E2E du flow

---

## Story 5.5: Alertes et Notifications

**As a** utilisateur,
**I want** recevoir des alertes pour les nouveaux appels d'offres correspondant à mes critères,
**so that** je ne rate aucune opportunité pertinente.

**Acceptance Criteria:**

1. Configuration alertes par utilisateur
2. Critères d'alerte: secteurs, bailleurs, zones, mots-clés
3. Fréquence: temps réel, digest quotidien, digest hebdomadaire
4. Canaux: notification in-app, email
5. Aperçu nombre d'appels correspondants avant activation
6. Désabonnement facile
7. Historique des alertes envoyées
8. Template email personnalisable (Admin)
9. Limite anti-spam (max alertes/jour)
10. Tests notifications

---
