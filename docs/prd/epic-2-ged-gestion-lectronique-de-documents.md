# Epic 2: GED - Gestion Électronique de Documents

## Objectif

Implémenter un système complet de gestion électronique de documents permettant l'upload, l'organisation hiérarchique en dossiers, le contrôle d'accès granulaire par rôle, la recherche, et le versioning. À la fin de cet epic, l'équipe ONG pourra centraliser tous ses documents sensibles de manière sécurisée avec des permissions appropriées selon les rôles utilisateurs.

**C'est la priorité #1** : Résout directement le problème de sécurité documentaire et de dispersion des fichiers.

## Story 2.1: Folder Management API

**As a** utilisateur authentifié,
**I want** créer et organiser des dossiers hiérarchiques,
**so that** je puisse structurer mes documents de manière logique.

**Acceptance Criteria:**

1. Schéma Prisma `Folder` : id, name, parentId (nullable), createdById, createdAt, updatedAt
2. Endpoint `GET /api/folders` listant les dossiers racine de l'utilisateur
3. Endpoint `GET /api/folders/:id` récupérant un dossier avec ses sous-dossiers
4. Endpoint `GET /api/folders/:id/children` listant les sous-dossiers directs
5. Endpoint `POST /api/folders` créant un dossier (name, parentId optionnel)
6. Endpoint `PATCH /api/folders/:id` modifiant un dossier (name, parentId pour déplacer)
7. Endpoint `DELETE /api/folders/:id` supprimant un dossier vide uniquement
8. Validation : nom unique au sein du même parent
9. Validation : empêcher les cycles (un dossier ne peut être son propre descendant)
10. Tests unitaires et d'intégration

---

## Story 2.2: Folder Permissions API

**As a** Super-Admin ou Staff,
**I want** définir les permissions d'accès sur chaque dossier,
**so that** je puisse contrôler qui peut voir ou modifier les documents sensibles.

**Acceptance Criteria:**

1. Schéma Prisma `FolderPermission` : id, folderId, role (enum), permission (READ/WRITE/ADMIN)
2. Permissions héritées : un sous-dossier hérite des permissions du parent par défaut
3. Override possible : permissions spécifiques sur un sous-dossier remplacent l'héritage
4. Endpoint `GET /api/folders/:id/permissions` listant les permissions du dossier
5. Endpoint `POST /api/folders/:id/permissions` ajoutant une permission (Super-Admin/Staff only)
6. Endpoint `DELETE /api/folders/:id/permissions/:permId` supprimant une permission
7. Logique d'accès : Super-Admin a accès à tout, Staff selon permissions, Contributor/Guest restreints
8. Middleware `canAccessFolder(permission)` vérifiant l'accès avant toute opération
9. Tests couvrant tous les cas d'héritage et d'override
10. Documentation des règles de permissions

---

## Story 2.3: Document Upload & Storage API

**As a** utilisateur avec permission WRITE,
**I want** uploader des documents dans un dossier,
**so that** je puisse centraliser mes fichiers dans la GED.

**Acceptance Criteria:**

1. Schéma Prisma `Document` : id, name, mimeType, size, storagePath, folderId, uploadedById, createdAt
2. Intégration Supabase Storage configurée
3. Endpoint `POST /api/documents/upload` acceptant multipart/form-data
4. Upload vers Supabase Storage avec path structuré (`/org/{folderId}/{uuid}_{filename}`)
5. Limite de taille : 50 MB par fichier
6. Types acceptés : PDF, Word (.doc, .docx), Excel (.xls, .xlsx), images (jpg, png, gif), txt
7. Validation du type MIME côté serveur (pas seulement extension)
8. Métadonnées stockées en DB, fichier dans Storage
9. Retourne le document créé avec URL signée temporaire
10. Gestion d'erreurs : quota dépassé, type non supporté, upload failed
11. Tests d'intégration avec mock Storage

---

## Story 2.4: Document Operations API

**As a** utilisateur avec permissions appropriées,
**I want** télécharger, renommer, déplacer et supprimer des documents,
**so that** je puisse gérer mes fichiers efficacement.

**Acceptance Criteria:**

