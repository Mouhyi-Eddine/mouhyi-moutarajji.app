// Exécuté automatiquement après `npm run build` (hook npm "postbuild").
//
// GitHub Pages ne sait pas réécrire les URLs d'une SPA : une URL profonde
// (ex. /panel-xxx/login) renvoie sa page 404.html. En copiant index.html en
// 404.html, c'est l'application Angular qui se charge et le router affiche la
// bonne route. .nojekyll désactive le traitement Jekyll de GitHub Pages.
// Sans effet sur Vercel, qui utilise les rewrites de vercel.json.
import { copyFileSync, writeFileSync } from 'node:fs';

const out = 'dist/mouhyi-portfolio/browser';
copyFileSync(`${out}/index.html`, `${out}/404.html`);
writeFileSync(`${out}/.nojekyll`, '');
console.log(`postbuild : ${out}/404.html et .nojekyll générés.`);
