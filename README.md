# Mouhyi Portfolio — Angular 22 + Firebase

Portfolio / CV en ligne : application Angular 22 (standalone components, Signals, control flow `@if/@for/@switch`, pas de NgModule), données dans Firestore, panel d'administration caché protégé par Firebase Auth. Aucun backend : tout passe par le SDK Firebase côté navigateur. Déployé en statique sur GitHub Pages **et** sur Vercel.

## Sommaire
1. [Lancer en local](#1-lancer-en-local)
2. [Architecture](#2-architecture)
3. [Modèle Firestore](#3-modèle-firestore)
4. [Mise en place de Firebase](#4-mise-en-place-de-firebase)
5. [Panel d'administration](#5-panel-dadministration)
6. [Déploiement](#6-déploiement)

---

## 1. Lancer en local

Prérequis : Node.js `^22.22.3`, `^24.15.0` ou `>=26` (exigence d'Angular 22).

```bash
npm install
npm start            # ng serve -> http://localhost:4200
npm run build        # build de prod dans dist/mouhyi-portfolio/browser (+ 404.html)
```

Tant que `src/environments/environment.ts` contient les valeurs `REPLACE_ME`, le site s'affiche avec le message « contenu momentanément indisponible » : c'est normal, il faut d'abord configurer Firebase (section 4).

## 2. Architecture

```
src/
├── environments/environment.ts      # config Firebase (pas un secret, voir 4.2)
├── index.html
├── styles.css
└── app/
    ├── app.routes.ts                # '' = site public, ADMIN_PATH = panel caché
    ├── core/
    │   ├── firebase.ts              # InjectionTokens FIREBASE_APP / FIRESTORE
    │   ├── collections.ts           # noms des collections (partagé avec scripts/)
    │   ├── portfolio-data.service.ts# lecture Firestore -> signals en lecture seule
    │   ├── i18n.service.ts          # langue FR/EN = un signal global
    │   └── reveal.directive.ts
    ├── models/portfolio.models.ts
    ├── features/                    # site public (hero, about, skills, experience...)
    └── admin/                       # chargé en lazy, jamais téléchargé par les visiteurs
        ├── admin-path.ts            # URL du panel
        ├── admin-auth.service.ts    # Firebase Auth (email / mot de passe)
        ├── admin.guard.ts           # CanActivateFn
        ├── admin-data.service.ts    # écritures Firestore
        ├── login/
        └── dashboard/               # listes + formulaires (Reactive Forms)
scripts/
├── seed-data.ts                     # données initiales (ex-index.html)
├── seed-firestore.mts               # npm run seed
└── postbuild.mjs                    # génère 404.html + .nojekyll
firestore.rules                      # règles de sécurité
firebase.json                        # pour déployer les règles avec la CLI
vercel.json
.github/workflows/deploy-pages.yml
```

Choix techniques :
- **SDK Firebase modulaire direct, sans `@angular/fire`** : la dernière version d'`@angular/fire` (20.1) n'accepte que `@angular/core ^20`. Le SDK est exposé via des `InjectionToken` pour rester injectable.
- **Firestore Lite** (`firebase/firestore/lite`) : lectures ponctuelles et écritures, sans temps réel ni cache hors-ligne. Environ 3 fois plus léger que le SDK complet, largement suffisant ici.
- **`PortfolioDataService`** lit les 4 collections au démarrage et expose `skillGroups`, `experiences`, `education`, `agencies` et `status` (`loading | ready | error`) en signals en lecture seule. Le panel admin appelle `reload()` après chaque écriture.
- **Firebase Auth n'est importé que dans le code admin**, qui est chargé en lazy : les visiteurs du site ne le téléchargent pas.

## 3. Modèle Firestore

L'id du document Firestore sert d'identifiant ; il n'est pas répété dans les champs. Les textes traduits utilisent des champs `…Fr` / `…En` à plat, plus simples à éditer dans des formulaires.

**`experiences/{id}`**

| Champ | Type | Exemple |
|---|---|---|
| `company` | string | `"RATP"` |
| `roleFr` / `roleEn` | string | `"Ingénieur logiciel"` / `"Software engineer"` |
| `period` | string | `"02/2026 – 08/2026 · 7 mois"` |
| `location` | string | `"Rennes"` |
| `contextFr` / `contextEn` | string | contexte de la mission |
| `bulletsFr` / `bulletsEn` | string[] | réalisations (les 3 premières sont toujours visibles, le reste est dépliable) |
| `tags` | string[] | `["Angular", "Java"]` |
| `order` | number | ordre d'affichage, **le plus grand en premier** |

**`skills/{id}`** : une catégorie de compétences (ex. `backend`)

| Champ | Type |
|---|---|
| `nameFr` / `nameEn` | string |
| `skills` | `{ fr: string, en: string }[]` |
| `order` | number (**le plus petit en premier**) |

La catégorie d'id `languages` alimente aussi le compteur « langues parlées » de la section Profil.

**`education/{id}`** : `titleFr`, `titleEn`, `school`, `date`, `order`
**`agencies/{id}`** : `name`, `roleFr`, `roleEn`, `date`, `order`

## 4. Mise en place de Firebase

### 4.1 Créer le projet et l'application Web
1. Sur <https://console.firebase.google.com>, cliquez sur **Ajouter un projet** (Google Analytics n'est pas nécessaire).
2. Dans **Paramètres du projet > Général > Vos applications**, ajoutez une application **Web** (`</>`). Firebase Hosting n'est pas nécessaire.
3. Copiez l'objet `firebaseConfig` affiché dans `src/environments/environment.ts` (clé `firebase`).

### 4.2 La config Firebase n'est pas un secret
`apiKey`, `projectId`, `appId`… **identifient** le projet ; ils ne l'**autorisent** à rien. Ils sont de toute façon lisibles dans le JavaScript servi à chaque visiteur, donc les cacher ne sert à rien. `environment.ts` est versionné volontairement.

Ce qui protège les données :
- les **règles Firestore** (`firestore.rules`) : lecture publique, écriture réservée à un seul UID ;
- **Firebase Authentication** : seul le compte admin peut obtenir un jeton portant cet UID.

Durcissement optionnel : dans Google Cloud Console > APIs & Services > Credentials, restreignez la clé API aux référents HTTP de vos domaines (GitHub Pages, Vercel, `localhost`).

Ne versionnez en revanche **jamais** le mot de passe admin, ni une clé de compte de service (`.env` est dans `.gitignore`).

### 4.3 Firestore
1. **Build > Firestore Database > Créer une base de données**, en mode **production**, dans une région européenne (ex. `europe-west9`, Paris).
2. Les règles se déploient après avoir créé le compte admin (4.4).

### 4.4 Authentication et compte admin
1. **Build > Authentication > Commencer**, puis activez le fournisseur **E-mail/Mot de passe**.
2. Dans l'onglet **Users > Ajouter un utilisateur**, créez votre compte admin (e-mail + mot de passe robuste).
3. Copiez son **User UID**.
4. **Important** : dans **Authentication > Settings > User actions**, décochez **Enable create (sign-up)**. Sinon, n'importe qui peut créer un compte via l'API REST publique avec la clé API. Ce compte n'aurait pas le droit d'écrire (les règles vérifient l'UID), mais autant fermer la porte.

### 4.5 Règles de sécurité
1. Dans `firestore.rules`, remplacez `REPLACE_WITH_ADMIN_UID` par l'UID copié.
2. Déployez-les, au choix :
   - collez le contenu du fichier dans **Firestore > Règles**, puis **Publier** ;
   - ou, en ligne de commande :
     ```bash
     npx firebase-tools login
     npx firebase-tools deploy --only firestore:rules --project <PROJECT_ID>
     ```

### 4.6 Importer les données initiales
Le script reprend les données de l'ancien `index.html` (`scripts/seed-data.ts`). Il se connecte **avec le compte admin** (les écritures passent par les mêmes règles que le panel, aucune clé de compte de service n'est nécessaire).

```bash
# .env à la racine (ignoré par git)
ADMIN_EMAIL=vous@example.com
ADMIN_PASSWORD=********
```
```bash
npm run seed -- --dry-run   # affiche ce qui serait importé
npm run seed                # importe (refuse si les collections contiennent déjà des données)
npm run seed -- --force     # écrase les documents de même id
```

Relancez `npm start` : le site affiche maintenant les données issues de Firestore.

## 5. Panel d'administration

- URL : **`/panel-94y3q6khdy2y`** (définie dans `src/app/admin/admin-path.ts`). Elle n'apparaît dans aucun lien du site ; les pages admin portent `noindex, nofollow`.
- C'est de la **discrétion, pas de la sécurité** : le chemin figure dans le bundle JS. La protection réelle, ce sont Firebase Auth et les règles Firestore. Pour changer l'URL, modifiez seulement la constante `ADMIN_PATH`. Ne l'ajoutez pas dans un `robots.txt` ou un sitemap.
- Sans session, l'`adminGuard` redirige vers `/panel-…/login`. Il n'existe aucun écran d'inscription.
- Une fois connecté :
  - **Expériences** : ajouter, modifier, supprimer. Les réalisations se saisissent une par ligne, les tags séparés par des virgules.
  - **Compétences** : chaque catégorie (Back-end, Front-end…) contient sa liste de compétences FR/EN. On ajoute, modifie ou supprime une compétence dans le formulaire de sa catégorie, puis on enregistre.
- Si un autre compte que l'admin réussissait à se connecter, chaque écriture serait refusée par Firestore (`permission-denied`), avec un message explicite.

## 6. Déploiement

`npm run build` produit un site 100 % statique dans `dist/mouhyi-portfolio/browser`. Le hook `postbuild` y ajoute :
- `404.html` : une copie d'`index.html`. GitHub Pages ne sait pas réécrire les URLs d'une SPA ; pour une URL profonde (ex. `/panel-…/login`), il sert `404.html`, donc l'application Angular se charge et le router affiche la bonne route.
- `.nojekyll`, pour désactiver le traitement Jekyll.

### GitHub Pages
1. Dans le dépôt GitHub : **Settings > Pages > Build and deployment > Source : GitHub Actions**.
2. Chaque push sur `main` lance `.github/workflows/deploy-pages.yml` : `npm ci`, build, puis publication.
3. Le `base href` est calculé automatiquement par `actions/configure-pages` : `/` pour un site utilisateur, `/<nom-du-repo>/` pour un site de projet.

> ⚠️ Le dépôt appartient au compte `Mouhyi-Eddine`. Le site GitHub Pages sera donc servi à
> `https://mouhyi-eddine.github.io/mouhyi-moutarajji.github.io/` (site de projet), et non à
> `https://mouhyi-moutarajji.github.io/`, sauf si vous configurez un domaine personnalisé.
> Pensez à mettre à jour les URL `canonical` / `og:url` / JSON-LD de `src/index.html`.

### Vercel
`vercel.json` fixe la commande de build, le dossier de sortie et une réécriture de toutes les routes vers `/index.html` (les fichiers existants restent servis en priorité). Aucune variable d'environnement n'est nécessaire, puisque la config Firebase est dans `environment.ts`.
Dans les paramètres du projet Vercel, vérifiez que la **version de Node.js** est 22.x ou 24.x.
