#!/usr/bin/env bash
# Vercel build command (see vercel.json).
# Production deployments apply pending database migrations before building;
# preview deployments never touch the production database.
set -euo pipefail

if [ "${VERCEL_ENV:-}" = "production" ]; then
  echo "▶ Applying database migrations (production)"
  pnpm db:migrate
else
  echo "▶ Skipping migrations (VERCEL_ENV=${VERCEL_ENV:-local})"
fi

pnpm build
