# Mouhyi Portfolio — Angular 22 (Étape 1/4)

## État actuel
- ✅ Structure du projet Angular 22, standalone components, signals, nouvelle syntaxe `@if/@for`.
- ✅ Toutes les sections du site public reproduites : Hero, Profil, Compétences, Expériences (timeline dépliable), Formation, Sociétés de conseil, Contact.
- ✅ Sélecteur FR/EN piloté par un signal global (`I18nService`), sans manipulation directe du DOM.
- ⏳ Les données sont **codées en dur** dans `PortfolioDataService` (étape 2 : bascule vers Firestore, même interface publique donc **aucun composant ne changera**).
- ⏳ Pas encore de panel admin ni d'authentification (étape 3).
- ⏳ Pas encore de configuration GitHub Pages / Vercel (étape 4).

## Lancer le projet en local

Ce projet a été écrit à la main (sans exécuter `ng new` ni `npm install`, l'environnement qui l'a généré n'a pas d'accès réseau). Pour le démarrer chez vous :

\`\`\`bash
# 1. Installer Angular CLI si besoin
npm install -g @angular/cli@22

# 2. Installer les dépendances du projet
cd mouhyi-portfolio
npm install

# 3. Lancer le serveur de dev
ng serve
# -> http://localhost:4200
\`\`\`

Si `npm install` remonte des incohérences de versions mineures, lancez `npm install --legacy-peer-deps` — Angular 22 vient de sortir (juin 2026), certains outils tiers n'ont pas encore tous mis à jour leurs `peerDependencies`.

## Structure

\`\`\`
src/app/
├── app.ts                  # coquille racine (router-outlet)
├── app.config.ts           # providers (router, change detection)
├── app.routes.ts           # route publique '' + route admin (étape 3)
├── core/
│   ├── i18n.service.ts     # langue globale (signal), dictionnaire FR/EN
│   ├── portfolio-data.service.ts  # données (→ Firestore à l'étape 2)
│   └── reveal.directive.ts # animation d'apparition au scroll
├── models/portfolio.models.ts
└── features/
    ├── public-site/        # assemble toute la page
    ├── nav/  hero/  about/  skills/
    ├── experience/          # + experience-card (état "déplié" local)
    ├── education/  contact/
\`\`\`

## Prochaine étape (2/4)
Brancher `PortfolioDataService` sur Firestore avec `@angular/fire`, en lecture publique, et écrire le script d'import qui poussera les données actuelles (déjà structurées dans ce service) vers les 4 collections Firestore.
