param(
  [string]$Domain = "localhost",
  [string]$DbPassword = "",
  [string]$JwtSecret = ""
)

if (-not $DbPassword) {
  $DbPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 24 | ForEach-Object { [char]$_ })
}

if (-not $JwtSecret) {
  $JwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
}

$env:DB_PASSWORD = $DbPassword
$env:JWT_SECRET = $JwtSecret
$env:DOMAIN = $Domain

Write-Host "Desplegando La Flor de Azucar en $Domain..." -ForegroundColor Cyan
Write-Host "DB_PASSWORD: $DbPassword" -ForegroundColor Yellow
Write-Host "JWT_SECRET:  $JwtSecret" -ForegroundColor Yellow

docker compose up -d --build

if ($LASTEXITCODE -eq 0) {
  Write-Host "`nDespliegue completado!" -ForegroundColor Green
  Write-Host "Frontend: https://${Domain}" -ForegroundColor Green
  Write-Host "API:      http://localhost:3000" -ForegroundColor Green
  Write-Host "Health:   https://${Domain}/health" -ForegroundColor Green
  Write-Host "`nLogs: docker compose logs -f" -ForegroundColor Gray
} else {
  Write-Host "Error en el despliegue" -ForegroundColor Red
}
