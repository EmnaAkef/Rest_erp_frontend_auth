# REST ERP BI - Frontend Angular

> Interface Business Intelligence développée avec Angular pour visualiser les KPIs, graphiques, filtres et exports du module décisionnel intégré à REST ERP.

![Statut](https://img.shields.io/badge/statut-termin%C3%A9-brightgreen)
![Angular](https://img.shields.io/badge/Angular-15+-red)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![Chart.js](https://img.shields.io/badge/Chart.js-Data%20Visualization-orange)
![Angular Material](https://img.shields.io/badge/Angular%20Material-UI-purple)

---

## 🎯 Contexte

* **Type de projet** : Académique - Projet de Fin d’Études
* **Durée** : 14 semaines
* **Projet global** : Intégration d’une couche Business Intelligence dans REST ERP
* **Problématique** : Les données de REST ERP doivent être présentées sous forme claire, visuelle et interactive pour faciliter la prise de décision.

Ce dépôt contient la partie frontend du module BI.
Il permet aux utilisateurs de consulter les tableaux de bord, d’appliquer des filtres et d’exporter les résultats.

---

## ✨ Fonctionnalités principales

* ✅ Dashboard global Overview
* ✅ Dashboard RH Analytics
* ✅ Dashboard Finance Analytics
* ✅ Dashboard Sales Analytics
* ✅ Affichage des KPIs sous forme de cartes
* ✅ Visualisation des données avec Chart.js
* ✅ Filtres dynamiques par période et par domaine métier
* ✅ Export des données en PDF, Excel et CSV
* ✅ Communication avec le backend via APIs REST
* ✅ Interface sécurisée avec Keycloak

---

## 🛠️ Stack technique

| Catégorie               | Technologies utilisées                    |
| ----------------------- | ----------------------------------------- |
| Langages                | TypeScript, HTML, CSS / SCSS              |
| Frameworks / Librairies | Angular, Angular Material, Chart.js, RxJS |
| Base de données         | Non utilisée directement côté frontend    |
| Outils / Environnement  | Node.js, npm, Git, VS Code, REST API      |

---

## 📸 Aperçu / Démo

![Aperçu Dashboard](screenshots/overview-dashboard.png)

🔗 **Démo en ligne** : Non disponible
🎥 **Vidéo de démonstration** : À ajouter si disponible

---

## ⚙️ Installation

```bash
# Cloner le repo
git clone https://github.com/tonpseudo/rest-erp-bi-frontend.git
cd rest-erp-bi-frontend

# Installer les dépendances
npm install

# Lancer le projet
ng serve
```

L’application sera disponible sur :

```text
http://localhost:4200
```

Configurer l’URL du backend dans :

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

---

## 🚀 Utilisation

Une fois l’application lancée, l’utilisateur peut accéder à la section Business Intelligence depuis l’interface REST ERP.

Les principales pages disponibles sont :

```text
/bi/overview
/bi/hr-analytics
/bi/finance-analytics
/bi/sales-analytics
```

L’utilisateur peut :

1. Choisir un dashboard
2. Sélectionner une période d’analyse
3. Appliquer des filtres métier
4. Consulter les KPIs et les graphiques
5. Exporter les résultats

---

## 📊 Résultats / Insights

* 🔑 **Insight clé 1** : Les données complexes sont transformées en dashboards simples et lisibles.
* 📈 **Indicateur clé** : Les décideurs peuvent suivre des indicateurs comme le taux de présence, le bénéfice net, le revenu total et la valeur du pipeline.
* 📋 **Dashboard interactif** : Les dashboards permettent une analyse par période, module, département, client ou commercial.

---

## 🗂️ Architecture

```text
+-----------------------------+
| Components Angular           |
| - KPI Cards                  |
| - Charts                     |
| - Filters                    |
| - Export Buttons             |
+--------------+--------------+
               |
               v
+-----------------------------+
| Services Angular             |
| - OverviewService            |
| - HrAnalyticsService         |
| - FinanceAnalyticsService    |
| - SalesAnalyticsService      |
+--------------+--------------+
               |
               v
+-----------------------------+
| Backend BI REST APIs          |
+--------------+--------------+
               |
               v
+-----------------------------+
| Data Warehouse PostgreSQL     |
+-----------------------------+
```

Structure simplifiée :

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

---

## 🔮 Améliorations futures

* [ ] Ajouter plus d’animations dans les dashboards
* [ ] Ajouter un mode sombre
* [ ] Améliorer la responsivité mobile
* [ ] Ajouter des filtres avancés
* [ ] Ajouter des dashboards personnalisables par utilisateur

---

## 👥 Auteurs

Projet réalisé par :

Emna Akef

🔗 LinkedIn : www.linkedin.com/in/emna-akef
💻 GitHub : https://github.com/EmnaAkef
📧 Email : akef.emna@gmail.com

Ghofrane Messaoud

🔗 LinkedIn : www.linkedin.com/in/ghofrane-messaoud
💻 GitHub : https://github.com/ghoffraanee
📧 Email : ghofranemessaoud05@gmail.com
