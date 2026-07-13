# build-release.ps1
# Generates bakery-webapp-v1.0.zip for CodeCanyon upload.
#
# Usage (from project root):
#   .\build-release.ps1
#
# What it does:
#   1. Copies the project to a temp folder using robocopy with exclusion lists
#   2. Verifies .env.example is present and .env (real credentials) is absent
#   3. Compresses to bakery-webapp-v1.0.zip at the project root
#   4. Prints SHA256 hash + file size for upload verification
#
# The real backend/.env is NEVER read, modified, or included in the ZIP.
# Only backend/.env.example is included (buyers use it as their template).

$ErrorActionPreference = 'Stop'

$version    = '1.0'
$itemName   = 'bakery-webapp'
$zipName    = "$itemName-v$version.zip"
$releaseDir = Join-Path $PSScriptRoot "_release\$itemName-v$version"
$zipPath    = Join-Path $PSScriptRoot $zipName

Write-Host ""
Write-Host "  Building CodeCanyon release: $zipName" -ForegroundColor Cyan
Write-Host ""

# ── 1. Clean up previous run ──────────────────────────────────────────────────
$releaseRoot = Join-Path $PSScriptRoot '_release'
if (Test-Path $releaseRoot) {
    Remove-Item $releaseRoot -Recurse -Force
    Write-Host "  Cleaned previous _release folder." -ForegroundColor Gray
}
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "  Removed previous $zipName." -ForegroundColor Gray
}

New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null

# ── 2. Copy project files via robocopy ────────────────────────────────────────
# Robocopy exit codes 0-7 indicate success (copies were made or nothing changed).
# Exit code 8+ indicates an error.
Write-Host "  Copying project files..." -ForegroundColor Gray

robocopy $PSScriptRoot $releaseDir `
    /E `
    /XD node_modules .git dist .angular uploads _release docs .claude `
    /XF .env "*.zip" "*.ps1" RESUMEN-TECNICO.md `
    /NP /NFL /NDL | Out-Null

if ($LASTEXITCODE -ge 8) {
    Write-Host ""
    Write-Host "  ERROR: robocopy failed (exit code $LASTEXITCODE)" -ForegroundColor Red
    exit 1
}

# Copy the build script itself so buyers can see how the ZIP was made (optional)
# Uncomment the line below if you want to include build-release.ps1 in the ZIP:
# Copy-Item (Join-Path $PSScriptRoot 'build-release.ps1') (Join-Path $releaseDir 'build-release.ps1')

# ── 3. Safety checks ──────────────────────────────────────────────────────────
$envExample = Join-Path $releaseDir 'backend\.env.example'
$envReal    = Join-Path $releaseDir 'backend\.env'

if (-not (Test-Path $envExample)) {
    Write-Host ""
    Write-Host "  ERROR: backend/.env.example was not copied into the release folder!" -ForegroundColor Red
    Write-Host "  Make sure backend/.env.example exists in the project." -ForegroundColor Red
    Remove-Item $releaseRoot -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}

if (Test-Path $envReal) {
    # Should never reach here because /XF .env excludes it, but belt-and-suspenders
    Write-Host "  WARNING: backend/.env was found in release folder -- removing it now." -ForegroundColor Yellow
    Remove-Item $envReal -Force
}

Write-Host "  [OK] backend/.env.example present" -ForegroundColor Green
Write-Host "  [OK] backend/.env absent (real credentials excluded)" -ForegroundColor Green

# ── 4. Create the ZIP ─────────────────────────────────────────────────────────
Write-Host "  Creating $zipName..." -ForegroundColor Gray
Compress-Archive -Path "$releaseDir\*" -DestinationPath $zipPath -Force

# ── 5. Clean up temp folder ───────────────────────────────────────────────────
Remove-Item $releaseRoot -Recurse -Force

# ── 6. Report ─────────────────────────────────────────────────────────────────
$sizeMB   = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
$sha256   = (Get-FileHash $zipPath -Algorithm SHA256).Hash
$envatoLimit = 50

Write-Host ""
Write-Host "  Done!" -ForegroundColor Green
Write-Host "  File    : $zipName"         -ForegroundColor White
Write-Host "  Size    : $sizeMB MB"        -ForegroundColor White
Write-Host "  SHA256  : $sha256"           -ForegroundColor White

if ($sizeMB -gt $envatoLimit) {
    Write-Host ""
    Write-Host "  WARNING: ZIP exceeds Envato's $envatoLimit MB limit!" -ForegroundColor Yellow
    Write-Host "  Review what was included and check the exclusion list." -ForegroundColor Yellow
} else {
    Write-Host "  Envato  : Within $envatoLimit MB limit [OK]" -ForegroundColor Green
}

Write-Host ""
Write-Host "  Upload at: https://codecanyon.net/dashboard" -ForegroundColor Cyan
Write-Host ""
