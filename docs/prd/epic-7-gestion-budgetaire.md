# Epic 7: Gestion Budgétaire

## Objectif

Fournir des outils complets de création, gestion et suivi budgétaire adaptés aux besoins des ONG. Cette fonctionnalité permet de construire des budgets de projet conformes aux formats bailleurs, de suivre les dépenses en temps réel et d'anticiper les problèmes financiers.

## Story 7.1: Création de Budget Projet

**As a** gestionnaire financier,
**I want** créer un budget de projet avec une structure flexible,
**so that** je puisse planifier les ressources financières selon le format requis.

**Acceptance Criteria:**

1. Interface de création de budget intuitive
2. Structure hiérarchique: Catégories > Lignes > Sous-lignes
3. Catégories standards ONG: Personnel, Équipement, Activités, Frais généraux, etc.
4. Import de structure depuis template bailleur
5. Périodes budgétaires configurables (mensuel, trimestriel, annuel)
6. Multi-devises avec taux de conversion
7. Calculs automatiques (totaux, sous-totaux, pourcentages)
8. Formules personnalisées entre cellules
9. Commentaires/justifications par ligne
10. Validation format avant soumission

---

## Story 7.2: Templates Budgétaires par Bailleur

**As a** chargé de budget,
**I want** utiliser des templates budgétaires conformes aux formats bailleurs,
**so that** mes budgets respectent les exigences spécifiques de chaque financeur.

**Acceptance Criteria:**

1. Bibliothèque de templates budgétaires
2. Templates par bailleur: UE, AFD, USAID, ECHO, etc.
3. Structure pré-définie avec catégories obligatoires
4. Règles de calcul spécifiques (frais indirects, plafonds)
5. Création depuis template avec pré-remplissage
6. Personnalisation du template de base
7. Validation automatique conformité bailleur
8. Export au format exact bailleur (Excel spécifique)
9. Mise à jour des templates selon évolutions bailleurs
10. Tests de conformité

---

## Story 7.3: Ventilation et Répartition Budgétaire

**As a** coordinateur projet,
**I want** ventiler le budget par période, activité et source de financement,
**so that** j'aie une vision claire de l'allocation des ressources.

**Acceptance Criteria:**

1. Ventilation temporelle (mensuelle/trimestrielle)
2. Ventilation par work package / activité
3. Ventilation par source de financement (co-financement)
4. Graphiques de répartition (camembert, barres)
5. Tableau croisé dynamique
6. Calcul automatique des quotes-parts
7. Alertes si déséquilibre détecté
8. Comparaison entre scénarios budgétaires
9. Export ventilation détaillée
10. Drill-down depuis graphiques

---

## Story 7.4: Suivi Budgétaire en Temps Réel

**As a** responsable financier,
**I want** suivre la consommation budgétaire en temps réel,
**so that** je puisse anticiper les dépassements et ajuster si nécessaire.

**Acceptance Criteria:**

1. Dashboard suivi budget avec KPIs
2. Comparaison Prévu vs Réel vs Engagé
3. Calcul automatique des écarts (montant et %)
4. Projection de consommation fin de projet
5. Alertes seuils configurables (80%, 100%, etc.)
6. Suivi par catégorie et par ligne
7. Courbe de consommation dans le temps
8. Intégration avec saisie des dépenses (Epic 10.2)
9. Rapports périodiques automatiques
10. Export suivi pour reporting bailleur

---

## Story 7.5: Révisions et Avenants Budgétaires

**As a** directeur de projet,
**I want** gérer les révisions budgétaires et avenants,
**so that** je puisse adapter le budget aux réalités du terrain tout en gardant l'historique.

**Acceptance Criteria:**

1. Création de révision depuis budget existant
2. Comparaison version initiale vs révision
3. Justification obligatoire des modifications
4. Workflow d'approbation interne
5. Historique complet des versions
6. Calcul impact des modifications
7. Génération document avenant
8. Notification des parties prenantes
9. Gel de la version approuvée
10. Audit trail complet

---

## Story 7.6: Rapports Financiers Standards

**As a** comptable,
**I want** générer des rapports financiers standards,
**so that** je puisse répondre aux exigences de reporting des bailleurs.

**Acceptance Criteria:**

1. Rapport d'exécution budgétaire
2. Rapport de trésorerie prévisionnelle
3. État des dépenses par catégorie
4. Tableau de suivi des décaissements
5. Format configurable par bailleur
6. Période de reporting paramétrable
7. Inclusion des justificatifs (liens vers pièces)
8. Signature électronique du rapport
9. Export PDF et Excel
10. Planification génération automatique

---
