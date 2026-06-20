# REST ERP BI - Frontend Angular

## Description

Ce dépôt contient la partie frontend du module Business Intelligence intégré à REST ERP.

L’objectif est de proposer une interface web claire et interactive permettant aux utilisateurs de consulter les KPIs, les graphiques, les filtres et les exports des différents modules BI.

Le frontend communique avec le backend BI à travers des APIs REST.

## Objectifs du frontend BI

* Afficher des dashboards interactifs.
* Présenter les KPIs sous forme de cartes.
* Visualiser les données avec des graphiques.
* Permettre le filtrage par période et par domaine métier.
* Permettre l’export des résultats.
* Offrir une interface simple, moderne et cohérente avec REST ERP.

## Modules disponibles

Le frontend BI contient principalement les pages suivantes :

* Overview Dashboard
* HR Analytics Dashboard
* Finance Analytics Dashboard
* Sales Analytics Dashboard

## Technologies utilisées

* Angular
* TypeScript
* HTML
* CSS / SCSS
* Angular Material
* Chart.js
* RxJS
* REST API
* Keycloak

## Architecture générale

Le frontend suit le principe suivant :

```text
Component
   ↓
Service Angular
   ↓
API Backend BI
   ↓
Data Warehouse
```

## Structure du projet

```text
src/
 └── app/
     ├── core/
     ├── shared/
     ├── features/
     │   └── bi/
     │       ├── overview/
     │       ├── hr-analytics/
     │       ├── finance-analytics/
     │       ├── sales-analytics/
     │       ├── services/
     │       ├── models/
     │       └── components/
     └── assets/
```

## Description des dossiers importants

### components

Contient les composants réutilisables.

Exemples :

* Carte KPI
* Graphique
* Filtre de période
* Tableau de données
* Bouton d’export

### services

Contient les services Angular qui appellent les APIs backend.

Exemples :

* `overview.service.ts`
* `hr-analytics.service.ts`
* `finance-analytics.service.ts`
* `sales-analytics.service.ts`

### models

Contient les interfaces TypeScript utilisées pour typer les données reçues du backend.

Exemples :

```typescript
export interface KpiCard {
  label: string;
  value: number;
  unit?: string;
  trend?: number;
}
```

### dashboards

Contient les pages principales du module BI.

Chaque dashboard affiche :

* Des cartes KPI
* Des graphiques
* Des filtres
* Des boutons d’export
* Des tableaux ou listes selon le besoin

## Dashboards

### Overview Dashboard

Ce dashboard donne une vue globale sur l’entreprise.

Il regroupe des indicateurs provenant de plusieurs domaines :

* RH
* Finance
* Sales

Exemples de KPIs :

* Total Employees
* Attendance Rate
* Total Revenue
* Net Profit
* Pipeline Value

### HR Analytics Dashboard

Ce dashboard permet d’analyser les données des ressources humaines.

Exemples d’analyses :

* Effectif total
* Présence et absence
* Répartition par département
* Masse salariale
* Attrition

### Finance Analytics Dashboard

Ce dashboard permet d’analyser la situation financière.

Exemples d’analyses :

* Revenus
* Dépenses
* Bénéfice net
* Solde de trésorerie
* Factures ouvertes
* Dettes fournisseurs

### Sales Analytics Dashboard

Ce dashboard permet d’analyser l’activité commerciale.

Exemples d’analyses :

* Nombre de deals
* Valeur du pipeline
* Taux de réussite
* Commandes commerciales
* Chiffre d’affaires par client
* Créances clients

## Filtres

Les dashboards contiennent plusieurs filtres permettant de personnaliser l’analyse.

Exemples :

* Période
* Département
* Genre
* Poste
* Client
* Commercial
* Statut

Ces filtres sont envoyés au backend pour récupérer des résultats adaptés.

## Graphiques

Les graphiques sont réalisés avec Chart.js.

Types de graphiques utilisés :

* Bar chart
* Line chart
* Doughnut chart
* Pie chart

Ces graphiques permettent de visualiser les tendances, les répartitions et les comparaisons.

## Export

Le frontend permet d’exporter les données sous plusieurs formats :

* PDF
* Excel
* CSV

L’export aide l’utilisateur à sauvegarder ou partager les résultats des analyses.

## Authentification

L’accès à l’application est sécurisé par Keycloak.

Après authentification, l’utilisateur accède aux dashboards selon son rôle et son entreprise.

## Configuration

La configuration des URLs backend se trouve généralement dans :

```text
src/environments/environment.ts
```

Exemple :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo-frontend>
cd <nom-du-repo-frontend>
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer l’application

```bash
ng serve
```

L’application sera disponible à l’adresse :

```text
http://localhost:4200
```

## Exemple d’appel service

```typescript
getOverviewKpis(companyKey: number, startDate: string, endDate: string) {
  return this.http.get(`${this.apiUrl}/bi/overview/kpis`, {
    params: {
      companyKey,
      startDate,
      endDate
    }
  });
}
```

## Résultat attendu

Le frontend fournit une interface BI claire et interactive permettant aux décideurs de suivre les indicateurs clés, d’analyser les tendances et d’exporter les résultats.

## Auteur

Projet réalisé dans le cadre du Projet de Fin d’Études.

Module : Business Intelligence intégré à REST ERP.
