# Epic 3: Gestion de Projets

## Objectif

Permettre la création, le suivi et la gestion complète des projets de l'ONG avec assignation d'équipes (permanents + bénévoles), suivi des phases d'avancement, et liaison automatique avec les documents de la GED. À la fin de cet epic, l'équipe pourra gérer le nouveau projet financé qui démarre dans 1 mois.

## Story 3.1: Project Model & CRUD API

**As a** utilisateur Staff ou Super-Admin,
**I want** créer et gérer des fiches projet via API,
**so that** je puisse centraliser les informations de tous nos projets.

**Acceptance Criteria:**

1. Schéma Prisma `Project` : id, name, description, status (enum), startDate, endDate, budget, createdById, createdAt, updatedAt
2. Enum `ProjectStatus` : DRAFT, PREPARATION, IN_PROGRESS, COMPLETED, CANCELLED
3. Endpoint `GET /api/projects` listant tous les projets accessibles à l'utilisateur
4. Endpoint `GET /api/projects/:id` récupérant un projet avec ses détails
5. Endpoint `POST /api/projects` créant un projet (Staff+ only)
6. Endpoint `PATCH /api/projects/:id` modifiant un projet
7. Endpoint `DELETE /api/projects/:id` archivant un projet (soft delete, Super-Admin only)
8. Filtrage par statut (`?status=IN_PROGRESS`)
9. Pagination et tri (`?page=1&limit=20&sort=startDate`)
10. Tests d'intégration pour tous les endpoints

---

## Story 3.2: Team Assignment API

**As a** Staff ou Super-Admin,
**I want** assigner des membres d'équipe à un projet,
**so that** je puisse constituer l'équipe projet (permanents + bénévoles).

**Acceptance Criteria:**

1. Schéma Prisma `ProjectMember` : id, projectId, userId, role (PROJECT_MANAGER, MEMBER, VOLUNTEER), assignedAt
2. Endpoint `GET /api/projects/:id/members` listant les membres du projet
3. Endpoint `POST /api/projects/:id/members` ajoutant un membre avec son rôle projet
4. Endpoint `PATCH /api/projects/:id/members/:memberId` modifiant le rôle d'un membre
5. Endpoint `DELETE /api/projects/:id/members/:memberId` retirant un membre
6. Validation : un utilisateur ne peut être assigné qu'une fois par projet
7. Validation : au moins un PROJECT_MANAGER requis par projet
8. Les Contributors peuvent être assignés comme VOLUNTEER uniquement
9. Notification (log) lors de l'ajout/retrait d'un membre
10. Tests couvrant les cas de validation

---

## Story 3.3: Project-Document Linking API

**As a** membre d'un projet,
**I want** lier des documents de la GED au projet,
**so that** tous les documents pertinents soient accessibles depuis la fiche projet.

**Acceptance Criteria:**

1. Schéma Prisma `ProjectDocument` : id, projectId, documentId, linkedById, linkedAt
2. Endpoint `GET /api/projects/:id/documents` listant les documents liés au projet
3. Endpoint `POST /api/projects/:id/documents` liant un document existant au projet
4. Endpoint `DELETE /api/projects/:id/documents/:docId` déliant un document
5. Possibilité de lier un dossier entier (tous ses documents)
6. Vérification : l'utilisateur doit avoir accès READ au document pour le lier
7. Les membres du projet obtiennent automatiquement accès READ aux documents liés
8. Un document peut être lié à plusieurs projets
9. Affichage du nombre de documents liés sur la fiche projet
10. Tests d'intégration

---

## Story 3.4: Projects List UI

**As a** utilisateur,
**I want** voir la liste de tous les projets auxquels j'ai accès,
**so that** je puisse naviguer rapidement vers le projet qui m'intéresse.

**Acceptance Criteria:**

1. Page `/projects` affichant la liste des projets
2. Vue cards ou tableau avec : Nom, Statut (badge coloré), Dates, Budget, Nb membres
3. Filtres : par statut, par date (en cours, à venir, terminés)
4. Recherche par nom de projet
5. Tri par nom, date de début, statut
6. Pagination
7. Bouton "Nouveau projet" (visible si Staff+)
8. Clic sur un projet navigue vers sa page de détail
9. Indicateur visuel pour projets où l'utilisateur est assigné
10. État vide avec message si aucun projet

---

## Story 3.5: Project Detail UI

**As a** membre d'un projet,
**I want** voir tous les détails d'un projet sur une page dédiée,
**so that** j'aie une vue complète du projet et de son avancement.

**Acceptance Criteria:**

1. Page `/projects/:id` avec informations complètes du projet
2. Header : Nom, Statut (modifiable si autorisé), Dates début/fin
3. Section "Description" avec texte riche
4. Section "Budget" affichant le montant
5. Section "Équipe" listant tous les membres avec leurs rôles projet
6. Section "Documents" listant les documents liés (avec liens vers GED)
7. Section "Avancement" avec indicateur de phase actuelle
8. Bouton "Modifier" (Staff+) ouvrant le formulaire d'édition
9. Bouton "Gérer l'équipe" ouvrant le panneau d'assignation
10. Breadcrumb : Projets > Nom du projet

---

## Story 3.6: Project Create/Edit UI

**As a** Staff ou Super-Admin,
**I want** créer et modifier des projets via formulaire,
**so that** je puisse ajouter de nouveaux projets et mettre à jour les existants.

**Acceptance Criteria:**

1. Page `/projects/new` avec formulaire de création
2. Champs : Nom*, Description, Statut, Date début, Date fin, Budget
3. Validation : nom requis, dates cohérentes (fin >= début)
4. Mode édition sur `/projects/:id/edit` pré-remplissant les valeurs
5. Boutons "Enregistrer" et "Annuler"
6. Redirection vers page de détail après création/modification réussie
7. Messages d'erreur inline pour validation
8. Toast de confirmation après succès
9. Auto-save brouillon (optionnel, bonus)
10. Responsive : formulaire adapté mobile

---

## Story 3.7: Team Management UI

**As a** Staff ou Super-Admin,
**I want** gérer l'équipe d'un projet via interface graphique,
**so that** je puisse ajouter, modifier ou retirer des membres facilement.

**Acceptance Criteria:**

1. Panneau/Modal "Gérer l'équipe" accessible depuis page projet
2. Liste des membres actuels avec : Nom, Email, Rôle projet, Date assignation
3. Bouton "Ajouter membre" ouvrant un sélecteur d'utilisateurs
4. Sélecteur filtrant par rôle système (Staff, Contributor)
5. Choix du rôle projet lors de l'ajout (PROJECT_MANAGER, MEMBER, VOLUNTEER)
6. Action "Modifier rôle" sur chaque membre
7. Action "Retirer" avec confirmation
8. Validation : impossible de retirer le dernier PROJECT_MANAGER
9. Mise à jour en temps réel de la liste après modification
10. Indicateur du nombre de membres

---
