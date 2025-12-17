# Restore Data from Backup Script
# This script allows you to restore your database and components from a backup

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Nur Investment Fund - Data Restore   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# List available backups
$backups = Get-ChildItem "backups" -Directory | Sort-Object Name -Descending

if ($backups.Count -eq 0) {
    Write-Host "❌ No backups found!" -ForegroundColor Red
    exit
}

Write-Host "Available Backups:" -ForegroundColor Yellow
$backups | ForEach-Object { Write-Host "  $_" }
Write-Host ""

# Prompt user to select backup
$backupName = Read-Host "Enter backup folder name to restore (or 'cancel' to exit)"

if ($backupName -eq "cancel") {
    Write-Host "Restore cancelled." -ForegroundColor Yellow
    exit
}

$backupPath = "backups/$backupName"

if (-not (Test-Path $backupPath)) {
    Write-Host "❌ Backup folder not found: $backupPath" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "⚠️  WARNING: This will overwrite your current data!" -ForegroundColor Red
$confirm = Read-Host "Type 'YES' to confirm restore"

if ($confirm -ne "YES") {
    Write-Host "Restore cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Restoring from backup: $backupName..." -ForegroundColor Cyan

# Create safety backup before restoring
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$safetyDir = "backups/pre_restore_backup_$timestamp"
New-Item -ItemType Directory -Force -Path $safetyDir | Out-Null
Copy-Item "server/nur_fund.db" "$safetyDir/nur_fund.db" -ErrorAction SilentlyContinue
Copy-Item "components" "$safetyDir/components" -Recurse -ErrorAction SilentlyContinue
Write-Host "✓ Safety backup created at: $safetyDir" -ForegroundColor Green

# Restore files
Copy-Item "$backupPath/nur_fund.db" "server/nur_fund.db" -Force
Copy-Item "$backupPath/components" "components" -Recurse -Force
Copy-Item "$backupPath/package.json" "package.json" -Force -ErrorAction SilentlyContinue
Copy-Item "$backupPath/.env" ".env" -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Restore completed successfully!" -ForegroundColor Green
Write-Host "✓ Database restored" -ForegroundColor Green
Write-Host "✓ Components restored" -ForegroundColor Green
Write-Host "✓ Configuration files restored" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your servers with: npm start" -ForegroundColor Yellow
Write-Host "2. Test your application at http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
