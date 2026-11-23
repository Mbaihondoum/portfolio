# Modèle de données

Source de vérité : `src/server/db/schema.ts` (Drizzle). Migrations SQL versionnées dans `drizzle/`.

Les textes traduits sont stockés en `jsonb` au format `{ "fr": "…", "en": "…" }` et validés par Zod (`localizedSchema`). Pour ce volume de contenu, c'est plus simple qu'une table de traductions par entité, et l'admin édite les deux langues côte à côte.

```mermaid
erDiagram
  projects ||--o{ project_metrics : "résultats chiffrés"
  projects ||--o{ project_images : "galerie"

  projects {
    uuid id PK
    varchar slug UK
    jsonb title "fr/en"
    jsonb summary "fr/en"
    jsonb problem "fr/en"
    jsonb solution "fr/en"
    jsonb role "fr/en"
    jsonb description "fr/en, Markdown"
    enum category "web | mobile | data | fullstack"
    text_array stack
    text cover_image
    jsonb cover_alt "fr/en"
    text demo_url
    text repo_url
    text power_bi_embed_url
    jsonb architecture "nœuds + liens"
    jsonb charts "séries des graphiques"
    enum status "draft | published"
    bool featured
    bool is_sample
    int position
    timestamptz published_at
    timestamptz created_at
    timestamptz updated_at
  }
  project_metrics {
    uuid id PK
    uuid project_id FK
    int value
    varchar prefix
    varchar suffix
    jsonb label "fr/en"
    int position
  }
  project_images {
    uuid id PK
    uuid project_id FK
    text url
    jsonb alt "fr/en"
    enum kind "screenshot | dashboard | chart"
    int width
    int height
    int position
  }
  skills {
    uuid id PK
    varchar name
    enum category "frontend | backend_db | mobile | data_bi | tools_devops"
    bool in_marquee
    int position
  }
  experiences {
    uuid id PK
    enum type "work | education"
    jsonb title "fr/en"
    varchar organization
    varchar location
    date start_date
    date end_date "null = en cours"
    jsonb description "fr/en"
    int position
  }
  contact_messages {
    uuid id PK
    varchar name
    varchar email
    varchar subject
    text message
    varchar locale
    enum status "new | read | archived"
    timestamptz created_at
  }
  page_views {
    bigserial id PK
    varchar path
    varchar project_slug
    varchar locale
    varchar country "ISO 3166, en-tête CDN"
    enum device "mobile | tablet | desktop"
    varchar referrer_host
    timestamptz created_at
  }
  rate_limits {
    varchar key PK "HMAC(bucket + IP)"
    timestamptz window_start PK
    smallint count
  }
  site_settings {
    smallint id PK "ligne unique = 1"
    varchar full_name
    varchar initials
    jsonb headline "fr/en"
    jsonb tagline "fr/en"
    jsonb bio "fr/en"
    jsonb approach "fr/en"
    varchar location
    jsonb availability "fr/en"
    varchar email
    text github_url
    text linkedin_url
    varchar whatsapp
    text cv_url_fr
    text cv_url_en
    jsonb key_figures
  }
```

## Index

| Table                               | Index                               | Usage                                                |
| ----------------------------------- | ----------------------------------- | ---------------------------------------------------- |
| `projects`                          | `(status, position)`, `slug` unique | Liste publique ordonnée, page détail                 |
| `project_metrics`, `project_images` | `project_id`                        | Chargement des relations                             |
| `skills`                            | `(category, position)`              | Badges groupés                                       |
| `contact_messages`                  | `(status, created_at)`              | Boîte de réception, compteur de non-lus              |
| `page_views`                        | `created_at`, `project_slug`        | Agrégations du tableau de bord                       |
| `rate_limits`                       | PK `(key, window_start)`            | Upsert atomique ; purge des fenêtres de plus de 24 h |

## Données personnelles

- `contact_messages` contient les données que le visiteur envoie volontairement (nom, email, message). Elles peuvent être supprimées depuis l'admin.
- `page_views` ne contient aucune donnée personnelle : ni IP, ni cookie, ni identifiant, ni user-agent complet.
- `rate_limits` ne contient qu'un hachage HMAC non réversible, purgé après 24 h.
