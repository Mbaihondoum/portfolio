/**
 * Seeds the database with placeholder content.
 * Every project is flagged `isSample` and titled "[EXEMPLE]"; every personal
 * fact is marked "[À REMPLACER]". Replace them from /admin.
 *
 * Usage: pnpm db:seed            (only seeds empty tables)
 *        pnpm db:seed --reset    (wipes content tables first)
 */
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import type { ProjectInput } from '@/lib/validators'
import { DEFAULT_SETTINGS } from '@/server/services/defaults'

config({ path: ['.env.local', '.env'], quiet: true })

type SeedProject = Omit<ProjectInput, 'status' | 'featured' | 'isSample'> & { featured?: boolean }

const L = (fr: string, en: string) => ({ fr, en })

export const sampleProjects: SeedProject[] = [
  {
    slug: 'plateforme-gestion-ong',
    category: 'fullstack',
    featured: true,
    title: L(
      '[EXEMPLE] Plateforme de gestion de programmes',
      '[SAMPLE] Programme management platform',
    ),
    summary: L(
      'Application web pour suivre bénéficiaires, activités et indicateurs d’une ONG, avec rapports automatiques.',
      'Web application to track an NGO’s beneficiaries, activities and indicators, with automated reports.',
    ),
    problem: L(
      'Les équipes suivaient leurs activités dans des dizaines de fichiers Excel. Les rapports aux bailleurs prenaient plusieurs jours et les chiffres divergeaient d’un fichier à l’autre.',
      'Teams tracked their activities in dozens of Excel files. Donor reports took days and figures differed from one file to another.',
    ),
    solution: L(
      'Une application centralisée : saisie par rôle, validations, tableau de bord temps réel et export des rapports au format attendu par les bailleurs.',
      'A centralised application: role-based data entry, validations, a real-time dashboard and report export in the format donors expect.',
    ),
    role: L(
      'Analyse du besoin, modélisation des données, développement full stack, déploiement et formation des utilisateurs.',
      'Requirements analysis, data modelling, full stack development, deployment and user training.',
    ),
    description: L(
      'Projet fictif servant d’exemple. **Remplacez-le** depuis l’admin par un projet réel : contexte, contraintes, choix techniques et enseignements.',
      'Fictional example project. **Replace it** from the admin with a real project: context, constraints, technical choices and lessons learned.',
    ),
    stack: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'Docker'],
    coverImage: '/samples/ngo-platform-cover.svg',
    coverAlt: L(
      'Capture fictive du tableau de bord de la plateforme',
      'Fictional screenshot of the platform dashboard',
    ),
    demoUrl: null,
    repoUrl: null,
    powerBiEmbedUrl: null,
    architecture: {
      nodes: [
        { id: 'web', label: 'Next.js (web)', layer: 'client' },
        { id: 'api', label: 'API REST', layer: 'api' },
        { id: 'auth', label: 'Auth (RBAC)', layer: 'api' },
        { id: 'db', label: 'PostgreSQL', layer: 'data' },
        { id: 'files', label: 'Stockage S3', layer: 'data' },
        { id: 'ci', label: 'CI/CD Docker', layer: 'infra' },
      ],
      edges: [
        { from: 'web', to: 'api', label: 'HTTPS' },
        { from: 'api', to: 'auth' },
        { from: 'api', to: 'db', label: 'SQL' },
        { from: 'api', to: 'files' },
        { from: 'ci', to: 'api', label: 'deploy' },
      ],
    },
    charts: [
      {
        id: 'reporting-time',
        type: 'bar',
        title: L(
          'Temps de production d’un rapport (heures, fictif)',
          'Time to produce a report (hours, fictional)',
        ),
        unit: 'h',
        labels: ['T1', 'T2', 'T3', 'T4'],
        values: [32, 18, 6, 2],
      },
    ],
    metrics: [
      {
        value: 90,
        prefix: '-',
        suffix: '%',
        label: L('temps de reporting (fictif)', 'reporting time (fictional)'),
      },
      {
        value: 4,
        prefix: '',
        suffix: '',
        label: L('pays utilisateurs (fictif)', 'countries using it (fictional)'),
      },
      {
        value: 120,
        prefix: '',
        suffix: '+',
        label: L('utilisateurs actifs (fictif)', 'active users (fictional)'),
      },
    ],
    images: [
      {
        url: '/samples/ngo-platform-dashboard.svg',
        alt: L(
          'Tableau de bord fictif de suivi des programmes',
          'Fictional programme tracking dashboard',
        ),
        kind: 'dashboard',
        width: 1600,
        height: 1000,
      },
    ],
  },
  {
    slug: 'app-mobile-collecte-terrain',
    category: 'mobile',
    title: L(
      '[EXEMPLE] Application mobile de collecte terrain',
      '[SAMPLE] Offline field data collection app',
    ),
    summary: L(
      'App mobile hors ligne pour collecter des formulaires sur le terrain et les synchroniser dès que le réseau revient.',
      'Offline-first mobile app to collect forms in the field and sync them as soon as the network is back.',
    ),
    problem: L(
      'Les agents de terrain travaillaient sans connexion et ressaisissaient les fiches papier au bureau, avec des erreurs et des retards.',
      'Field agents worked without connectivity and re-typed paper forms back at the office, causing errors and delays.',
    ),
    solution: L(
      'Une application mobile avec stockage local, file de synchronisation, validation à la saisie et géolocalisation.',
      'A mobile app with local storage, a sync queue, validation at entry time and geolocation.',
    ),
    role: L(
      'Conception UX, développement mobile et API de synchronisation.',
      'UX design, mobile development and sync API.',
    ),
    description: L(
      'Projet fictif servant d’exemple. Remplacez-le depuis l’admin.',
      'Fictional example project. Replace it from the admin.',
    ),
    stack: ['Flutter', 'Dart', 'SQLite', 'Node.js', 'PostgreSQL'],
    coverImage: '/samples/field-app-cover.svg',
    coverAlt: L('Maquette fictive de l’application mobile', 'Fictional mockup of the mobile app'),
    demoUrl: null,
    repoUrl: null,
    powerBiEmbedUrl: null,
    architecture: {
      nodes: [
        { id: 'app', label: 'App Flutter', layer: 'client' },
        { id: 'local', label: 'SQLite local', layer: 'client' },
        { id: 'sync', label: 'API de sync', layer: 'api' },
        { id: 'db', label: 'PostgreSQL', layer: 'data' },
      ],
      edges: [
        { from: 'app', to: 'local' },
        { from: 'app', to: 'sync', label: 'batch' },
        { from: 'sync', to: 'db' },
      ],
    },
    charts: [],
    metrics: [
      {
        value: 0,
        prefix: '',
        suffix: '',
        label: L('[À REMPLACER] formulaires / mois', '[TO REPLACE] forms / month'),
      },
      { value: 100, prefix: '', suffix: '%', label: L('utilisable hors ligne', 'usable offline') },
    ],
    images: [],
  },
  {
    slug: 'dashboard-power-bi-ventes',
    category: 'data',
    featured: true,
    title: L('[EXEMPLE] Dashboard Power BI des ventes', '[SAMPLE] Power BI sales dashboard'),
    summary: L(
      'Modèle de données et rapports Power BI pour piloter les ventes par région, produit et période.',
      'Data model and Power BI reports to steer sales by region, product and period.',
    ),
    problem: L(
      'La direction recevait des exports Excel hebdomadaires difficiles à comparer et sans vision consolidée.',
      'Management received weekly Excel exports that were hard to compare and lacked a consolidated view.',
    ),
    solution: L(
      'Un modèle en étoile alimenté automatiquement, des mesures DAX documentées et trois pages de rapport orientées décision.',
      'An automatically refreshed star schema, documented DAX measures and three decision-oriented report pages.',
    ),
    role: L(
      'Modélisation, Power Query, DAX, design des rapports.',
      'Modelling, Power Query, DAX, report design.',
    ),
    description: L(
      'Projet fictif. Ajoutez vos captures de dashboards et, si possible, le lien « Publier sur le web » de Power BI.',
      'Fictional project. Add your dashboard screenshots and, if possible, the Power BI “Publish to web” link.',
    ),
    stack: ['Power BI', 'DAX', 'Power Query', 'Excel', 'SQL Server'],
    coverImage: '/samples/sales-dashboard-cover.svg',
    coverAlt: L('Dashboard fictif des ventes', 'Fictional sales dashboard'),
    demoUrl: null,
    repoUrl: null,
    powerBiEmbedUrl: null,
    architecture: {
      nodes: [
        { id: 'erp', label: 'ERP / CRM', layer: 'external' },
        { id: 'pq', label: 'Power Query', layer: 'api' },
        { id: 'model', label: 'Modèle en étoile', layer: 'data' },
        { id: 'report', label: 'Rapports Power BI', layer: 'client' },
      ],
      edges: [
        { from: 'erp', to: 'pq', label: 'ETL' },
        { from: 'pq', to: 'model' },
        { from: 'model', to: 'report', label: 'DAX' },
      ],
    },
    charts: [
      {
        id: 'revenue',
        type: 'line',
        title: L('Chiffre d’affaires mensuel (k€, fictif)', 'Monthly revenue (k€, fictional)'),
        unit: 'k€',
        labels: [
          'Jan',
          'Fév',
          'Mar',
          'Avr',
          'Mai',
          'Juin',
          'Juil',
          'Août',
          'Sep',
          'Oct',
          'Nov',
          'Déc',
        ],
        values: [42, 45, 51, 48, 56, 61, 58, 54, 66, 72, 78, 85],
      },
      {
        id: 'regions',
        type: 'bar',
        title: L('Ventes par région (k€, fictif)', 'Sales by region (k€, fictional)'),
        unit: 'k€',
        labels: ['Nord', 'Sud', 'Est', 'Ouest', 'Centre'],
        values: [180, 140, 95, 120, 70],
      },
    ],
    metrics: [
      {
        value: 3,
        prefix: '',
        suffix: ' j',
        label: L('gagnés par semaine (fictif)', 'saved per week (fictional)'),
      },
      {
        value: 12,
        prefix: '',
        suffix: '',
        label: L('indicateurs suivis (fictif)', 'KPIs tracked (fictional)'),
      },
    ],
    images: [
      {
        url: '/samples/sales-dashboard-2.svg',
        alt: L('Page d’analyse régionale fictive', 'Fictional regional analysis page'),
        kind: 'dashboard',
        width: 1600,
        height: 1000,
      },
    ],
  },
  {
    slug: 'analyse-enquete-r',
    category: 'data',
    title: L(
      '[EXEMPLE] Analyse statistique d’enquête avec R',
      '[SAMPLE] Survey statistical analysis with R',
    ),
    summary: L(
      'Nettoyage, analyse et visualisation d’une enquête de satisfaction avec R, livrées en rapport reproductible.',
      'Cleaning, analysis and visualisation of a satisfaction survey with R, delivered as a reproducible report.',
    ),
    problem: L(
      'Des données d’enquête brutes, incomplètes et codées différemment selon les vagues de collecte.',
      'Raw, incomplete survey data coded differently across collection waves.',
    ),
    solution: L(
      'Un pipeline R (tidyverse) documenté, des modèles de régression et un rapport R Markdown régénérable en un clic.',
      'A documented R (tidyverse) pipeline, regression models and an R Markdown report regenerated in one click.',
    ),
    role: L(
      'Analyse statistique, visualisation, rédaction du rapport.',
      'Statistical analysis, visualisation, report writing.',
    ),
    description: L(
      'Projet fictif. Remplacez-le depuis l’admin.',
      'Fictional project. Replace it from the admin.',
    ),
    stack: ['R', 'tidyverse', 'ggplot2', 'R Markdown', 'Excel'],
    coverImage: '/samples/survey-analysis-cover.svg',
    coverAlt: L(
      'Graphique de régression fictif réalisé avec R',
      'Fictional regression chart made with R',
    ),
    demoUrl: null,
    repoUrl: null,
    powerBiEmbedUrl: null,
    architecture: null,
    charts: [
      {
        id: 'satisfaction',
        type: 'bar',
        title: L(
          'Score de satisfaction par vague (fictif)',
          'Satisfaction score by wave (fictional)',
        ),
        labels: ['V1', 'V2', 'V3', 'V4'],
        values: [61, 66, 72, 79],
      },
    ],
    metrics: [
      {
        value: 0,
        prefix: '',
        suffix: '',
        label: L('[À REMPLACER] répondants', '[TO REPLACE] respondents'),
      },
    ],
    images: [
      {
        url: '/samples/survey-analysis-2.svg',
        alt: L('Distribution fictive des réponses', 'Fictional answer distribution'),
        kind: 'chart',
        width: 1600,
        height: 1000,
      },
    ],
  },
  {
    slug: 'api-commandes-paiements',
    category: 'web',
    title: L('[EXEMPLE] API de commandes et back-office', '[SAMPLE] Orders API and back-office'),
    summary: L(
      'API REST documentée (OpenAPI) et back-office pour gérer commandes, paiements et remboursements.',
      'Documented REST API (OpenAPI) and back-office to manage orders, payments and refunds.',
    ),
    problem: L(
      'Un site e-commerce dont la logique métier était dispersée entre plugins, sans traçabilité des paiements.',
      'An e-commerce site whose business logic was spread across plugins, with no payment traceability.',
    ),
    solution: L(
      'Une API en couches avec webhooks idempotents, journalisation structurée et un back-office pour le support.',
      'A layered API with idempotent webhooks, structured logging and a back-office for support staff.',
    ),
    role: L(
      'Architecture back-end, API, tests et back-office.',
      'Back-end architecture, API, tests and back-office.',
    ),
    description: L(
      'Projet fictif. Remplacez-le depuis l’admin.',
      'Fictional project. Replace it from the admin.',
    ),
    stack: ['Laravel', 'PHP', 'MySQL', 'React', 'OpenAPI', 'Redis'],
    coverImage: '/samples/payments-api-cover.svg',
    coverAlt: L('Logs et documentation fictifs de l’API', 'Fictional API logs and documentation'),
    demoUrl: null,
    repoUrl: null,
    powerBiEmbedUrl: null,
    architecture: {
      nodes: [
        { id: 'shop', label: 'Site e-commerce', layer: 'client' },
        { id: 'bo', label: 'Back-office React', layer: 'client' },
        { id: 'api', label: 'API Laravel', layer: 'api' },
        { id: 'queue', label: 'Queue Redis', layer: 'infra' },
        { id: 'db', label: 'MySQL', layer: 'data' },
        { id: 'psp', label: 'Prestataire paiement', layer: 'external' },
      ],
      edges: [
        { from: 'shop', to: 'api' },
        { from: 'bo', to: 'api' },
        { from: 'api', to: 'db' },
        { from: 'api', to: 'queue', label: 'jobs' },
        { from: 'psp', to: 'api', label: 'webhooks' },
      ],
    },
    charts: [],
    metrics: [
      {
        value: 99,
        prefix: '',
        suffix: '%',
        label: L('couverture des cas critiques (fictif)', 'critical paths covered (fictional)'),
      },
    ],
    images: [
      {
        url: '/samples/payments-api-admin.svg',
        alt: L('Back-office fictif', 'Fictional back-office'),
        kind: 'screenshot',
        width: 1600,
        height: 1000,
      },
    ],
  },
]

