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
function Set-InsforgeSecret([string]$key, [string]$value) {
  # Some CLI versions return INVALID_INPUT when secret already exists.
  # Try create first, then update as fallback.
  insforge secrets add $key $value
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Secret $key exists or could not be created; attempting update..."
    insforge secrets update $key --value $value
    if ($LASTEXITCODE -ne 0) {
      throw "Failed to set secret: $key"
    }
  }
}

Set-InsforgeSecret "INSFORGE_URL" $url
Set-InsforgeSecret "INSFORGE_ANON_KEY" $anon
Set-InsforgeSecret "INSFORGE_SERVICE_ROLE_KEY" $svc

function Invoke-InsforgeSqlFile([string]$filePath) {
  if (-not (Test-Path $filePath)) {
    throw "SQL file not found: $filePath"
  }
  $sql = Get-Content -Raw $filePath
  if (-not $sql -or $sql.Trim().Length -eq 0) {
    throw "SQL file is empty: $filePath"
  }

  # Some CLI builds misparse positional SQL that starts with '--' comments.
  # Strip only leading comment/blank lines; keep SQL body unchanged.
  $normalized = ($sql -replace "`r", '')
  $lines = $normalized -split "`n"
  $start = 0
  while ($start -lt $lines.Length) {
    $line = $lines[$start].Trim()
    if ($line -eq '' -or $line.StartsWith('--')) {
      $start++
      continue
    }
    break
  }
  $body = ($lines[$start..($lines.Length - 1)] -join "`n").Trim()
  if (-not $body) {
    throw "SQL file has no executable statements: $filePath"
  }

  insforge db query "$body"
  if ($LASTEXITCODE -ne 0) {
    throw "Failed migration: $filePath"
  }
}

Write-Host "Applying migrations..."
Invoke-InsforgeSqlFile "db/migrations/2026-03-12-admin-allow-project-admin.sql"
Invoke-InsforgeSqlFile "db/migrations/2026-03-12-admin-rpcs-grant-authenticated.sql"
Invoke-InsforgeSqlFile "db/migrations/2026-03-12-admin-dashboard-metrics-security-definer.sql"

Write-Host "Deploying edge functions..."
function Deploy-InsforgeFunction([string]$slug, [string]$path) {
  # Prefer explicit file path.
  insforge functions deploy $slug --file $path
  if ($LASTEXITCODE -eq 0) { return $true }

  # Fallback for older/newer CLI variants that infer file by slug.
  Write-Host "Deploy with --file failed for $slug; attempting slug-only deploy..."
  insforge functions deploy $slug
  if ($LASTEXITCODE -eq 0) { return $true }
  Write-Host "Failed to deploy function: $slug"
  return $false
}

$blogOk = Deploy-InsforgeFunction "blog-posts-public" "insforge/functions/blog-posts-public/index.ts"
$adminOk = Deploy-InsforgeFunction "admin-dashboard-data" "insforge/functions/admin-dashboard-data/index.ts"

Write-Host "Done. Verify:"
Write-Host "  - GET https://4bta783b.us-east.insforge.app/functions/blog-posts-public?page=1&pageSize=1"
Write-Host "  - Admin dashboard at /admin"
if (-not $blogOk -or -not $adminOk) {
  Write-Host "One or more function deploys failed. Admin RPC migrations are already applied."
  Write-Host "If /admin now loads metrics, only function-based endpoints still need CLI/provider support."
}
