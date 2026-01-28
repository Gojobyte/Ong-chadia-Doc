# Epic 6: Templates & Propositions

## Objectif

Fournir un système de templates réutilisables et d'assistance à la rédaction de propositions de projet. Cette fonctionnalité permet de capitaliser sur les propositions passées, de standardiser la qualité des soumissions et de réduire significativement le temps de rédaction.

## Story 6.1: Bibliothèque de Templates de Propositions

**As a** rédacteur de propositions,
**I want** accéder à une bibliothèque de templates de propositions,
**so that** je puisse démarrer rapidement avec une structure adaptée au bailleur.

**Acceptance Criteria:**

1. Bibliothèque centralisée de templates propositions
2. Catégorisation par bailleur (UE, AFD, USAID, etc.)
3. Catégorisation par type (Note conceptuelle, Proposition complète, Budget)
4. Preview du template avant utilisation
5. Métadonnées: auteur, date création, nombre d'utilisations
6. Recherche et filtres
7. Templates vérifiés/approuvés par Admin
8. Versioning des templates
9. Import de templates Word/PDF existants
10. Tests d'intégration

---

## Story 6.2: Création et Gestion de Templates

**As a** Admin ou responsable qualité,
**I want** créer et gérer des templates de propositions,
**so that** l'équipe dispose de modèles à jour et conformes aux exigences bailleurs.

**Acceptance Criteria:**

1. Éditeur de template (basé sur TipTap - Epic 8)
2. Définition de sections obligatoires et optionnelles
3. Variables dynamiques: `{{projet.nom}}`, `{{bailleur.nom}}`, `{{date}}`, etc.
4. Instructions/guidelines par section (texte d'aide)
5. Contraintes: nombre de mots/caractères par section
6. Pièces jointes types (annexes standards)
7. Workflow d'approbation avant publication
8. Duplication de templates existants
9. Archivage de templates obsolètes
10. Historique des modifications

---

## Story 6.3: Composition de Proposition

**As a** chargé de projets,
**I want** composer une proposition à partir d'un template,
**so that** je puisse rédiger efficacement en respectant le format requis.

**Acceptance Criteria:**

1. Création de proposition depuis template ou depuis zéro
2. Liaison avec un appel d'offres (Epic 5)
3. Remplissage guidé section par section
4. Indicateur de complétion par section (%)
5. Validation des contraintes (longueur, champs requis)
6. Auto-save régulier
7. Mode brouillon / En cours / Finalisé
8. Collaboration multi-utilisateurs sur la proposition
9. Commentaires et suggestions par section
10. Preview format final

---

## Story 6.4: Réutilisation de Contenus (Content Library)

**As a** rédacteur,
**I want** réutiliser des blocs de texte de propositions précédentes,
**so that** je capitalise sur le travail passé et gagne du temps.

**Acceptance Criteria:**

1. Bibliothèque de blocs de texte réutilisables
2. Catégorisation: présentation ONG, méthodologie, CV types, références
3. Recherche full-text dans les contenus
4. Insertion rapide dans proposition en cours
5. Extraction de blocs depuis propositions existantes
6. Tags et mots-clés sur les blocs
7. Statistiques d'utilisation par bloc
8. Suggestions automatiques selon section en cours
9. Versioning des blocs
10. Import en masse de contenus existants

---

## Story 6.5: Export et Soumission de Proposition

**As a** responsable soumission,
**I want** exporter la proposition dans les formats requis,
**so that** je puisse soumettre au bailleur selon ses exigences.

**Acceptance Criteria:**

1. Export PDF avec mise en page professionnelle
2. Export Word (.docx) éditable
3. Export selon template spécifique bailleur (si requis)
4. Génération automatique de la table des matières
5. Numérotation des pages et en-têtes/pieds de page
6. Inclusion automatique des annexes
7. Checklist de soumission avant export final
8. Historique des versions exportées
9. Partage lien sécurisé pour relecture externe
10. Archivage de la version soumise

---

## Story 6.6: Suivi des Propositions Soumises

**As a** directeur,
**I want** suivre l'état des propositions soumises,
**so that** j'aie une visibilité sur le pipeline de financement.

**Acceptance Criteria:**

1. Dashboard propositions avec statuts (Brouillon, Soumis, En évaluation, Accepté, Rejeté)
2. Timeline des étapes clés par proposition
3. Montants en jeu par statut
4. Taux de succès historique
5. Alertes dates importantes (deadline, réponse attendue)
6. Notes de suivi post-soumission
7. Liaison avec projet créé si accepté
8. Analyse des raisons de rejet (si disponible)
9. Rapports statistiques (par bailleur, secteur, période)
10. Export du pipeline

---
