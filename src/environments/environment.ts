/**
 * Configuration Firebase du projet (console Firebase > Paramètres du projet >
 * Vos applications > Application Web > Configuration du SDK).
 *
 * Ces valeurs ne sont PAS des secrets : elles identifient le projet et
 * finissent de toute façon en clair dans le bundle JavaScript servi au
 * navigateur. Ce qui protège les données, ce sont les règles Firestore
 * (firestore.rules) et Firebase Authentication. Ce fichier peut donc être
 * versionné sans risque.
 */
export const environment = {
  firebase: {
    apiKey: "AIzaSyApj_K5PeqgEON0NNtloBACygDshs0CvqY",
    authDomain: "mouhyi-mt-portfolio.firebaseapp.com",
    projectId: "mouhyi-mt-portfolio",
    storageBucket: "mouhyi-mt-portfolio.firebasestorage.app",
    messagingSenderId: "525078147441",
    appId: "1:525078147441:web:61dc4c3f3ea9fe549ac6d0"
  },
};
