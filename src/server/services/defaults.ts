import type { SiteSettings } from '@/server/db/schema'

/** Used until the admin saves real settings (and as seed data). */
export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  fullName: '[À REMPLACER] Prénom Nom',
  initials: 'PN',
  headline: {
    fr: 'Développeur Full Stack & Data Developer',
    en: 'Full Stack Developer & Data Developer',
  },
  tagline: {
    fr: 'Je conçois des applications web et mobiles de bout en bout, et je transforme les données en décisions.',
    en: 'I build web and mobile applications end to end, and turn data into decisions.',
  },
  bio: {
    fr: "[À REMPLACER] Ingénieur informaticien, je conçois des solutions numériques complètes : de l'analyse du besoin au déploiement. Mon double profil développement + data me permet de livrer des applications utiles et de mesurer leur impact.",
    en: '[TO REPLACE] As a software engineer, I design complete digital solutions: from requirements analysis to deployment. My dual development + data profile lets me ship useful applications and measure their impact.',
  },
  approach: {
    fr: "Comprendre le besoin avant d'écrire du code. Livrer par petites itérations testées. Documenter pour que l'équipe puisse reprendre. Mesurer les résultats avec des données, pas des impressions.",
    en: 'Understand the need before writing code. Ship small, tested iterations. Document so the team can take over. Measure results with data, not impressions.',
  },
  location: '[À REMPLACER] Ville, Pays',
  availability: {
    fr: '[À REMPLACER] Disponible en freelance et pour des missions à distance',
    en: '[TO REPLACE] Available for freelance and remote work',
  },
  email: 'contact@example.com',
  githubUrl: 'https://github.com/',
  linkedinUrl: 'https://www.linkedin.com/',
  whatsapp: null,
  cvUrlFr: null,
  cvUrlEn: null,
  keyFigures: [
    {
      value: 0,
      suffix: '+',
      label: { fr: '[À REMPLACER] projets livrés', en: '[TO REPLACE] projects shipped' },
    },
    {
      value: 0,
      suffix: '',
      label: { fr: "[À REMPLACER] années d'expérience", en: '[TO REPLACE] years of experience' },
    },
    {
      value: 0,
      suffix: '',
      label: {
        fr: '[À REMPLACER] dashboards en production',
        en: '[TO REPLACE] dashboards in production',
      },
    },
  ],
  updatedAt: new Date(0),
}
