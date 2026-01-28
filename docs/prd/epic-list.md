# Epic List

## MICRO-MVP (Mois 1) - 4 Epics, 32 Stories

| Epic | Titre | Stories | Estimation |
|------|-------|---------|------------|
| **1** | **Foundation & Authentification** | 7 | ~25h |
| **2** | **GED - Gestion Documentaire** | 10 | ~35h |
| **3** | **Gestion de Projets** | 7 | ~21h |
| **4** | **Dashboard & Intégration** | 8 | ~20h |
| | **TOTAL MICRO-MVP** | **32** | **~100h** |

## PHASE 2 (Mois 2-4) - 3 Epics, 17 Stories

| Epic | Titre | Stories | Objectif |
|------|-------|---------|----------|
| **5** | **Veille Appels d'Offres** | 5 | Agréger et filtrer automatiquement les appels d'offres depuis sources multiples |
| **6** | **Templates & Propositions** | 6 | Système de templates réutilisables et composition de propositions |
| **7** | **Gestion Budgétaire** | 6 | Outils de création et suivi budgétaire avec calculs automatisés |

### Détail Phase 2

**Epic 5 - Veille Appels d'Offres (5 stories)**
- 5.1: Configuration Sources de Veille
- 5.2: Agrégation et Parsing des Appels d'Offres
- 5.3: Liste et Filtres des Appels d'Offres
- 5.4: Détail et Actions sur Appel d'Offres
- 5.5: Alertes et Notifications

**Epic 6 - Templates & Propositions (6 stories)**
- 6.1: Bibliothèque de Templates de Propositions
- 6.2: Création et Gestion de Templates
- 6.3: Composition de Proposition
- 6.4: Réutilisation de Contenus (Content Library)
- 6.5: Export et Soumission de Proposition
- 6.6: Suivi des Propositions Soumises

**Epic 7 - Gestion Budgétaire (6 stories)**
- 7.1: Création de Budget Projet
- 7.2: Templates Budgétaires par Bailleur
- 7.3: Ventilation et Répartition Budgétaire
- 7.4: Suivi Budgétaire en Temps Réel
- 7.5: Révisions et Avenants Budgétaires
- 7.6: Rapports Financiers Standards

## PHASE 3 (Mois 5-8) - 3 Epics, 14 Stories

*Issu de la session de brainstorming du 2025-01-27*

| Epic | Titre | Stories | Objectif |
|------|-------|---------|----------|
| **8** | **Éditeur & Gestion Documents** | 6 | Suite bureautique intégrée (Word/Excel) pour créer et modifier des documents in-app |
| **9** | **Fonctionnalités Terrain & Mobile** | 4 | Mode offline, formulaires terrain, signature électronique, photos géolocalisées |
| **10** | **Suivi, Reporting & Automatisation** | 4 | Tableaux de bord avancés, génération auto de rapports, portail bailleur |

### Détail Phase 3

**Epic 8 - Éditeur & Gestion Documents (6 stories)**
- 8.1: Éditeur de documents texte (WYSIWYG)
- 8.2: Éditeur de tableurs (Spreadsheet)
- 8.3: Système de templates pré-remplis
- 8.4: Collaboration temps réel multi-utilisateurs
- 8.5: Gestion avancée documents projet (CRUD)
- 8.6: Visualiseur documents universel

**Epic 9 - Fonctionnalités Terrain & Mobile (4 stories)**
- 9.1: Mode Offline + Synchronisation
- 9.2: Formulaires de collecte terrain dynamiques
- 9.3: Signature électronique
- 9.4: Capture photos + géolocalisation

**Epic 10 - Suivi, Reporting & Automatisation (4 stories)**
- 10.1: Tableau de bord projet avancé
- 10.2: Suivi budgétaire interactif
- 10.3: Génération automatique de rapports
- 10.4: Portail bailleur (lecture seule)

## Séquençage et Dépendances

```text
MICRO-MVP (Semaines 1-4)
========================
Sem 1: Epic 1 (Foundation) + Epic 2 début (GED API)
Sem 2: Epic 2 suite (GED UI)
Sem 3: Epic 3 (Projets)
Sem 4: Epic 4 (Dashboard & Polish)

PHASE 2 (Semaines 5-16)
=======================
Epic 5: Veille ──► Epic 6: Templates ──► Epic 7: Budgets

PHASE 3 (Semaines 17-32)
========================
Epic 8: Éditeur Docs ──► Epic 9: Terrain/Mobile ──► Epic 10: Reporting Auto
        │                        │
        └── Dépend de Epic 2 ────┘ (GED comme base)
```

## Résumé Global

| Phase | Epics | Stories | Focus |
|-------|-------|---------|-------|
| Micro-MVP | 1-4 | 32 | Fondations, GED, Projets |
| Phase 2 | 5-7 | TBD | Veille, Templates, Budgets |
| Phase 3 | 8-10 | 14 | Éditeur avancé, Mobile, Reporting |
| **TOTAL** | **10** | **46+** | **Plateforme complète ONG** |

---

*Dernière mise à jour : 2025-01-27*
