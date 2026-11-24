# Portfolio — Développeur Full Stack & Data

Portfolio bilingue (FR/EN) qui est lui-même une application full stack : site public animé, API publique documentée, espace d'administration protégé, statistiques de visite anonymes, tests automatisés et CI/CD.

> **Avant la mise en ligne**, remplacez tout ce qui est marqué `[À REMPLACER]` et les projets `[EXEMPLE]` : voir [`docs/a-remplacer.md`](docs/a-remplacer.md).

|         |                                                                                                |
| ------- | ---------------------------------------------------------------------------------------------- |
| Front   | Next.js 16 (App Router, Cache Components), React 19, TypeScript strict, Tailwind CSS v4        |
| Motion  | GSAP + ScrollTrigger (chargés à la demande), Motion (Framer), Lenis, CSS View Transitions      |
| Back    | Route Handlers + Server Actions, Zod, Auth.js v5 (GitHub OAuth), Resend                        |
| Données | PostgreSQL (Supabase en prod), Drizzle ORM (migrations versionnées), Supabase Storage          |
| Qualité | Vitest (unitaires + intégration sur Postgres), Playwright (E2E + axe), ESLint, Prettier, Husky |
| DevOps  | GitHub Actions (lint, types, tests, E2E, build Docker), Vercel, Dockerfile + docker-compose    |

Documentation technique : [architecture](docs/architecture.md) · [modèle de données](docs/data-model.md) · [checklist de mise en ligne](docs/checklist-mise-en-ligne.md).

---

## Sommaire

