# Fix 502 (edge functions) and 403 (admin RPCs) on production.
# Run from project root. Requires: insforge CLI logged in and linked.
#
# BEFORE RUNNING: Set these env vars or replace the placeholders:
#   $env:INSFORGE_URL          - same as VITE_INSFORGE_URL (e.g. https://4bta783b.us-east.insforge.app)
#   $env:INSFORGE_ANON_KEY     - same as VITE_INSFORGE_ANON_KEY
#   $env:INSFORGE_SERVICE_KEY  - service role key (from InsForge dashboard)

$ErrorActionPreference = "Stop"

$url = $env:INSFORGE_URL
$anon = $env:INSFORGE_ANON_KEY
$svc = $env:INSFORGE_SERVICE_KEY

if (-not $url -or -not $anon -or -not $svc) {
  Write-Host "Set INSFORGE_URL, INSFORGE_ANON_KEY, INSFORGE_SERVICE_KEY before running."
  Write-Host "Example:"
  Write-Host '  $env:INSFORGE_URL = "https://4bta783b.us-east.insforge.app"'
  Write-Host '  $env:INSFORGE_ANON_KEY = "your-anon-key"'
  Write-Host '  $env:INSFORGE_SERVICE_KEY = "your-service-role-key"'
  exit 1
}

Write-Host "Adding secrets..."
insforge secrets add INSFORGE_URL $url
insforge secrets add INSFORGE_ANON_KEY $anon
insforge secrets add INSFORGE_SERVICE_ROLE_KEY $svc

Write-Host "Applying migrations..."
insforge db query --file db/migrations/2026-03-12-admin-allow-project-admin.sql
insforge db query --file db/migrations/2026-03-12-admin-rpcs-grant-authenticated.sql
insforge db query --file db/migrations/2026-03-12-admin-dashboard-metrics-security-definer.sql

Write-Host "Deploying edge functions..."
insforge functions deploy blog-posts-public
insforge functions deploy admin-dashboard-data

Write-Host "Done. Verify:"
Write-Host "  - GET https://4bta783b.us-east.insforge.app/functions/blog-posts-public?page=1&pageSize=1"
Write-Host "  - Admin dashboard at /admin"
