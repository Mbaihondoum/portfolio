# Ce qu'il faut remplacer

Aucun fait vous concernant n'a été inventé : tout ce qui est personnel est marqué `[À REMPLACER]` (FR) / `[TO REPLACE]` (EN), et les projets d'exemple sont marqués `[EXEMPLE]` / `[SAMPLE]` avec un badge « Exemple » sur le site.

## Depuis l'admin (aucun code à toucher)

| Où                   | Quoi                                                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/admin/settings`    | Nom complet, initiales (intro animée + logo), titre, accroche, parcours, façon de travailler, disponibilité, ville/pays, email public, GitHub, LinkedIn, WhatsApp (optionnel), chiffres clés, CV FR/EN |
| `/admin/projects`    | Supprimer les 5 projets « Exemple » et créer vos projets (voir README §5)                                                                                                                              |
| `/admin/experiences` | Remplacer les 4 entrées fictives (2 expériences, diplôme, certification)                                                                                                                               |
| `/admin/skills`      | Ajuster la liste (ajout, suppression, ordre, présence dans le bandeau défilant)                                                                                                                        |

## Dans le code (optionnel)

| Fichier                                      | Quoi                                                                                                                                     |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/i18n/dictionaries/fr.ts` et `en.ts`     | Textes de l'interface : valeurs « Ce que j'apporte », services, délai de réponse (« sous 48 h »), points de la section « Sous le capot » |
| `src/components/sections/under-the-hood.tsx` | Liste des technologies affichée (si vous changez la stack)                                                                               |
| `src/app/icon.svg`                           | Favicon (monogramme générique)                                                                                                           |
| `src/server/services/defaults.ts`            | Valeurs par défaut utilisées avant la première sauvegarde des paramètres                                                                 |
| `public/samples/`                            | Visuels d'exemple (à supprimer quand vos projets sont en ligne)                                                                          |

## Comptes et clés (variables d'environnement)

| Service                          | Variables                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------ |
| Supabase                         | `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET` |
| GitHub OAuth                     | `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_EMAILS`                         |
| Auth.js                          | `AUTH_SECRET`                                                                  |
| Resend                           | `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`                     |
| Cloudflare Turnstile (optionnel) | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`                       |
| Divers                           | `NEXT_PUBLIC_SITE_URL`, `IP_HASH_SECRET`                                       |
