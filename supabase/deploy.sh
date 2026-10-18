#!/usr/bin/env bash
# Push local migrations in supabase/migrations to the linked Supabase project.
# Requires the Supabase CLI and a logged-in session:
#   supabase login            (or export SUPABASE_ACCESS_TOKEN=...)
# You will be prompted for the database password on link/push unless
# SUPABASE_DB_PASSWORD is set in your shell (never commit it).
set -euo pipefail
cd "$(dirname "$0")/.."

# shellcheck disable=SC1091
source supabase/project.env

supabase link --project-ref "$SUPABASE_PROJECT_REF"
supabase db push
