import { Injectable, inject, signal } from '@angular/core';
import { CONTACT } from '../core/contact';
import { I18nService } from '../core/i18n.service';
import { PortfolioDataService } from '../core/portfolio-data.service';
import { profileText } from '../core/profile-defaults';
import { Lang } from '../models/portfolio.models';
import { CvContent } from './cv-content';

/** Le CV PDF est toujours généré en français, quelle que soit la langue affichée sur le site. */
const CV_LANG: Lang = 'fr';

/** Délai maximal d'attente de Firestore avant de générer avec les données déjà chargées. */
const FRESH_DATA_TIMEOUT_MS = 3000;

/**
 * Génère le CV en PDF côté navigateur, à partir des données Firestore.
 * pdfmake (~1 Mo avec ses polices) n'est chargé qu'au premier clic : aucun
 * impact sur le chargement du site.
 */
@Injectable({ providedIn: 'root' })
export class CvPdfService {
  private readonly data = inject(PortfolioDataService);
  private readonly i18n = inject(I18nService);

  readonly busy = signal(false);
  /** Clé i18n du message d'erreur affiché sous le bouton, ou null. */
  readonly error = signal<string | null>(null);

  /**
   * Ouvre le CV dans un nouvel onglet (visionneuse PDF du navigateur), d'où le
   * visiteur choisit lui-même de l'enregistrer ou de l'imprimer.
   */
  async open(): Promise<void> {
    if (this.busy()) return;
    // L'onglet est ouvert tout de suite, pendant le clic : ouvert après les `await`
    // ci-dessous, il serait pris pour une popup et bloqué (Safari, Firefox).
    const tab = window.open('', '_blank');
    if (!tab) {
      this.error.set('cv.blocked');
      return;
    }
    tab.opener = null;
    this.showPlaceholder(tab);
    this.busy.set(true);
    this.error.set(null);
    try {
      // Données relues au moment du clic ; si Firestore tarde, on génère avec celles déjà affichées.
      await Promise.race([this.data.reload(), new Promise((r) => setTimeout(r, FRESH_DATA_TIMEOUT_MS))]);
      const content = this.buildContent();
      const [{ default: pdfMake }, { default: vfs }, { buildCvDocument }] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts'),
        import('./cv-document'),
      ]);
      pdfMake.addVirtualFileSystem(vfs);
      await pdfMake.createPdf(buildCvDocument(content)).open(tab);
    } catch (err) {
      console.error('[CvPdfService]', err);
      tab.close();
      this.error.set('cv.error');
    } finally {
      this.busy.set(false);
    }
  }

  /** Message d'attente dans l'onglet encore vide, le temps de générer le PDF. */
  private showPlaceholder(tab: Window): void {
    try {
      tab.document.title = `CV — ${CONTACT.name}`;
      tab.document.body.style.cssText = 'font:16px system-ui,sans-serif;color:#555;display:grid;place-items:center;min-height:90vh;margin:0';
      tab.document.body.textContent = this.i18n.t('cv.generating');
    } catch {
      /* onglet inaccessible : sans conséquence, le PDF le remplacera */
    }
  }

  /** Assemble le contenu du CV, en français et déjà formaté, depuis les signals du site. */
  private buildContent(): CvContent {
    const lang = CV_LANG;
    const t = (key: string, vars?: Record<string, string | number>) => this.i18n.t(key, vars, lang);
    const pick = (fr: string, en: string) => this.i18n.pick(fr, en, lang);
    const years = this.data.yearsOfExperience();
    const available = this.data.availableFrom();
    const profile = this.data.profile();
    const groups = [...this.data.skillGroups()].sort((a, b) => a.order - b.order);
    const languages = groups.find((g) => g.id === 'languages');

    return {
      name: CONTACT.name,
      title: t('hero.title'),
      location: CONTACT.location,
      email: CONTACT.email,
      linkedinUrl: CONTACT.linkedinUrl,
      linkedinLabel: CONTACT.linkedinLabel,
      siteUrl: CONTACT.siteUrl,
      siteLabel: CONTACT.siteLabel,
      yearsLabel: years === null ? null : t('hero.years', { years }),
      availability: available ? t('hero.available', { date: this.i18n.day(available, lang) }) : null,
      profile: [profileText(profile, 'aboutP1', lang, years), profileText(profile, 'aboutP2', lang, years)],
      skills: groups
        .filter((g) => g !== languages)
        .map((g) => ({ name: pick(g.nameFr, g.nameEn), items: g.skills.map((s) => pick(s.fr, s.en)) })),
      languages: languages
        ? { name: pick(languages.nameFr, languages.nameEn), items: languages.skills.map((s) => pick(s.fr, s.en)) }
        : null,
      experiences: [...this.data.experiences()]
        .sort((a, b) => b.order - a.order)
        .map((e) => ({
          company: e.company,
          role: pick(e.roleFr, e.roleEn),
          location: e.location,
          period: this.i18n.period(e.start, e.end, e.period, true, lang),
          context: pick(e.contextFr, e.contextEn),
          bullets: e.bulletsFr,
          tags: e.tags,
        })),
      education: [...this.data.education()]
        .sort((a, b) => b.order - a.order)
        .map((d) => ({ title: pick(d.titleFr, d.titleEn), school: d.school, date: this.i18n.month(d.date, lang) })),
      agencies: [...this.data.agencies()]
        .sort((a, b) => b.order - a.order)
        .map((a) => ({ name: a.name, role: pick(a.roleFr, a.roleEn), period: this.i18n.period(a.start, a.end, a.date, false, lang) })),
      labels: {
        profile: t('about.title'),
        skills: t('skills.title'),
        experience: t('exp.title'),
        education: t('edu.title'),
        agencies: t('agency.title'),
        techStack: t('cv.techStack'),
      },
    };
  }
}
