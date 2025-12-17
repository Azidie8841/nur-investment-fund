# Database Backups & Monthly Investments Analysis

## Summary

### Available Backups
- **3 Deployment Backups** available in `server/deployments/`
  - `deployment_2025-12-07T15-44-45-867_data_export.json`
  - `deployment_2025-12-07T15-44-10-254_data_export.json`
  - `deployment_2025-12-07T15-43-56-988_data_export.json`

### Monthly Investments Data (2025)

**Status**: ✅ **12 records found in current database (nur_fund.db)**

**Location**: CURRENT DATABASE ONLY
- Monthly Investments data is **NOT** in any of the deployment backups
- The deployment backups were created on Dec 7 BEFORE monthly investments were added

### Monthly Investments for Equity ETF (2025)

| Month | Amount Added | Total Invested | Value | Profit |
|-------|--------------|-----------------|--------|--------|
| Jan   | 300          | 300             | 310    | 10.00  |
| Feb   | 300          | 600             | 630    | 30.00  |
| Mar   | 300          | 900             | 960    | 60.00  |
| Apr   | 300          | 1,200           | 1,300  | 100.00 |
| May   | 300          | 1,500           | 1,650  | 150.00 |
| Jun   | 300          | 1,800           | 2,010  | 210.00 |
| Jul   | 300          | 2,100           | 2,400  | 300.00 |
| Aug   | 300          | 2,400           | 2,760  | 360.00 |
| Sep   | 300          | 2,700           | 3,150  | 450.00 |
| Oct   | 300          | 3,000           | 3,570  | 570.00 |
| Nov   | 300          | 3,300           | 4,020  | 720.00 |
| Dec   | 300          | 3,600           | 4,500  | 900.00 |

### Summary Statistics

- **Total Amount Invested**: 3,600.00
- **Total Portfolio Value**: 4,500.00
- **Total Profit**: 900.00
- **Return Percentage**: 25%

## Important Notes

⚠️ **Monthly Investments data is ONLY in the current active database**

The three deployment backups from December 7 do not contain monthly investments data because:
1. These backups were created before monthly investments functionality was added
2. Monthly investments tracking appears to have been added after the last backup
3. To preserve this data, you should create a new backup now

## Recommendation

To backup the current monthly investments data (2025):
```bash
node server/backup.cjs
# or
npm run backup:pre-deploy
```

This will create a new backup containing all the monthly investments records.
