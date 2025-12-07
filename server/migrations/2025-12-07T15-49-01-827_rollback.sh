#!/bin/bash
# Rollback Script for Migration 2025-12-07T15-49-01-827
# This script restores the database to its pre-migration state

echo "🔄 Starting rollback..."
echo "Restoring from backup: pre-migration_backup_2025-12-07T15-49-01-827.db"

# 1. Backup current state
cp server/nur_fund.db server/backups/nur_fund_rollback_point_2025-12-07T15-49-01-827.db
echo "✅ Current state backed up"

# 2. Restore from pre-migration backup
cp server/backups/pre-migration_backup_2025-12-07T15-49-01-827.db server/nur_fund.db
echo "✅ Database restored"

# 3. Verify restoration
echo "🔍 Verifying data..."
node server/check_db.cjs

echo "✅ Rollback completed!"
echo "Database restored to pre-migration state"