1. Endpoint `GET /api/documents/:id` récupérant les métadonnées d'un document
2. Endpoint `GET /api/documents/:id/download` retournant une URL signée pour téléchargement
3. Endpoint `GET /api/folders/:id/documents` listant les documents d'un dossier
4. Endpoint `PATCH /api/documents/:id` modifiant name ou folderId (déplacement)
5. Endpoint `DELETE /api/documents/:id` supprimant le document (Storage + DB)
6. Vérification des permissions : READ pour voir/télécharger, WRITE pour modifier/supprimer
7. Lors du déplacement, vérifier permission WRITE sur dossier source ET destination
8. Pagination sur la liste des documents (`?page=1&limit=50`)
9. Tri par nom, date, taille (`?sort=createdAt&order=desc`)
10. Tests d'intégration couvrant tous les cas de permissions

---

## Story 2.5: Document Versioning API

**As a** utilisateur,
**I want** uploader une nouvelle version d'un document existant,
**so that** je puisse maintenir un historique des modifications.

**Acceptance Criteria:**

1. Schéma Prisma `DocumentVersion` : id, documentId, versionNumber, storagePath, size, uploadedById, createdAt
2. Champ `currentVersionId` ajouté à `Document`
3. Endpoint `POST /api/documents/:id/versions` uploadant une nouvelle version
4. Version number auto-incrémenté (v1, v2, v3...)
5. Endpoint `GET /api/documents/:id/versions` listant toutes les versions
6. Endpoint `GET /api/documents/:id/versions/:versionId/download` téléchargeant une version spécifique
7. Possibilité de restaurer une ancienne version comme version courante
8. Conservation de toutes les versions (pas de suppression automatique pour MVP)
9. Affichage de la version courante par défaut
10. Tests couvrant upload version, listing, restauration

---

## Story 2.6: Document Search API

**As a** utilisateur,
**I want** rechercher des documents par nom et métadonnées,
**so that** je puisse retrouver rapidement les fichiers dont j'ai besoin.

**Acceptance Criteria:**

1. Endpoint `GET /api/documents/search?q=terme` recherchant dans les noms de documents
2. Recherche insensible à la casse et aux accents
3. Recherche partielle (contient le terme, pas exact match)
4. Filtrage par type de fichier (`?type=pdf,docx`)
5. Filtrage par dossier et sous-dossiers (`?folderId=xxx&recursive=true`)
6. Filtrage par date (`?from=2026-01-01&to=2026-01-31`)
7. Résultats respectant les permissions de l'utilisateur (ne voit que ce qu'il peut accéder)
8. Pagination des résultats
9. Performance : résultats en < 1 seconde pour base de données MVP
10. Tests avec différents scénarios de recherche et permissions

---

## Story 2.7: GED UI - Folder Explorer

**As a** utilisateur,
**I want** naviguer dans l'arborescence des dossiers via une interface graphique,
**so that** je puisse explorer et organiser ma structure documentaire.

**Acceptance Criteria:**

1. Page `/documents` avec panneau latéral d'arborescence de dossiers
2. Affichage hiérarchique des dossiers (tree view) avec expand/collapse
3. Breadcrumb montrant le chemin actuel
4. Clic sur un dossier affiche son contenu dans la zone principale
5. Menu contextuel (clic droit ou bouton "...") : Nouveau sous-dossier, Renommer, Déplacer, Supprimer
6. Modal de création de dossier avec validation du nom
7. Modal de confirmation avant suppression
8. Icônes différenciées pour dossiers selon permissions (cadenas pour restreint)
9. Drag & drop pour déplacer dossiers (optionnel, bonus)
10. État de chargement pendant les opérations

---

## Story 2.8: GED UI - Document List & Upload

**As a** utilisateur,
**I want** voir les documents d'un dossier et en uploader de nouveaux,
**so that** je puisse gérer mes fichiers depuis l'interface.

**Acceptance Criteria:**

