# User Interface Design Goals

## Overall UX Vision

L'interface doit être **simple, fonctionnelle et professionnelle**, adaptée à une équipe avec des niveaux variés de compétence technologique (de basique à intermédiaire). L'accent est mis sur :

- **Efficacité** : Accès rapide aux actions fréquentes (upload document, créer projet, consulter dashboard)
- **Clarté** : Navigation intuitive sans formation complexe requise
- **Confiance** : Indicateurs clairs des niveaux d'accès et de la sécurité des documents
- **Productivité** : Réduction du nombre de clics pour accomplir les tâches courantes

L'expérience doit permettre à un nouveau membre (permanent ou bénévole) d'être opérationnel en **moins de 2 heures**.

## Key Interaction Paradigms

| Paradigme | Description |
|-----------|-------------|
| **Dashboard-centric** | Point d'entrée unique avec vue d'ensemble et accès rapide à toutes les fonctions |
| **Drag & Drop** | Upload de documents par glisser-déposer dans la GED |
| **Recherche omniprésente** | Barre de recherche globale accessible depuis toute page |
| **Actions contextuelles** | Menus d'actions sur les éléments (documents, projets) via clic droit ou bouton "..." |
| **Breadcrumbs** | Navigation par fil d'Ariane dans la GED pour la hiérarchie des dossiers |
| **Notifications inline** | Alertes et confirmations non-bloquantes (toasts) |
| **Formulaires progressifs** | Création de projets/documents en étapes simples avec sauvegarde automatique |

## Core Screens and Views

### Écrans Principaux (Micro-MVP)

| # | Écran | Description | Priorité |
|---|-------|-------------|----------|
| 1 | **Login / Inscription** | Authentification sécurisée | P0 |
| 2 | **Dashboard Principal** | Vue d'ensemble : projets actifs, documents récents, alertes | P0 |
| 3 | **GED - Explorateur de Documents** | Navigation dossiers, liste documents, upload, recherche | P0 |
| 4 | **GED - Détail Document** | Prévisualisation, métadonnées, historique versions, partage | P0 |
| 5 | **Projets - Liste** | Tous les projets avec filtres (statut, date) | P0 |
| 6 | **Projet - Détail** | Fiche projet, équipe assignée, documents liés, avancement | P0 |
| 7 | **Projet - Création/Édition** | Formulaire de création et modification | P0 |
| 8 | **Administration - Utilisateurs** | Gestion des comptes et rôles (Super-Admin uniquement) | P0 |
| 9 | **Profil Utilisateur** | Paramètres personnels, mot de passe | P1 |

### Écrans Phase 2

| # | Écran | Description | Phase |
|---|-------|-------------|-------|
| 10 | Veille - Liste Appels d'Offres | Appels d'offres agrégés avec filtres | Phase 2 |
| 11 | Veille - Détail Appel d'Offre | Informations complètes, actions | Phase 2 |
| 12 | Templates - Bibliothèque | Liste et gestion des templates | Phase 2 |
| 13 | Propositions - Éditeur | Composition de propositions | Phase 2 |
| 14 | Budgets - Éditeur | Création et gestion budgets | Phase 2 |

## Accessibility

**Niveau : WCAG AA (Standard)**

- Contraste de couleurs suffisant (ratio 4.5:1 minimum)
- Navigation au clavier possible
- Labels sur tous les champs de formulaire
- Messages d'erreur clairs et descriptifs
- Textes alternatifs sur les images fonctionnelles

## Branding

**Proposition de direction visuelle :**

- **Couleurs** : Palette professionnelle et sobre (bleus/gris) évoquant confiance et sérieux
  - Primaire : Bleu institutionnel (#2563EB ou similaire)
  - Secondaire : Gris neutre
  - Accent : Vert pour succès/validation, Orange pour alertes
- **Typographie** : Police sans-serif lisible (Inter, Open Sans, ou système)
- **Style** : Clean, moderne, sans fioritures - focus sur le contenu
- **Logo** : Espace réservé pour logo ONG Chadia dans la navbar

## Target Device and Platforms

**Cible : Web Responsive**

| Plateforme | Support | Priorité |
|------------|---------|----------|
| Desktop (>1024px) | Optimisé | Principal |
| Tablette (768-1024px) | Adapté | Secondaire |
| Mobile (<768px) | Fonctionnel | Tertiaire |

**Navigateurs supportés :**
- Chrome (2 dernières versions)
- Firefox (2 dernières versions)
- Safari (2 dernières versions)
- Edge (2 dernières versions)

---