1. [Démarrage rapide](#1-démarrage-rapide)
2. [Variables d'environnement](#2-variables-denvironnement)
3. [Base de données : migrations et seed](#3-base-de-données--migrations-et-seed)
4. [Scripts](#4-scripts)
5. [Ajouter un projet via l'admin](#5-ajouter-un-projet-via-ladmin)
6. [Déploiement (Vercel + Supabase)](#6-déploiement-vercel--supabase)
7. [Structure du code](#7-structure-du-code)
8. [Choix techniques](#8-choix-techniques)
9. [Tests et qualité](#9-tests-et-qualité)

---

## 1. Démarrage rapide

Prérequis : Node.js 22, pnpm 10, PostgreSQL 16 (ou Docker).

```bash
pnpm install
```

```bash
cp .env.example .env.local
```

Lancez PostgreSQL (au choix) :

```bash
docker compose up -d db
```

Puis créez le schéma et les données d'exemple :

```bash
pnpm db:migrate
```

```bash
pnpm db:seed
```

```bash
pnpm dev
```

Le site est sur <http://localhost:3000> (redirige vers `/fr` ou `/en` selon le navigateur) et l'admin sur <http://localhost:3000/admin>.

### Voir le portfolio en local (Docker, rien d'autre à installer)

1. Installez et **démarrez Docker Desktop** ([Windows / macOS](https://www.docker.com/products/docker-desktop/)).
2. Récupérez le code (ou « Code → Download ZIP » sur GitHub, puis dézippez) :

```bash
git clone https://github.com/Mbaihondoum/portfolio.git
```

```bash
cd portfolio
```

3. Lancez tout (base de données, migrations, données d'exemple, site) — premier lancement : quelques minutes :

```bash
docker compose up --build
```

4. Ouvrez **<http://localhost:3000>** quand le terminal affiche `[warmup] … refreshed with live data`.

- **Arrêter** : `Ctrl + C` dans le terminal (ou `docker compose down`).
- **Relancer** plus tard : `docker compose up` (sans `--build` si le code n'a pas changé).
- **Tout remettre à zéro** (base + fichiers téléversés) : `docker compose down -v`.

**Activer l'admin en local (optionnel)** — sans configuration, `/admin` affiche « Admin non configuré » et le site public fonctionne normalement.

1. GitHub → Settings → Developer settings → OAuth Apps → _New OAuth App_ : Homepage `http://localhost:3000`, callback `http://localhost:3000/api/auth/callback/github`. Notez le _Client ID_ et générez un _Client secret_.
2. À la racine du projet, créez un fichier `.env.local` (il n'est jamais versionné) :

```bash
AUTH_SECRET=une-longue-chaine-aleatoire-de-32-caracteres-minimum
AUTH_GITHUB_ID=votre-client-id
AUTH_GITHUB_SECRET=votre-client-secret
ADMIN_EMAILS=votre-email-github@exemple.com
```

3. `docker compose up` puis <http://localhost:3000/admin>.

**Dépannage**

- _Cannot connect to the Docker daemon_ : Docker Desktop n'est pas démarré.
- _port is already allocated_ (3000 ou 5432) : un autre programme utilise ce port (souvent un PostgreSQL déjà installé pour 5432). Fermez-le, ou changez le port de gauche dans `docker-compose.yml` (ex. `'3001:3000'`, puis ouvrez <http://localhost:3001>).
- _429 Too Many Requests_ au téléchargement des images Docker : limite temporaire de Docker Hub, réessayez quelques minutes plus tard.

Détails techniques : l'image se construit **sans accès à la base** (pages prérendues avec un contenu provisoire) ; au démarrage, `scripts/docker-start.mjs` lance le serveur puis rafraîchit toutes les pages prérendues avec les vraies données avant la première visite. Image ≈ 340 Mo (sortie `standalone`, utilisateur non root, `HEALTHCHECK` sur `/api/health`). Le service `migrate` utilise l'étage `tools` du Dockerfile (pas de second build Next.js).

---

## 2. Variables d'environnement

Toutes sont documentées dans [`.env.example`](.env.example). Aucune valeur secrète n'est versionnée (`.env.test` ne contient que l'URL de la base de test locale).

| Variable                                                         | Obligatoire   | Rôle                                                               |
| ---------------------------------------------------------------- | ------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`                                           | oui (prod)    | URL publique : SEO, sitemap, Open Graph, contrôle d'origine (CSRF) |
| `DATABASE_URL`                                                   | oui           | PostgreSQL. Sur Vercel : _Transaction pooler_ Supabase (port 6543) |
| `AUTH_SECRET`                                                    | oui (admin)   | Chiffrement des sessions. `openssl rand -base64 32`                |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`                          | oui (admin)   | Application OAuth GitHub                                           |
| `ADMIN_EMAILS`                                                   | oui (admin)   | Liste blanche d'emails GitHub autorisés (séparés par des virgules) |
| `RESEND_API_KEY`                                                 | non           | Sans clé, les emails sont écrits dans les logs du serveur          |
| `CONTACT_TO_EMAIL`                                               | conseillé     | Destinataire des notifications du formulaire                       |
| `CONTACT_FROM_EMAIL`                                             | non           | Expéditeur vérifié chez Resend                                     |
| `STORAGE_DRIVER`                                                 | non           | `local` (dossier `./uploads`) ou `supabase`                        |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_BUCKET` | si `supabase` | Stockage des images et CV (clé serveur uniquement)                 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`        | non           | Captcha Cloudflare Turnstile (sinon honeypot + délai + rate limit) |
| `IP_HASH_SECRET`                                                 | oui (prod)    | Sel HMAC pour le rate limiting (aucune IP n'est stockée en clair)  |

Les variables serveur sont validées par Zod au premier accès (`src/server/env.ts`) : une valeur invalide fait échouer le démarrage avec un message explicite.

---

## 3. Base de données : migrations et seed

- Le schéma est dans `src/server/db/schema.ts` (Drizzle).
- Après une modification du schéma :

```bash
pnpm db:generate --name description-du-changement
```

- Appliquer les migrations (local, CI, prod) :

```bash
pnpm db:migrate
```

- Données d'exemple (n'écrase rien si les tables contiennent déjà des données) :

```bash
pnpm db:seed
```

- Repartir de zéro (efface projets, compétences, parcours et paramètres) :

```bash
pnpm db:seed --reset
```

Le seed crée : les paramètres du site (`[À REMPLACER]`), 26 compétences, 4 entrées de parcours fictives et **5 projets d'exemple** (badge « Exemple », visuels SVG générés par `scripts/generate-samples.mjs`, libres de droits).

---

## 4. Scripts

| Commande                    | Effet                                                       |
| --------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                  | Serveur de développement                                    |
| `pnpm build` / `pnpm start` | Build et serveur de production                              |
| `pnpm lint` / `pnpm format` | ESLint (0 warning toléré) / Prettier                        |
| `pnpm typecheck`            | Génère les types de routes puis `tsc --noEmit`              |
| `pnpm test`                 | Vitest : unitaires + intégration (API ↔ PostgreSQL de test) |
| `pnpm test:e2e`             | Playwright sur un build de production (voir §9)             |
| `pnpm check`                | lint + types + tests                                        |
| `pnpm db:*`                 | `generate`, `migrate`, `seed`, `studio`                     |

Un hook pre-commit (Husky + lint-staged) formate et lint les fichiers modifiés.

---

## 5. Ajouter un projet via l'admin

1. Allez sur `/admin` et connectez-vous avec GitHub (le compte doit avoir un email listé dans `ADMIN_EMAILS`).
2. **Projets → Nouveau projet.**
3. **Général** : saisissez le titre, cliquez « Générer » pour le slug (URL), choisissez la catégorie (Web, Mobile, Data/BI, Full stack). Laissez en **Brouillon** pour l'instant.
4. **Textes** : remplissez FR **et** EN — résumé (carte), problème, solution, votre rôle, description détaillée (Markdown simple : `**gras**`, listes `-`, liens `[texte](https://…)`).
5. **Technologies & liens** : stack séparée par des virgules, lien démo, lien code, et pour un projet data le lien Power BI « Publier sur le web » (`https://app.powerbi.com/…`), affiché en iframe chargée au clic.
6. **Visuels** : téléversez la couverture (PNG/JPG/WebP/AVIF, 5 Mo max, format conseillé 1600 × 1000) et sa description alternative, puis ajoutez des captures / dashboards / graphiques R à la galerie.
7. **Résultats chiffrés** : uniquement des chiffres réels (ils s'animent en compteurs).
8. **Schéma d'architecture** (optionnel) : ajoutez des blocs (libellé + couche : client, API & logique, données, infra, externe) et des liens entre eux ; l'aperçu se met à jour en direct. **Graphiques animés** (optionnel, idéal pour les projets data) : type courbe ou barres, titre FR/EN, unité, lignes libellé/valeur, avec aperçu. Un « mode JSON » permet l'import/export.
9. **Enregistrer**, puis « Aperçu (version enregistrée) » : la page s'affiche exactement comme sur le site, en FR ou EN, même en brouillon. Passez ensuite le statut à **Publié** : le site public est mis à jour immédiatement (invalidation du cache par tags).
10. Dans la liste des projets, réordonnez par **glisser-déposer** (poignée ⋮⋮) ou avec les boutons ↑ ↓ (clavier) ; le même système existe pour les compétences et le parcours. « Dépublier » masque un projet ; supprimez les projets « Exemple ».

---

## 6. Déploiement (Vercel + Supabase)

1. **Supabase** : créez un projet. Récupérez la chaîne _Transaction pooler_ (Project Settings → Database) et, dans Project Settings → API, l'URL et la clé `service_role`.
2. Appliquez le schéma depuis votre machine :

```bash
DATABASE_URL="postgres://…:6543/postgres" pnpm db:migrate
```

```bash
DATABASE_URL="postgres://…:6543/postgres" pnpm db:seed
```

3. **GitHub OAuth** : GitHub → Settings → Developer settings → OAuth Apps → _New_. Homepage `https://votre-domaine`, callback `https://votre-domaine/api/auth/callback/github`.
4. **Resend** : ajoutez et vérifiez votre domaine, créez une clé API.
5. **Vercel** : importez le dépôt GitHub, renseignez toutes les variables du §2 (avec `STORAGE_DRIVER=supabase`), déployez. `vercel.json` utilise `scripts/vercel-build.sh` : les migrations en attente sont appliquées automatiquement **uniquement** pour les déploiements de production (`VERCEL_ENV=production`), jamais pour les previews.
6. Ajoutez votre domaine dans Vercel, mettez à jour `NEXT_PUBLIC_SITE_URL` et l'URL de callback GitHub, redéployez.
7. Suivez la [checklist de mise en ligne](docs/checklist-mise-en-ligne.md).

La CI GitHub Actions (`.github/workflows/ci.yml`) exécute à chaque push : format, lint, types, tests unitaires et d'intégration sur PostgreSQL, build, tests E2E Playwright et build de l'image Docker. Vercel déploie automatiquement `main` ; activez dans Vercel l'option qui attend la réussite des checks GitHub avant de promouvoir en production.

---

## 7. Structure du code

```
src/
├─ app/
│  ├─ [locale]/            Site public FR/EN (accueil, projets/[slug], docs/api, 404, erreurs)
│  ├─ admin/               Espace d'administration (layout racine dédié, rendu dynamique)
│  ├─ api/                 Route Handlers : projects, skills, contact, track, health, openapi.json, auth, upload
│  ├─ sitemap.ts, robots.ts, icon.svg, global-not-found.tsx, global-error.tsx
├─ components/
│  ├─ motion/              Système de motion : Reveal, SplitText, Counter, Magnetic, Cursor, ScrollProgress…
│  ├─ sections/            Sections de la page d'accueil
│  ├─ projects/            Grille filtrable, schéma d'architecture, graphiques, galerie, Power BI
│  ├─ charts/              Graphiques SVG accessibles (ligne, barres, classement)
│  ├─ admin/               Formulaires et listes de l'admin
│  ├─ layout/ · ui/        Header, footer, intro, primitives (boutons, champs, badges, icônes)
├─ server/                 Uniquement côté serveur (`server-only`)
│  ├─ db/                  Schéma Drizzle, client, migrations, seed
│  ├─ repositories/        Accès aux données (requêtes paramétrées)
│  ├─ services/            Règles métier : contenu en cache, contact, rate limit, stats, health
│  ├─ actions/             Server Actions de l'admin (auth + Zod + invalidation du cache)
│  ├─ auth.ts · env.ts · logger.ts · security.ts · mail/ · storage/
├─ lib/                    Partagé client/serveur : types, validateurs Zod, OpenAPI, SEO, formatage
├─ i18n/                   Dictionnaires FR/EN typés (l'anglais doit avoir toutes les clés du français)
├─ motion.config.ts        Durées, easings, staggers, springs
└─ proxy.ts                Redirection de langue, garde de l'admin, CSP à nonce
```

Les couches sont strictes : **UI → services → repositories → base**. Les composants n'importent jamais Drizzle ; les Server Actions et Route Handlers ne contiennent pas de SQL.

---

## 8. Choix techniques

- **Back-end intégré à Next.js** : un seul déploiement, mais une séparation nette en couches (voir §7). Plus simple et moins coûteux qu'une API séparée, sans perte de clarté.
- **Cache Components** : les données publiques sont lues via des fonctions `"use cache"` étiquetées (`cacheTag`). Les pages publiques sont prérendues ; chaque modification dans l'admin appelle `updateTag()` et le site se met à jour immédiatement.
- **Rate limiting dans PostgreSQL** (upsert atomique par fenêtre fixe, IP hachée en HMAC) : pas de service Redis supplémentaire.
- **Statistiques maison** : un beacon anonyme (`/api/track`) enregistre chemin, langue, pays (en-tête Vercel), type d'appareil et domaine référent. Ni cookie, ni IP, ni identifiant ; respect de Do Not Track / GPC ; robots ignorés.
- **Graphiques en SVG** sans librairie : une seule hue (bleu clair), lignes 2 px, info-bulles au survol et au clavier, tableau de données pour les lecteurs d'écran.
- **Sécurité** : en-têtes (HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP). CSP stricte à nonce sur l'admin ; sur le site public, prérendu, la CSP autorise les scripts inline de Next.js (un nonce exige un rendu par requête) mais bloque tout le reste (`object-src 'none'`, `frame-ancestors 'none'`, iframes limitées à Power BI/Turnstile). CSRF : contrôle d'origine natif des Server Actions + vérification `Origin` sur les POST publics. Uploads vérifiés par signature binaire (pas de SVG téléversé). Markdown rendu sans HTML brut. JSON-LD échappé.
- **Motion** : les révélations et le texte découpé sont en CSS (transform/opacity), déclenchés par IntersectionObserver ; le contenu reste visible sans JavaScript (filet de sécurité de 3 s) et avec `prefers-reduced-motion`. GSAP/ScrollTrigger ne sont chargés qu'après l'hydratation, uniquement pour les animations liées au scroll. Particules, parallax, curseur et inclinaison 3D sont désactivés sur mobile et appareils modestes. Pas de Three.js ni de Lottie : le fond du hero est un canvas 2D léger et les icônes sont des SVG animés.
- **`partialPrefetching` désactivé** : avec Next.js 16.4, les pages régénérées après une invalidation de cache recevaient à tort `<meta name="robots" content="noindex">` lorsque cette option était active (reproduit par la suite E2E). À réactiver quand le correctif sera publié.

---

## 9. Tests et qualité

- **Vitest** (`tests/unit`) : validateurs Zod, helpers d'analytics, négociation de langue, upload, DTO, mise en page des schémas d'architecture, et tests d'intégration des Route Handlers (contact, rate limit, CSRF, tracking, health) sur une vraie base PostgreSQL `portfolio_test`.
- **Playwright** (`tests/e2e`, desktop + mobile) : navigation, filtres et page projet, changement de langue, 404 ; formulaire de contact jusqu'à l'enregistrement en base ; admin (redirection, refus hors liste blanche, tableau de bord, modification des paramètres visible sur le site, publication) ; audit **axe WCAG 2.1 AA** et rendu en `prefers-reduced-motion`. Les sessions admin de test sont signées dans `global-setup` : aucune route de test n'existe dans l'application.

Lancer les E2E en local (base de test + build de production) :

```bash
export DATABASE_URL=postgres://portfolio:portfolio@localhost:5432/portfolio_test NEXT_PUBLIC_SITE_URL=http://localhost:3100
```

```bash
pnpm db:migrate && pnpm db:seed --reset && pnpm build && pnpm test:e2e
```

Derniers résultats mesurés en local (build de production) : 39 tests unitaires/intégration et 18 tests E2E au vert ; Lighthouse mobile 91–92 en performance et 100 en accessibilité, bonnes pratiques et SEO ; desktop 98–100.
