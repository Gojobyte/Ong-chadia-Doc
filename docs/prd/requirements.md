# Requirements

## Functional Requirements

### Module Authentification & Utilisateurs

- **FR1:** Le système doit permettre la création de comptes utilisateurs avec 4 niveaux de rôles : Super-Admin, Staff, Contributeur, Invité
- **FR2:** Le système doit authentifier les utilisateurs via email/mot de passe avec tokens JWT sécurisés
- **FR3:** Les Super-Admins doivent pouvoir créer, modifier, désactiver et supprimer des comptes utilisateurs
- **FR4:** Les Super-Admins doivent pouvoir assigner et modifier les rôles des utilisateurs

### Module GED (Gestion Électronique de Documents)

- **FR5:** Le système doit permettre l'upload de documents (PDF, Word, Excel, images) jusqu'à 50 MB
- **FR6:** Le système doit organiser les documents en dossiers/catégories hiérarchiques
- **FR7:** Le système doit appliquer les permissions d'accès par rôle sur chaque dossier/document
- **FR8:** Le système doit permettre la recherche de documents par nom, tags et métadonnées
- **FR9:** Le système doit conserver un historique des versions de chaque document
- **FR10:** Le système doit permettre le partage de documents via liens sécurisés (pour bailleurs/partenaires)
- **FR11:** Le système doit journaliser tous les accès aux documents sensibles

### Module Gestion de Projets

- **FR12:** Le système doit permettre la création de fiches projet (nom, description, dates, budget, statut)
- **FR13:** Le système doit permettre l'assignation de membres d'équipe (permanents + bénévoles) aux projets
- **FR14:** Le système doit suivre l'avancement des projets par phases (Préparation, En cours, Terminé)
- **FR15:** Le système doit lier automatiquement les documents de la GED aux projets concernés
- **FR16:** Le système doit afficher un tableau de bord avec les projets actifs et leurs statuts

### Module Veille Appels d'Offres (Phase 2 - Post Micro-MVP)

- **FR17:** Le système doit agréger les appels d'offres depuis des sources configurables (emails IMAP, flux RSS)
- **FR18:** Le système doit filtrer les appels d'offres par mots-clés sectoriels (WASH, formation, sécurité alimentaire)
- **FR19:** Le système doit afficher les appels d'offres avec indicateur de pertinence (Pertinent/Non pertinent/À examiner)
- **FR20:** Le système doit alerter par email sur les nouveaux appels d'offres pertinents

### Module Templates & Propositions (Phase 2 - Post Micro-MVP)

- **FR21:** Le système doit permettre la création et gestion de templates réutilisables (présentation ONG, méthodologies, budgets)
- **FR22:** Le système doit permettre la composition de propositions en assemblant des blocs de templates
- **FR23:** Le système doit exporter les propositions en format Word et PDF
- **FR24:** Le système doit gérer les versions des templates

### Module Budgets (Phase 2 - Post Micro-MVP)

- **FR25:** Le système doit fournir des templates de budgets avec lignes budgétaires standards
- **FR26:** Le système doit calculer automatiquement les totaux, sous-totaux et pourcentages
- **FR27:** Le système doit exporter les budgets en Excel et PDF

### Dashboard Unifié

- **FR28:** Le système doit afficher un tableau de bord avec accès rapide aux projets, documents et (plus tard) appels d'offres
- **FR29:** Le système doit afficher des alertes sur les échéances approchantes

## Non-Functional Requirements

### Performance

- **NFR1:** Le temps de chargement de chaque page doit être ≤ 3 secondes
- **NFR2:** La recherche dans la GED doit retourner des résultats en ≤ 1 seconde
- **NFR3:** Le système doit supporter 20+ utilisateurs simultanés (scalable au-delà)

### Sécurité

- **NFR4:** Toutes les communications doivent être chiffrées via HTTPS/TLS
- **NFR5:** Les documents sensibles doivent être chiffrés at-rest (AES-256)
- **NFR6:** Les mots de passe doivent être hashés avec bcrypt ou Argon2
- **NFR7:** Le système doit implémenter RBAC (Role-Based Access Control) à 4 niveaux
- **NFR8:** Les tokens JWT doivent expirer après une durée configurable avec refresh tokens

### Disponibilité & Fiabilité

- **NFR9:** Le système doit avoir un uptime ≥ 95% durant le MVP (≥ 99% post-MVP)
- **NFR10:** Les backups de la base de données doivent être effectués au minimum hebdomadairement (quotidiennement post-MVP)

### Infrastructure & Coûts

- **NFR11:** L'infrastructure MVP doit utiliser exclusivement des tiers gratuits (Vercel, Railway/Render, Supabase)
- **NFR12:** L'architecture doit permettre une migration facile vers VPS sans refonte majeure
- **NFR13:** Le stockage documents doit rester sous 25 GB pour le MVP (limite tier gratuit)

### Compatibilité

- **NFR14:** L'application doit être responsive et fonctionner sur navigateurs modernes (Chrome, Firefox, Safari, Edge - 2 dernières versions)
- **NFR15:** L'interface doit être utilisable sur tablettes et mobiles (pas d'app native pour MVP)

### Conformité

- **NFR16:** Le système doit respecter les principes RGPD (données personnelles des bénéficiaires/staff)
- **NFR17:** Le système doit permettre l'export et la suppression des données personnelles sur demande

### Maintenabilité

- **NFR18:** Le code doit inclure des tests unitaires pour les fonctionnalités critiques
- **NFR19:** La documentation technique doit être maintenue à jour

### Langue

- **NFR20:** L'interface utilisateur doit être en français pour le MVP

---
