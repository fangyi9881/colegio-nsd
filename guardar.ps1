# =========================================================
# guardar.ps1 - Sube todos los cambios a GitHub
# Uso: .\guardar.ps1 "descripción del cambio"
# =========================================================

param(
    [string]$mensaje = "actualizacion $(Get-Date -Format 'dd/MM/yyyy HH:mm')"
)

Write-Host "`n🚀 Subiendo cambios a GitHub..." -ForegroundColor Cyan

git add .
git commit -m $mensaje
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ ¡Listo! Cambios subidos correctamente." -ForegroundColor Green
    Write-Host "🔗 https://github.com/fangyi9881/colegio-nsd`n" -ForegroundColor Gray
} else {
    Write-Host "`n⚠️  Algo fue mal. Revisa el error de arriba." -ForegroundColor Yellow
}
