#!/bin/bash
# Rollback Script for Deployment deployment_2025-12-07T15-44-45-867
# Generated: 2025-12-07T15:44:46.648Z

# To rollback to this deployment state:

# 1. Restore Database
echo "Restoring database..."
cp server/backups/nur_fund_backup_2025-12-07T15-44-45-867.db server/nur_fund.db

# 2. Restore Code (if needed)
echo "Git checkout to fe4b5d0..."
git checkout fe4b5d0d7d9999d77456f2fe594557bd2afe3f0e

# 3. Restart Services
echo "Restarting services..."
npm start

echo "✅ Rollback completed!"
