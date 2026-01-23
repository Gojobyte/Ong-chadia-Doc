# Epic 4: Dashboard & Intégration

## Objectif

Créer le tableau de bord unifié servant de point d'entrée principal à l'application, intégrant les données des modules GED et Projets, avec alertes sur les échéances et accès rapide aux actions fréquentes. À la fin de cet epic, l'application Micro-MVP sera complète et prête pour la production.

## Story 4.1: Dashboard API - Aggregated Data

**As a** utilisateur authentifié,
**I want** récupérer les données agrégées pour mon dashboard via API,
**so that** l'interface puisse afficher une vue d'ensemble personnalisée.

**Acceptance Criteria:**

1. Endpoint `GET /api/dashboard` retournant les données agrégées
2. Données retournées :
   - `projects`: { total, byStatus: { draft, preparation, inProgress, completed } }
   - `myProjects`: liste des 5 derniers projets où l'utilisateur est assigné
   - `recentDocuments`: 10 derniers documents uploadés accessibles à l'utilisateur
   - `upcomingDeadlines`: projets avec endDate dans les 30 prochains jours
   - `stats`: { totalDocuments, totalProjects, totalUsers (si admin) }
3. Données filtrées selon permissions de l'utilisateur
4. Cache côté serveur (5 min) pour performance
5. Endpoint `GET /api/dashboard/activity` pour activité récente (uploads, créations)
6. Pagination sur l'activité récente
7. Performance : réponse < 500ms
8. Tests d'intégration validant les permissions

---

## Story 4.2: Dashboard UI - Main Layout

**As a** utilisateur authentifié,
**I want** voir un tableau de bord avec vue d'ensemble dès ma connexion,
**so that** je puisse rapidement accéder aux informations importantes.

**Acceptance Criteria:**

1. Page `/dashboard` définie comme page d'accueil après login
2. Layout responsive avec grille de widgets/cards
3. Header avec : Bienvenue {prénom}, date du jour
4. Navigation principale (sidebar ou top nav) vers : Dashboard, Documents, Projets, Admin (si autorisé)
5. Skeleton loading pendant chargement des données
6. Gestion d'erreur si API échoue (retry, message)
7. Bouton de rafraîchissement manuel
8. Design cohérent avec la charte (couleurs, typographie)
9. Adapté mobile : cards empilées verticalement
10. Temps de chargement initial < 2 secondes

---

## Story 4.3: Dashboard UI - Projects Widget

**As a** utilisateur,
**I want** voir mes projets actifs sur le dashboard,
**so that** je puisse accéder rapidement à mes projets en cours.

**Acceptance Criteria:**

1. Widget "Mes Projets" affichant les 5 projets récents de l'utilisateur
2. Chaque projet montre : Nom, Statut (badge), Date fin
3. Indicateur visuel si deadline proche (< 7 jours)
4. Clic sur un projet navigue vers sa page de détail
5. Lien "Voir tous les projets" vers `/projects`
6. État vide : "Aucun projet assigné" avec lien vers liste projets
7. Compteur de projets par statut (mini graphique ou badges)
8. Bouton "Nouveau projet" (si autorisé)
9. Widget responsive (s'adapte à la largeur)
10. Chargement asynchrone indépendant

---

## Story 4.4: Dashboard UI - Documents Widget

**As a** utilisateur,
**I want** voir les documents récents sur le dashboard,
**so that** je puisse accéder rapidement aux derniers fichiers uploadés.

**Acceptance Criteria:**

1. Widget "Documents Récents" affichant les 10 derniers documents
2. Chaque document montre : Nom, Type (icône), Date upload, Dossier parent
3. Clic sur un document ouvre ses détails (ou télécharge directement)
4. Clic sur le dossier navigue vers ce dossier dans la GED
5. Lien "Voir tous les documents" vers `/documents`
6. Bouton "Upload" rapide ouvrant le sélecteur de fichiers
7. Indication du quota utilisé (X GB / 25 GB) si pertinent
8. État vide : "Aucun document" avec CTA pour uploader
9. Recherche rapide dans le widget (optionnel)
10. Filtrable par type de fichier (optionnel)

---

## Story 4.5: Dashboard UI - Alerts & Deadlines Widget

**As a** utilisateur,
**I want** voir les alertes et échéances importantes,
**so that** je ne manque pas les deadlines critiques.

**Acceptance Criteria:**

1. Widget "Échéances" listant les projets avec deadline proche
2. Seuils : Rouge (< 7 jours), Orange (< 14 jours), Jaune (< 30 jours)
3. Format : Nom projet, Date fin, Jours restants
4. Tri par urgence (plus proche en premier)
5. Maximum 5 éléments affichés, lien "Voir plus" si plus
6. Widget "Alertes" pour notifications système (optionnel MVP)
7. Possibilité de marquer une alerte comme "vue"
8. Animation subtile pour nouvelles alertes
9. État vide : "Aucune échéance proche" (message positif)
10. Clic sur échéance navigue vers le projet

---

## Story 4.6: Global Search

**As a** utilisateur,
**I want** rechercher globalement dans l'application,
**so that** je puisse trouver rapidement documents ou projets.

**Acceptance Criteria:**

1. Barre de recherche dans le header/navbar, accessible partout
2. Endpoint `GET /api/search?q=terme` recherchant dans documents ET projets
3. Résultats groupés par type (Documents, Projets)
4. Affichage en dropdown sous la barre de recherche
5. Navigation clavier (flèches, Enter pour sélectionner)
6. Raccourci clavier pour focus (Ctrl+K ou Cmd+K)
7. Recherche en temps réel avec debounce (300ms)
8. Maximum 5 résultats par catégorie dans le dropdown
9. Lien "Voir tous les résultats" ouvrant page de résultats complète
10. Résultats respectant les permissions utilisateur

---

## Story 4.7: Final Integration & Polish

**As a** utilisateur,
**I want** une application cohérente et polie,
**so that** l'expérience soit professionnelle et agréable.

**Acceptance Criteria:**

1. Navigation cohérente sur toutes les pages (sidebar/navbar identique)
2. Breadcrumbs sur toutes les pages de détail
3. Page 404 personnalisée
4. Page d'erreur générique (500)
5. Favicon et titre de page dynamique
6. Meta tags pour SEO basique (title, description)
7. Loading states cohérents (skeleton ou spinner)
8. Toasts de notification cohérents (succès, erreur, info)
9. Confirmation avant actions destructives (supprimer)
10. Tests E2E des parcours critiques : Login → Dashboard → GED → Upload → Projet

---

## Story 4.8: Production Readiness

**As a** développeur,
**I want** préparer l'application pour la production,
**so that** le déploiement soit sécurisé et monitoré.

**Acceptance Criteria:**

1. Variables d'environnement production configurées (DB, Storage, JWT secrets)
2. CORS configuré correctement (domaines autorisés)
3. Rate limiting sur les endpoints API sensibles (login, register)
4. Helmet.js configuré pour headers de sécurité
5. Logs structurés (JSON) pour debugging production
6. Health check endpoint `GET /api/health`
7. Build production optimisé (minification, tree-shaking)
8. Documentation déploiement dans README
9. Seed de données initiales (Super-Admin, dossiers par défaut)
10. Backup manuel de la base de données documenté

---