1. Zone principale affichant la liste des documents du dossier sélectionné
2. Vue liste avec colonnes : Nom, Type (icône), Taille, Date upload, Uploadé par
3. Tri cliquable sur chaque colonne
4. Bouton "Upload" ouvrant un sélecteur de fichiers
5. Zone de drag & drop pour upload (drop zone visuelle)
6. Barre de progression pendant l'upload
7. Support upload multiple (plusieurs fichiers à la fois)
8. Validation côté client : taille max, types acceptés
9. Message d'erreur si upload échoue
10. Rafraîchissement automatique de la liste après upload réussi

---

## Story 2.9: GED UI - Document Details & Actions

**As a** utilisateur,
**I want** voir les détails d'un document et effectuer des actions,
**so that** je puisse télécharger, renommer, ou gérer les versions.

**Acceptance Criteria:**

1. Clic sur un document ouvre un panneau de détails (drawer ou modal)
2. Affichage : nom, type, taille, date création, uploadé par, dossier parent
3. Prévisualisation inline pour PDF et images (si possible)
4. Bouton "Télécharger" récupérant le fichier
5. Bouton "Renommer" avec formulaire inline
6. Bouton "Déplacer" ouvrant un sélecteur de dossier destination
7. Bouton "Supprimer" avec confirmation
8. Section "Versions" listant l'historique des versions
9. Bouton "Uploader nouvelle version"
10. Lien de chaque version pour télécharger une version spécifique

---

## Story 2.10: Document Sharing & Access Logs

**As a** Staff ou Super-Admin,
**I want** partager un document via lien sécurisé et voir qui y a accédé,
**so that** je puisse collaborer avec des partenaires externes et auditer les accès.

**Acceptance Criteria:**

1. Schéma Prisma `ShareLink` : id, documentId, token (unique), expiresAt, createdById, accessCount
2. Schéma Prisma `AccessLog` : id, documentId, userId (nullable pour liens), action, ipAddress, createdAt
3. Endpoint `POST /api/documents/:id/share` créant un lien de partage avec expiration
4. Endpoint `GET /api/share/:token` permettant téléchargement sans auth (lien public temporaire)
5. Bouton "Partager" dans l'UI générant et affichant le lien
6. Option de durée d'expiration (1h, 24h, 7 jours, 30 jours)
7. Logging automatique de tous les accès aux documents sensibles
8. Endpoint `GET /api/documents/:id/access-logs` listant les accès (Super-Admin)
9. UI affichant les logs d'accès dans les détails du document (si autorisé)
10. Tests de sécurité : lien expiré retourne 403, token invalide retourne 404

---

## Story 2.11: Enhanced Document Preview

**As a** utilisateur,
**I want** avoir une prévisualisation enrichie des documents avec un viewer plein écran,
**so that** je puisse consulter rapidement le contenu sans télécharger.

**Acceptance Criteria:**

1. Bouton "Plein écran" dans le preview pour ouvrir un viewer modal
2. Viewer PDF avec navigation pages (précédent/suivant, numéro de page)
3. Viewer PDF avec zoom in/out et fit to width/height
4. Viewer images avec zoom et pan (drag pour déplacer)
5. Galerie d'images si plusieurs images dans le dossier (navigation flèches)
6. Viewer Office (Word, Excel) via intégration Microsoft Office Online ou Google Docs Viewer
7. Preview des fichiers texte (.txt, .md, .json) avec coloration syntaxique
8. Raccourcis clavier : Échap pour fermer, flèches pour naviguer, +/- pour zoom
9. Indicateur de chargement pendant le fetch du document
10. Bouton télécharger accessible dans le viewer plein écran

---

## Story 2.12: Favoris & Accès Rapide

**As a** utilisateur,
**I want** marquer des documents et dossiers comme favoris et accéder rapidement aux fichiers récents,
**so that** je puisse retrouver instantanément les documents que j'utilise fréquemment.

**Acceptance Criteria:**

1. Bouton étoile sur chaque document et dossier pour ajouter/retirer des favoris
2. Section "Favoris" dans la sidebar accessible en un clic
3. Liste des favoris triée par date d'ajout (plus récent en premier)
4. Section "Documents récents" affichant les 20 derniers fichiers consultés/modifiés
5. Persistance des favoris côté serveur (table UserFavorite)
6. Indicateur visuel (étoile pleine) sur les éléments favoris dans les listes
7. Suppression en lot des favoris (multi-sélection)
8. Raccourci clavier (S) pour ajouter/retirer des favoris
9. Compteur de favoris dans la sidebar
10. Widget "Accès rapide" sur le Dashboard avec les 5 documents les plus consultés

