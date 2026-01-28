# Epic 8: Éditeur & Gestion Documents

## Objectif

Permettre aux utilisateurs de créer, modifier et collaborer sur des documents (Word/Excel) directement dans l'application, sans avoir besoin d'outils externes. Cette fonctionnalité transforme la plateforme en une suite bureautique intégrée adaptée aux besoins des ONG.

## Story 8.1: Éditeur de Documents Texte (WYSIWYG)

**As a** membre d'un projet,
**I want** créer et modifier des documents texte directement dans l'application,
**so that** je puisse rédiger mes rapports, PV et TDR sans quitter la plateforme.

**Acceptance Criteria:**

1. Éditeur WYSIWYG intégré (type TipTap ou Quill)
2. Formatage texte : gras, italique, souligné, titres (H1-H6)
3. Listes à puces et numérotées
4. Insertion d'images et tableaux simples
5. Export au format .docx et .pdf
6. Sauvegarde automatique (auto-save toutes les 30 secondes)
7. Historique des versions avec possibilité de restauration
8. Liaison automatique du document au projet courant
9. Permissions : seuls les membres du projet peuvent éditer
10. Tests unitaires et d'intégration

---

## Story 8.2: Éditeur de Tableurs (Spreadsheet)

**As a** chef de projet,
**I want** créer et modifier des tableurs directement dans l'application,
**so that** je puisse gérer mes budgets et suivis sans utiliser Excel externe.

**Acceptance Criteria:**

1. Éditeur tableur intégré (type Handsontable ou Luckysheet)
2. Support des formules de base (SUM, AVERAGE, COUNT, IF, etc.)
3. Formatage cellules : couleurs, bordures, alignement
4. Colonnes et lignes redimensionnables
5. Tri et filtrage des données
6. Export au format .xlsx et .csv
7. Import de fichiers .xlsx et .csv existants
8. Sauvegarde automatique
9. Graphiques basiques (barres, lignes, camembert)
10. Tests couvrant les formules et l'export/import

---

## Story 8.3: Système de Templates Pré-remplis

**As a** utilisateur,
**I want** créer des documents à partir de templates pré-configurés,
**so that** je gagne du temps et respecte les standards de l'organisation.

**Acceptance Criteria:**

1. Bibliothèque de templates accessible depuis la création de document
2. Templates texte : Rapport d'activité, PV réunion, TDR, Note conceptuelle, Fiche de poste
3. Templates tableur : Budget prévisionnel, Suivi budgétaire, Chronogramme, Liste présence, Tableau indicateurs
4. Preview du template avant sélection
5. Variables dynamiques dans les templates ({{projet.nom}}, {{date}}, etc.)
6. Possibilité de créer des templates personnalisés (Staff+)
7. Catégorisation des templates par type
8. Templates liés à un projet spécifique optionnellement
9. Duplication d'un document existant comme base
10. Tests d'intégration

---

## Story 8.4: Collaboration Temps Réel Multi-utilisateurs

**As a** membre d'une équipe projet,
**I want** éditer un document en même temps que mes collègues,
**so that** nous puissions collaborer efficacement sans conflits de versions.

**Acceptance Criteria:**

1. Édition simultanée par plusieurs utilisateurs (WebSocket/Yjs)
2. Curseurs colorés montrant la position de chaque collaborateur
3. Indicateur de présence (qui est connecté au document)
4. Synchronisation en temps réel des modifications
5. Gestion des conflits automatique (CRDT)
6. Mode "suggestion" pour proposer des modifications sans appliquer
7. Commentaires dans le document avec mentions (@user)
8. Notifications en temps réel des modifications
9. Fallback gracieux si connexion perdue (sauvegarde locale)
10. Tests de charge avec multiples utilisateurs simultanés

---

## Story 8.5: Gestion Avancée Documents Projet (CRUD Complet)

**As a** chef de projet,
**I want** gérer complètement les documents de mon projet (créer, lire, modifier, supprimer),
**so that** j'aie un contrôle total sur la documentation du projet.

**Acceptance Criteria:**

1. Création de documents directement depuis la page projet
2. Liste des documents avec filtres (type, date, auteur)
3. Modification du contenu et des métadonnées
4. Suppression avec confirmation et corbeille (soft delete)
5. Restauration depuis la corbeille (30 jours)
6. Duplication de documents
7. Déplacement entre dossiers
8. Renommage de documents
9. Téléchargement en différents formats
10. Historique complet des actions sur chaque document

---

## Story 8.6: Visualiseur Documents Universel

**As a** utilisateur,
**I want** prévisualiser tous types de documents sans les télécharger,
**so that** je puisse consulter rapidement le contenu sans changer d'application.

**Acceptance Criteria:**

1. Preview PDF intégré (pdf.js ou équivalent)
2. Preview documents Word (.docx)
3. Preview tableurs Excel (.xlsx) avec navigation entre feuilles
4. Preview images (jpg, png, gif, webp)
5. Preview vidéos (mp4, webm) avec player intégré
6. Zoom et navigation dans les documents
7. Mode plein écran
8. Téléchargement depuis le viewer
9. Partage direct du lien de preview
10. Fallback message pour formats non supportés

---
