# 📦 Data Backup & Recovery Guide

## Current Backup
- **Created**: 2025-12-11 01:16:15 UTC
- **Location**: `backups/backup_2025-12-11_011615/`
- **Contents**:
  - ✅ Database: `nur_fund.db` (all companies, bonds, monthly data)
  - ✅ Components: All React components (NurInvestmentFund.jsx, AdminPanel.jsx, etc.)
  - ✅ Configuration: package.json, .env

## What's Backed Up

### Database (`nur_fund.db`)
- All equities companies and their market values
- Monthly investment data for each company
- Fixed income bonds and dividends
- Savings goals and records
- Strategic plans and user data

### Code Files (`components/`)
- NurInvestmentFund.jsx - Main dashboard
- AdminPanel.jsx - Admin interface
- LoginPage.jsx - Authentication
- UserProfilePanel.jsx - User profile
- All styling and configurations

### Configuration
- package.json - Dependencies and scripts
- .env - Environment variables (Gmail, etc.)

## How to Restore from Backup

### Method 1: Using PowerShell Script (Recommended)
```powershell
# Run from project root directory
.\RESTORE_BACKUP.ps1
```

Steps:
1. Lists all available backups
2. You select which backup to restore
3. Creates a safety backup first
4. Restores your selected backup
5. Shows confirmation message

### Method 2: Manual Restore
If you need to manually restore files:

```powershell
# Restore database
Copy-Item "backups/backup_2025-12-11_011615/nur_fund.db" "server/nur_fund.db" -Force

# Restore components
Copy-Item "backups/backup_2025-12-11_011615/components" "components" -Recurse -Force

# Restore configuration
Copy-Item "backups/backup_2025-12-11_011615/package.json" "package.json" -Force
Copy-Item "backups/backup_2025-12-11_011615/.env" ".env" -Force
```

## Backup Strategy

### Automatic Backups (via AdminPanel)
The Admin Panel has a "Create Database Backup" button that creates backups in:
- Location: `server/deployments/`
- Format: `deployment_TIMESTAMP_*.json` files

### Manual Backups (Recommended)
Run this PowerShell command to create a backup anytime:
```powershell
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$backupDir = "backups/backup_$timestamp"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
Copy-Item "server/nur_fund.db" "$backupDir/nur_fund.db"
Copy-Item "components" "$backupDir/components" -Recurse
Copy-Item "package.json" "$backupDir/package.json"
Copy-Item ".env" "$backupDir/.env" -ErrorAction SilentlyContinue
Write-Host "✓ Backup created at: $backupDir"
```

## Database Structure (Backed Up)

### equities_companies Table
```
id         | name                    | value  | type               | sector       | ownership | country
1          | SPUS ETF                | 125.00 | Index Funds & ETF  | Technology   | 100%      | USA
2          | Amanah Saham Berhad 1   | 128.00 | Dividend Stocks    | Finance      | 50%       | Malaysia
...
```

### Monthly Data (assetMonthlyData)
- Stores historical monthly values for each company
- Key format: `companyName: { jan: X, feb: Y, ..., dec: Z }`
- Values stored internally (divide by 3.7 to display)

### Fixed Income Bonds
- Bond names, ratings, maturity dates
- Monthly values and dividend data
- Country and bond type information

## Recovery Scenarios

### Scenario 1: Accidental Data Deletion
1. Run: `.\RESTORE_BACKUP.ps1`
2. Select the backup before deletion
3. Restart servers: `npm start`
4. Data restored!

### Scenario 2: Database Corruption
1. Close all server connections
2. Delete corrupted `server/nur_fund.db`
3. Run restore script and select good backup
4. Restart servers

### Scenario 3: Component Code Broken
1. Run restore script
2. Select backup from before the broken code
3. Restart servers
4. Code reverted!

### Scenario 4: Multiple Backups Available
1. Run: `.\RESTORE_BACKUP.ps1`
2. Script shows all available backups sorted by date
3. Select the one you want (newest ones appear first)
4. Confirm restore
5. Safety backup created automatically

## Backup Safety Features

✅ **Safety Backup Before Restore**
- When restoring, current data backed up first
- Format: `backups/pre_restore_backup_TIMESTAMP/`
- Can be restored if restore goes wrong

✅ **Timestamped Backups**
- Each backup has unique timestamp
- Easy to identify when backup was created
- Can maintain multiple versions

✅ **Manual Confirmation**
- Must type "YES" to confirm restore
- Prevents accidental overwrites
- Shows what will be restored

✅ **Automatic Safety Check**
- Validates backup exists before restore
- Creates safety backup before overwriting
- Shows completion status

## Database Export for External Backup

To export database to JSON (extra safe):
```powershell
# Export all data to JSON
node -e "
const Database = require('better-sqlite3');
const db = new Database('server/nur_fund.db');
const fs = require('fs');

const data = {
  companies: db.prepare('SELECT * FROM equities_companies').all(),
  bonds: db.prepare('SELECT * FROM fixed_income_bonds').all(),
  timestamp: new Date().toISOString()
};

fs.writeFileSync('backups/data_export_' + Date.now() + '.json', JSON.stringify(data, null, 2));
console.log('✓ Data exported');
"
```

## Recovery Checklist

After restoring from backup:
- [ ] Database file size is reasonable (>100KB)
- [ ] Restart npm servers: `npm start`
- [ ] Load http://localhost:5173 in browser
- [ ] Login works (Ahmad Nur / 1)
- [ ] See investment cards with data
- [ ] Admin panel loads correctly
- [ ] Market values display properly
- [ ] No console errors (F12 → Console tab)

## Questions or Issues?

If restore fails or you see errors:
1. Check backup folder exists: `backups/backup_2025-12-11_011615/`
2. Verify nur_fund.db file exists in backup
3. Check file permissions (run as Administrator if needed)
4. Check disk space (at least 100MB free)

Your data is safe! ✅