export const sampleSkills: {
  name: string
  category: schema.Skill['category']
  inMarquee?: boolean
}[] = [
  ...['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'HTML / CSS', 'Accessibilité (WCAG)'].map(
    (name) => ({
      name,
      category: 'frontend' as const,
      inMarquee: ['React', 'Next.js', 'TypeScript'].includes(name),
    }),
  ),
  ...['Node.js', 'Laravel', 'REST / OpenAPI', 'PostgreSQL', 'MySQL', 'Prisma / Drizzle'].map(
    (name) => ({
      name,
      category: 'backend_db' as const,
      inMarquee: ['Node.js', 'Laravel', 'PostgreSQL'].includes(name),
    }),
  ),
  ...['Flutter', 'React Native', 'PWA'].map((name) => ({
    name,
    category: 'mobile' as const,
    inMarquee: name !== 'PWA',
  })),
  ...[
    'Power BI',
    'DAX / Power Query',
    'Excel avancé',
    'R (tidyverse, ggplot2)',
    'SQL analytique',
  ].map((name) => ({
    name,
    category: 'data_bi' as const,
    inMarquee: ['Power BI', 'Excel avancé', 'R (tidyverse, ggplot2)'].includes(name),
  })),
  ...['Git / GitHub', 'Docker', 'CI/CD (GitHub Actions)', 'Vercel', 'Linux', 'Figma'].map(
    (name) => ({
      name,
      category: 'tools_devops' as const,
      inMarquee: ['Docker', 'Git / GitHub'].includes(name),
    }),
  ),
]