---

## Story 2.13: Tags & Métadonnées Documents

**As a** utilisateur,
**I want** ajouter des tags et métadonnées personnalisées aux documents,
**so that** je puisse catégoriser et retrouver les fichiers par contexte métier (projet, client, type).

**Acceptance Criteria:**

1. Système de tags libres : création à la volée lors de l'ajout
2. Autocomplétion des tags existants lors de la saisie
3. Affichage des tags sur les cartes et lignes de documents
4. Filtrage par tags dans la liste des documents (multi-sélection)
5. Nuage de tags dans la sidebar montrant les tags populaires
6. Métadonnées personnalisées par type de document (ex: Date contrat, Montant, Bénéficiaire)
7. Templates de métadonnées par dossier (tous les docs d'un dossier héritent)
8. Recherche globale incluant les tags et métadonnées
9. Gestion des tags (renommer, fusionner, supprimer) pour les admins
10. Export des métadonnées en CSV

---

## Story 2.14: Opérations en Lot (Bulk Operations)

**As a** utilisateur avec permission WRITE,
**I want** effectuer des actions sur plusieurs documents à la fois,
**so that** je puisse gérer efficacement un grand nombre de fichiers (déplacer, supprimer, télécharger).

**Acceptance Criteria:**

1. Sélection multiple via checkbox sur chaque document
2. Sélection de tous les documents d'un dossier (checkbox "Tout sélectionner")
3. Sélection par plage (Shift + clic)
4. Barre d'actions contextuelle apparaissant lors de la sélection
5. Actions disponibles : Déplacer, Copier, Supprimer, Télécharger (ZIP), Ajouter tags
6. Confirmation avant suppression en lot (affiche le nombre)
7. Barre de progression pour les opérations longues
8. Annulation possible pendant l'opération
9. Rapport de fin d'opération (succès, échecs)
10. Raccourcis clavier : Ctrl+A (tout sélectionner), Delete (supprimer)

---

## Story 2.15: Dashboard Documents & Analytics

**As a** Staff ou Super-Admin,
**I want** avoir un tableau de bord avec des statistiques sur les documents,
**so that** je puisse suivre l'utilisation de la GED et identifier les tendances.

**Acceptance Criteria:**

1. Widget "Aperçu stockage" : espace utilisé vs quota, jauge visuelle
2. Widget "Documents récents" : 5 derniers uploads avec preview miniature
3. Widget "Activité" : graphique d'uploads par jour (30 derniers jours)
4. Widget "Répartition par type" : camembert (PDF, Word, Excel, Images, Autres)
5. Widget "Top dossiers" : dossiers avec le plus de documents
6. Widget "Utilisateurs actifs" : top contributeurs (nombre d'uploads)
7. Filtres par période : 7j, 30j, 90j, 12 mois
8. Export des statistiques en PDF
9. Données temps réel (actualisation automatique toutes les 5 minutes)
10. Accès réservé aux rôles Staff et Super-Admin

---

## Story 2.16: Recherche Avancée & Filtres

**As a** utilisateur,
**I want** avoir des options de recherche avancées et des filtres puissants,
**so that** je puisse retrouver rapidement n'importe quel document même dans une grande collection.

**Acceptance Criteria:**

1. Barre de recherche globale accessible depuis n'importe quelle page (header)
2. Recherche instantanée avec résultats en temps réel (debounce 300ms)
3. Recherche dans le nom, tags, métadonnées, et contenu texte (si indexé)
4. Panneau de filtres avancés déployable
5. Filtres : Type de fichier, Date de création, Taille, Dossier, Tags, Uploadé par
6. Sauvegarde des recherches fréquentes
7. Historique des recherches récentes (5 dernières)
8. Mise en surbrillance des termes trouvés dans les résultats
9. Tri des résultats : Pertinence, Date, Nom, Taille
10. Résultats groupés par dossier (optionnel)

---
