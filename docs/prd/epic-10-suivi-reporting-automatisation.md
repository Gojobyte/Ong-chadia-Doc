# Epic 10: Suivi, Reporting & Automatisation

## Objectif

Automatiser le suivi des projets et la génération de rapports pour les bailleurs de fonds. Cette fonctionnalité permet aux équipes ONG de gagner un temps considérable sur le reporting tout en offrant aux bailleurs une transparence totale sur l'utilisation des fonds.

## Story 10.1: Tableau de Bord Projet Avancé

**As a** chef de projet,
**I want** avoir un tableau de bord synthétique de mon projet,
**so that** je puisse suivre l'avancement et identifier rapidement les problèmes.

**Acceptance Criteria:**

1. Dashboard personnalisable par projet
2. Widget avancement global (% completion)
3. Widget budget (consommé vs restant, graphique)
4. Widget timeline (jalons atteints, prochaines échéances)
5. Widget équipe (membres actifs, dernières contributions)
6. Widget documents (récents, à réviser)
7. Widget alertes (dépassements, retards)
8. Période configurable (semaine, mois, trimestre, année)
9. Export du dashboard en PDF
10. Rafraîchissement automatique des données

---

## Story 10.2: Suivi Budgétaire Interactif

**As a** gestionnaire financier,
**I want** suivre le budget du projet en temps réel,
**so that** je puisse contrôler les dépenses et éviter les dépassements.

**Acceptance Criteria:**

1. Saisie des lignes budgétaires prévisionnelles
2. Saisie des dépenses réelles avec justificatifs
3. Comparaison prévu vs réel par catégorie
4. Calcul automatique des écarts et %
5. Alertes configurables (80%, 100% consommé)
6. Graphiques de suivi (barres, courbes d'évolution)
7. Ventilation par période (mensuel, trimestriel)
8. Multi-devises avec taux de conversion
9. Export Excel du suivi budgétaire
10. Historique des modifications budgétaires

---

## Story 10.3: Génération Automatique de Rapports

**As a** chef de projet,
**I want** générer automatiquement des rapports à partir des données du projet,
**so that** je gagne du temps sur le reporting bailleur.

**Acceptance Criteria:**

1. Templates de rapports configurables
2. Génération automatique rapport mensuel
3. Génération automatique rapport trimestriel
4. Insertion automatique des données projet (budget, activités, indicateurs)
5. Insertion automatique des photos récentes
6. Sections éditables manuellement avant finalisation
7. Export PDF et Word
8. Planification de génération automatique (cron)
9. Envoi automatique par email aux destinataires configurés
10. Historique des rapports générés

---

## Story 10.4: Portail Bailleur (Lecture Seule)

**As a** bailleur de fonds,
**I want** accéder à un portail dédié pour suivre mes projets financés,
**so that** je puisse consulter l'avancement sans solliciter l'équipe projet.

**Acceptance Criteria:**

1. Espace dédié bailleur avec authentification séparée
2. Vue liste des projets financés par ce bailleur
3. Dashboard synthétique par projet (lecture seule)
4. Accès aux rapports générés
5. Accès aux documents partagés spécifiquement
6. Visualisation du suivi budgétaire
7. Timeline des jalons et activités
8. Galerie photos des réalisations
9. Notifications email des nouveaux rapports disponibles
10. Export des données pour reporting interne bailleur

---
