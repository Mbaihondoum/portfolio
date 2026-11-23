/** Cache tags shared by cached reads and admin mutations (single source of truth). */
export const TAGS = {
  projects: 'projects',
  project: (slug: string) => `project:${slug}`,
  skills: 'skills',
  experiences: 'experiences',
  settings: 'settings',
} as const
