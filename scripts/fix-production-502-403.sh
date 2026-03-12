#!/bin/bash
# Fix 502 (edge functions) and 403 (admin RPCs) on production.
# Run from project root. Requires: insforge CLI logged in and linked.
#
# BEFORE RUNNING: Set these env vars or replace the placeholders below:
#   INSFORGE_URL          - same as VITE_INSFORGE_URL (e.g. https://4bta783b.us-east.insforge.app)
#   INSFORGE_ANON_KEY    - same as VITE_INSFORGE_ANON_KEY
#   INSFORGE_SERVICE_KEY - service role key (from InsForge dashboard, never expose in frontend)

set -e

URL="${INSFORGE_URL:-}"
ANON="${INSFORGE_ANON_KEY:-}"
SVC="${INSFORGE_SERVICE_KEY:-}"

if [ -z "$URL" ] || [ -z "$ANON" ] || [ -z "$SVC" ]; then
  echo "Set INSFORGE_URL, INSFORGE_ANON_KEY, INSFORGE_SERVICE_KEY before running."
  echo "Example:"
  echo "  export INSFORGE_URL=https://4bta783b.us-east.insforge.app"
  echo "  export INSFORGE_ANON_KEY=your-anon-key"
  echo "  export INSFORGE_SERVICE_KEY=your-service-role-key"
  exit 1
fi

echo "Adding secrets..."
insforge secrets add INSFORGE_URL "$URL"
insforge secrets add INSFORGE_ANON_KEY "$ANON"
insforge secrets add INSFORGE_SERVICE_ROLE_KEY "$SVC"

echo "Applying migrations..."
insforge db query --file db/migrations/2026-03-12-admin-allow-project-admin.sql
insforge db query --file db/migrations/2026-03-12-admin-rpcs-grant-authenticated.sql
insforge db query --file db/migrations/2026-03-12-admin-dashboard-metrics-security-definer.sql

echo "Deploying edge functions..."
insforge functions deploy blog-posts-public
insforge functions deploy admin-dashboard-data

echo "Done. Verify:"
echo "  - GET https://4bta783b.us-east.insforge.app/functions/blog-posts-public?page=1&pageSize=1"
echo "  - Admin dashboard at /admin"
