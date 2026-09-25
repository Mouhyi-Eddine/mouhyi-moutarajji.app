/**
 * Contenu du CV déjà résolu (en français) : dates formatées, textes du profil
 * interpolés. Le document PDF ne fait que de la mise en page à partir de cet
 * objet (aucune dépendance Angular ni Firestore).
 */
export interface CvContent {
  name: string;
  title: string;
  location: string;
  email: string;
  linkedinUrl: string;
  linkedinLabel: string;
  siteUrl: string;
  siteLabel: string;
  yearsLabel: string | null;
  profile: string[];
  skills: { name: string; items: string[] }[];
  languages: { name: string; items: string[] } | null;
  experiences: {
    company: string;
    role: string;
    location: string;
    period: string; // « 02/2026 – 08/2026 · 7 mois »
    context: string;
    bullets: string[];
    tags: string[];
  }[];
  education: { title: string; school: string; date: string }[];
  agencies: { name: string; role: string; period: string }[];
  labels: {
    profile: string;
    skills: string;
    experience: string;
    education: string;
    agencies: string;
    techStack: string;
  };
}