export const sampleExperiences: (typeof schema.experiences.$inferInsert)[] = [
  {
    type: 'work',
    title: L('[À REMPLACER] Développeur Full Stack', '[TO REPLACE] Full Stack Developer'),
    organization: '[À REMPLACER] Entreprise',
    location: '[Ville]',
    startDate: '2023-01-01',
    endDate: null,
    description: L(
      'Décrivez vos missions, les technologies utilisées et un résultat mesurable.',
      'Describe your responsibilities, the technologies used and one measurable result.',
    ),
    position: 0,
  },
  {
    type: 'work',
    title: L(
      '[À REMPLACER] Data Analyst / Développeur BI',
      '[TO REPLACE] Data Analyst / BI Developer',
    ),
    organization: '[À REMPLACER] Organisation',
    location: '[Ville]',
    startDate: '2021-06-01',
    endDate: '2022-12-31',
    description: L(
      'Dashboards Power BI, automatisation Excel, analyses R.',
      'Power BI dashboards, Excel automation, R analyses.',
    ),
    position: 1,
  },
  {
    type: 'education',
    title: L(
      '[À REMPLACER] Diplôme d’ingénieur en informatique',
      '[TO REPLACE] Computer engineering degree',
    ),
    organization: '[À REMPLACER] École / Université',
    location: '[Ville]',
    startDate: '2016-09-01',
    endDate: '2021-06-30',
    description: L(
      'Spécialité, projet de fin d’études, mention.',
      'Major, final-year project, honours.',
    ),
    position: 2,
  },
  {
    type: 'education',
    title: L('[À REMPLACER] Certification', '[TO REPLACE] Certification'),
    organization: '[À REMPLACER] Organisme',
    location: 'En ligne',
    startDate: '2022-03-01',
    endDate: '2022-05-01',
    description: L(
      'Ex. Microsoft PL-300 (Power BI Data Analyst).',
      'E.g. Microsoft PL-300 (Power BI Data Analyst).',
    ),
    position: 3,
  },
]

