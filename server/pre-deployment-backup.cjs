/**
 * Pre-Deployment Backup Script
 * Backs up database, exports all data, and creates deployment snapshots
 * Run this before any deployment to ensure data safety and rollback capability
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbPath = path.join(__dirname, 'nur_fund.db');
const backupsDir = path.join(__dirname, 'backups');
const deploymentsDir = path.join(__dirname, 'deployments');

// Ensure backup directories exist
[backupsDir, deploymentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const db = new Database(dbPath);

// Generate timestamp for backup naming
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('Z')[0];
};

const timestamp = getTimestamp();
const deploymentId = `deployment_${timestamp}`;

console.log('\n' + '═'.repeat(70));
console.log('🔐 PRE-DEPLOYMENT BACKUP PROCESS INITIATED');
console.log('═'.repeat(70));
console.log(`📅 Deployment ID: ${deploymentId}`);
console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

// ==================== STEP 1: Database Backup ====================

console.log('\n📦 STEP 1: Creating Database Backup');
console.log('─'.repeat(70));

try {
  const dbBackupPath = path.join(backupsDir, `nur_fund_backup_${timestamp}.db`);
  fs.copyFileSync(dbPath, dbBackupPath);
  const dbSize = fs.statSync(dbBackupPath).size / (1024 * 1024); // Size in MB
  console.log(`✅ Database backed up: ${path.basename(dbBackupPath)}`);
  console.log(`   Size: ${dbSize.toFixed(2)} MB`);
} catch (error) {
  console.error(`❌ Database backup failed: ${error.message}`);
  process.exit(1);
}

// ==================== STEP 2: Data Export ====================

console.log('\n📊 STEP 2: Exporting All Investment Data');
console.log('─'.repeat(70));

const exportData = {
  timestamp: new Date().toISOString(),
  deploymentId: deploymentId,
  tables: {}
};

const tables = [
  'equities_companies',
  'fixed_income_bonds',
  'alternative_investments',
  'asset_monthly_data',
  'fixed_income_monthly_data',
  'alternative_investment_monthly_data',
  'savings_records',
  'savings_goals',
  'funds',
  'user_profiles',
  'performance_data',
  'strategic_plans',
  'bond_annual_dividends',
  'bond_monthly_dividends',
  'bond_monthly_values'
];

let totalRecords = 0;

tables.forEach(tableName => {
  try {
    const tableExists = db.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
    ).get(tableName);
    
    if (tableExists) {
      const data = db.prepare(`SELECT * FROM ${tableName}`).all();
      exportData.tables[tableName] = {
        count: data.length,
        data: data
      };
      totalRecords += data.length;
      console.log(`✅ ${tableName}: ${data.length} records exported`);
    }
  } catch (error) {
    console.log(`⚠️  ${tableName}: ${error.message}`);
  }
});

// Save exported data as JSON
const dataExportPath = path.join(deploymentsDir, `${deploymentId}_data_export.json`);
fs.writeFileSync(dataExportPath, JSON.stringify(exportData, null, 2));
console.log(`\n✅ Total records exported: ${totalRecords}`);
console.log(`   Saved to: ${path.basename(dataExportPath)}`);

// ==================== STEP 3: Schema Export ====================

console.log('\n🗂️  STEP 3: Exporting Database Schema');
console.log('─'.repeat(70));

const schemaData = {
  timestamp: new Date().toISOString(),
  deploymentId: deploymentId,
  schema: {}
};

tables.forEach(tableName => {
  try {
    const tableExists = db.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
    ).get(tableName);
    
    if (tableExists) {
      const createTableStmt = db.prepare(
        `SELECT sql FROM sqlite_master WHERE type='table' AND name=?`
      ).get(tableName);
      
      schemaData.schema[tableName] = {
        createStatement: createTableStmt.sql,
        columns: db.prepare(`PRAGMA table_info(${tableName})`).all()
      };
      console.log(`✅ Schema exported: ${tableName}`);
    }
  } catch (error) {
    console.log(`⚠️  Schema export failed for ${tableName}: ${error.message}`);
  }
});

const schemaExportPath = path.join(deploymentsDir, `${deploymentId}_schema.json`);
fs.writeFileSync(schemaExportPath, JSON.stringify(schemaData, null, 2));
console.log(`\n✅ Schema exported: ${path.basename(schemaExportPath)}`);

// ==================== STEP 4: Statistics & Summary ====================

console.log('\n📈 STEP 4: Deployment Statistics');
console.log('─'.repeat(70));

const stats = {
  timestamp: new Date().toISOString(),
  deploymentId: deploymentId,
  database: {
    path: dbPath,
    size: (fs.statSync(dbPath).size / (1024 * 1024)).toFixed(2) + ' MB'
  },
  tableStats: {},
  totals: {
    tables: 0,
    records: 0
  }
};

tables.forEach(tableName => {
  try {
    const tableExists = db.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
    ).get(tableName);
    
    if (tableExists) {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get().count;
      stats.tableStats[tableName] = count;
      stats.totals.records += count;
      stats.totals.tables++;
    }
  } catch (error) {
    // Table might not exist or have different schema
  }
});

console.log(`📊 Total Tables: ${stats.totals.tables}`);
console.log(`📋 Total Records: ${stats.totals.records}`);
console.log(`💾 Database Size: ${stats.database.size}`);

// Print breakdown by table type
console.log('\n📋 Breakdown by Category:');
console.log('   Equities:', stats.tableStats.equities_companies || 0, 'companies');
console.log('   Bonds:', stats.tableStats.fixed_income_bonds || 0, 'bonds');
console.log('   Alternatives:', stats.tableStats.alternative_investments || 0, 'investments');
console.log('   Savings Records:', stats.tableStats.savings_records || 0, 'records');
console.log('   Savings Goals:', stats.tableStats.savings_goals || 0, 'goals');
console.log('   Funds:', stats.tableStats.funds || 0, 'funds');
console.log('   Strategic Plans:', stats.tableStats.strategic_plans || 0, 'plans');
console.log('   Users:', stats.tableStats.user_profiles || 0, 'users');

// Save statistics
const statsExportPath = path.join(deploymentsDir, `${deploymentId}_stats.json`);
fs.writeFileSync(statsExportPath, JSON.stringify(stats, null, 2));

// ==================== STEP 5: Environment Variables ====================

console.log('\n🔑 STEP 5: Backing Up Environment Configuration');
console.log('─'.repeat(70));

try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envBackupPath = path.join(deploymentsDir, `${deploymentId}_env.backup`);
    fs.copyFileSync(envPath, envBackupPath);
    console.log(`✅ Environment variables backed up`);
  } else {
    console.log(`⚠️  .env file not found (optional)`);
  }
} catch (error) {
  console.log(`⚠️  Environment backup skipped: ${error.message}`);
}

// ==================== STEP 6: Git Information ====================

console.log('\n🔀 STEP 6: Recording Git Information');
console.log('─'.repeat(70));

let gitInfo = {
  timestamp: new Date().toISOString(),
  deploymentId: deploymentId,
  branch: 'unknown',
  lastCommit: { hash: '', message: '', author: '', date: '' },
  modifiedFiles: []
};

try {
  // Get current branch
  gitInfo.branch = execSync('git branch --show-current').toString().trim();
  console.log(`✅ Current Branch: ${gitInfo.branch}`);

  // Get latest commit
  gitInfo.lastCommit = {
    hash: execSync('git rev-parse HEAD').toString().trim(),
    message: execSync('git log -1 --pretty=%B').toString().trim(),
    author: execSync('git log -1 --pretty=%an').toString().trim(),
    date: execSync('git log -1 --pretty=%aI').toString().trim()
  };
  console.log(`✅ Latest Commit: ${gitInfo.lastCommit.hash.substring(0, 7)}`);
  console.log(`   Message: ${gitInfo.lastCommit.message.split('\n')[0]}`);

  // Get modified files
  gitInfo.modifiedFiles = execSync('git status --short').toString().trim().split('\n').filter(f => f);
  console.log(`✅ Modified Files: ${gitInfo.modifiedFiles.length}`);
  if (gitInfo.modifiedFiles.length > 0) {
    gitInfo.modifiedFiles.slice(0, 5).forEach(f => console.log(`   └─ ${f}`));
    if (gitInfo.modifiedFiles.length > 5) {
      console.log(`   ... and ${gitInfo.modifiedFiles.length - 5} more`);
    }
  }

  // Save git info
  const gitInfoPath = path.join(deploymentsDir, `${deploymentId}_git_info.json`);
  fs.writeFileSync(gitInfoPath, JSON.stringify(gitInfo, null, 2));
  console.log(`\n✅ Git information recorded`);
} catch (error) {
  console.log(`⚠️  Git information recording skipped: ${error.message}`);
}

// ==================== STEP 7: Rollback Instructions ====================

console.log('\n📝 STEP 7: Generating Rollback Instructions');
console.log('─'.repeat(70));

const rollbackScript = `#!/bin/bash
# Rollback Script for Deployment ${deploymentId}
# Generated: ${new Date().toISOString()}

# To rollback to this deployment state:

# 1. Restore Database
echo "Restoring database..."
cp server/backups/nur_fund_backup_${timestamp}.db server/nur_fund.db

# 2. Restore Code (if needed)
echo "Git checkout to ${gitInfo.lastCommit.hash.substring(0, 7)}..."
git checkout ${gitInfo.lastCommit.hash}

# 3. Restart Services
echo "Restarting services..."
npm start

echo "✅ Rollback completed!"
`;

const rollbackPath = path.join(deploymentsDir, `${deploymentId}_rollback.sh`);
fs.writeFileSync(rollbackPath, rollbackScript);
console.log(`✅ Rollback script generated: ${path.basename(rollbackPath)}`);

// ==================== DEPLOYMENT MANIFEST ====================

console.log('\n📋 STEP 8: Creating Deployment Manifest');
console.log('─'.repeat(70));

const manifest = {
  deploymentId: deploymentId,
  timestamp: new Date().toISOString(),
  status: 'PRE-DEPLOYMENT_BACKUP_COMPLETE',
  backupFiles: {
    database: `nur_fund_backup_${timestamp}.db`,
    dataExport: `${deploymentId}_data_export.json`,
    schema: `${deploymentId}_schema.json`,
    statistics: `${deploymentId}_stats.json`,
    gitInfo: `${deploymentId}_git_info.json`,
    rollback: `${deploymentId}_rollback.sh`
  },
  summary: {
    totalRecords: stats.totals.records,
    totalTables: stats.totals.tables,
    databaseSize: stats.database.size,
    branch: gitInfo.branch,
    commitHash: gitInfo.lastCommit.hash
  }
};

const manifestPath = path.join(deploymentsDir, `${deploymentId}_manifest.json`);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`✅ Manifest created: ${path.basename(manifestPath)}`);

// ==================== CLEANUP OLD BACKUPS ====================

console.log('\n🧹 STEP 9: Managing Old Backups');
console.log('─'.repeat(70));

try {
  const files = fs.readdirSync(backupsDir);
  const backupFiles = files.filter(f => f.startsWith('nur_fund_backup_'));
  
  // Keep only last 10 backups
  if (backupFiles.length > 10) {
    backupFiles.sort().slice(0, -10).forEach(file => {
      fs.unlinkSync(path.join(backupsDir, file));
    });
    console.log(`✅ Cleaned up ${backupFiles.length - 10} old backups (keeping last 10)`);
  } else {
    console.log(`✅ ${backupFiles.length} backup(s) in storage`);
  }
} catch (error) {
  console.log(`⚠️  Cleanup skipped: ${error.message}`);
}

// ==================== FINAL SUMMARY ====================

console.log('\n' + '═'.repeat(70));
console.log('✅ PRE-DEPLOYMENT BACKUP COMPLETED SUCCESSFULLY');
console.log('═'.repeat(70));

console.log(`\n📋 Deployment ID: ${deploymentId}`);
console.log(`📂 Backup Location: ${deploymentsDir}`);
console.log(`\n📦 Backup Files Created:`);
console.log(`   ✓ Database backup: nur_fund_backup_${timestamp}.db`);
console.log(`   ✓ Data export: ${deploymentId}_data_export.json`);
console.log(`   ✓ Schema: ${deploymentId}_schema.json`);
console.log(`   ✓ Statistics: ${deploymentId}_stats.json`);
console.log(`   ✓ Git info: ${deploymentId}_git_info.json`);
console.log(`   ✓ Rollback script: ${deploymentId}_rollback.sh`);
console.log(`   ✓ Manifest: ${deploymentId}_manifest.json`);

console.log(`\n📊 Data Summary:`);
console.log(`   • Total Records: ${stats.totals.records}`);
console.log(`   • Total Tables: ${stats.totals.tables}`);
console.log(`   • Database Size: ${stats.database.size}`);

console.log(`\n🔀 Git Status:`);
console.log(`   • Branch: ${gitInfo.branch}`);
console.log(`   • Latest Commit: ${gitInfo.lastCommit.hash.substring(0, 7)}`);
console.log(`   • Modified Files: ${gitInfo.modifiedFiles.length}`);

console.log(`\n⏱️  Backup Time: ${new Date().toISOString()}`);
console.log(`\n🚀 Safe to proceed with deployment!`);
console.log(`\n⚠️  Rollback Command (if needed):`);
console.log(`   bash ${path.basename(rollbackPath)}`);

console.log('\n' + '═'.repeat(70) + '\n');

db.close();
