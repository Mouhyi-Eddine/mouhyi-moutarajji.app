# Mouhyi Eddine Moutarajji — Portfolio

Portfolio et CV en ligne d'un ingénieur logiciel senior Java / Angular, bilingue FR/EN.
Le contenu (expériences, compétences, formation, sociétés de conseil) est stocké dans Firestore et se met à jour sans redéploiement. Un accès d'administration existe en interne.

**Production**
- Vercel : <https://mouhyi-moutarajjiapp.vercel.app/>
- GitHub Pages : <https://mouhyi-eddine.github.io/mouhyi-moutarajji.app/>

## Stack technique

- **Angular 22** : composants standalone, Signals (`signal`, `computed`, `effect`), control flow `@if / @for / @switch`, Reactive Forms
- **Firebase** (SDK JS modulaire) : Firestore Lite pour les données, Authentication pour l'administration
- **Hébergement statique**, sans backend : GitHub Pages (GitHub Actions) et Vercel

## Lancer le projet en local

Prérequis : Node.js 22.22+, 24.15+ ou 26+.

```bash
npm install
npm start            # http://localhost:4200
```

### Configuration Firebase

La configuration du projet Firebase se trouve dans `src/environments/environment.ts` (objet `firebase` : `apiKey`, `authDomain`, `projectId`…). Pour pointer vers votre propre projet, remplacez ces valeurs par celles de **Console Firebase > Paramètres du projet > Vos applications > Web**.

Ces valeurs ne sont pas des secrets. Elles sont de toute façon visibles dans le JavaScript servi au navigateur. Les données sont protégées par les règles Firestore (`firestore.rules`) et par Firebase Authentication.

Dans un nouveau projet Firebase :
1. Créez une base **Firestore** en mode production.
2. Activez **Authentication > E-mail/Mot de passe**, créez un compte administrateur, puis désactivez l'inscription publique (*Settings > User actions*).
3. Mettez l'UID de ce compte dans `firestore.rules`, puis publiez les règles (console, ou `npx firebase-tools deploy --only firestore:rules`).
4. *(Optionnel)* Importez le contenu initial : créez un fichier `.env` à la racine (il n'est pas versionné) contenant `ADMIN_EMAIL` et `ADMIN_PASSWORD`, puis lancez `npm run seed`. Utilisez `npm run seed -- --dry-run` pour prévisualiser sans rien écrire.

## Build

```bash
npm run build
```

Le site statique est généré dans `dist/mouhyi-portfolio/browser/`. Après la compilation, le build produit aussi :
- `404.html`, pour que les URL profondes fonctionnent sur GitHub Pages ;
- `portfolio-data.json`, un instantané public des données Firestore. Le site l'affiche immédiatement puis le remplace par les données en direct, et il reste complet si Firestore est momentanément indisponible. Sans accès réseau pendant le build, cette étape est ignorée sans erreur.

Les fichiers statiques servis tels quels (`robots.txt`, `sitemap.xml`, `og-image.png`) sont dans `public/`.

## Déploiement

Les deux déploiements sont automatiques à chaque push sur `main` :

- **GitHub Pages** : le workflow `.github/workflows/deploy-pages.yml` build et publie le site. Le `base href` est calculé automatiquement. Il faut que *Settings > Pages > Source* soit réglé sur **GitHub Actions**.
- **Vercel** : `vercel.json` définit la commande de build, le dossier de sortie et la réécriture des routes vers `index.html`.

Aucune variable d'environnement n'est nécessaire sur les plateformes d'hébergement.