export async function seed(
  database: ReturnType<typeof drizzle<typeof schema>>,
  opts: { reset?: boolean } = {},
) {
  const s = schema
  if (opts.reset) {
    await database.delete(s.projects)
    await database.delete(s.skills)
    await database.delete(s.experiences)
    await database.delete(s.siteSettings)
  }

  const existingSettings = await database
    .select({ id: s.siteSettings.id })
    .from(s.siteSettings)
    .limit(1)
  if (!existingSettings.length) {
    const { updatedAt: _ignored, ...settings } = DEFAULT_SETTINGS
    void _ignored
    await database.insert(s.siteSettings).values(settings)
  }

  const existingProjects = await database.select({ id: s.projects.id }).from(s.projects).limit(1)
  if (!existingProjects.length) {
    for (const [position, p] of sampleProjects.entries()) {
      const { metrics, images, featured, ...fields } = p
      const [row] = await database
        .insert(s.projects)
        .values({
          ...fields,
          featured: featured ?? false,
          isSample: true,
          status: 'published',
          publishedAt: new Date(),
          position,
        })
        .returning({ id: s.projects.id })
      if (metrics.length) {
        await database
          .insert(s.projectMetrics)
          .values(metrics.map((m, i) => ({ ...m, projectId: row!.id, position: i })))
      }
      if (images.length) {
        await database
          .insert(s.projectImages)
          .values(images.map((img, i) => ({ ...img, projectId: row!.id, position: i })))
      }
    }
  }

  const existingSkills = await database.select({ id: s.skills.id }).from(s.skills).limit(1)
  if (!existingSkills.length) {
    const counters = new Map<string, number>()
    await database.insert(s.skills).values(
      sampleSkills.map((sk) => {
        const position = counters.get(sk.category) ?? 0
        counters.set(sk.category, position + 1)
        return { ...sk, inMarquee: sk.inMarquee ?? false, position }
      }),
    )
  }

  const existingExperiences = await database
    .select({ id: s.experiences.id })
    .from(s.experiences)
    .limit(1)
  if (!existingExperiences.length) {
    await database.insert(s.experiences).values(sampleExperiences)
  }
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  const client = postgres(url, { max: 1, prepare: false })
  await seed(drizzle(client, { schema, casing: 'snake_case' }), {
    reset: process.argv.includes('--reset'),
  })
  await client.end()
  console.log('✓ Seed complete')
}

if (process.argv[1]?.endsWith('seed.ts')) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
