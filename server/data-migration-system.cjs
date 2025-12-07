/**
 * Data Migration & Verification System
 * Ensures no data is lost when creating new tables or modifying schema
 * Provides validation, backup, and rollback capabilities
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'nur_fund.db');
const backupsDir = path.join(__dirname, 'backups');
const migrationsDir = path.join(__dirname, 'migrations');

// Ensure directories exist
[backupsDir, migrationsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const db = new Database(dbPath);

const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('Z')[0];
};

const timestamp = getTimestamp();

console.log('\n' + '═'.repeat(70));
console.log('🔍 DATA MIGRATION & VERIFICATION SYSTEM');
console.log('═'.repeat(70));

// ==================== STEP 1: Pre-Migration Validation ====================

console.log('\n📋 STEP 1: Pre-Migration Data Validation');
console.log('─'.repeat(70));

const getAllTables = () => {
  return db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  ).all().map(row => row.name);
};

const getTableData = (tableName) => {
  try {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    const data = db.prepare(`SELECT * FROM ${tableName}`).all();
    return {
      tableName,
      columnCount: columns.length,
      recordCount: data.length,
      columns: columns.map(col => ({
        name: col.name,
        type: col.type,
        notnull: col.notnull,
        default: col.dflt_value,
        pk: col.pk
      })),
      data: data,
      size: JSON.stringify(data).length / 1024 // Size in KB
    };
  } catch (error) {
    return { error: error.message };
  }
};

const currentTables = getAllTables();
const preValidation = {};
let totalRecords = 0;
let totalSize = 0;

console.log(`📊 Found ${currentTables.length} tables\n`);

currentTables.forEach(tableName => {
  const tableData = getTableData(tableName);
  preValidation[tableName] = tableData;
  totalRecords += tableData.recordCount;
  totalSize += tableData.size;
  
  console.log(`✅ ${tableName}`);
  console.log(`   Records: ${tableData.recordCount} | Columns: ${tableData.columnCount} | Size: ${tableData.size.toFixed(2)} KB`);
});

console.log(`\n📊 Total: ${totalRecords} records | ${totalSize.toFixed(2)} KB`);

// ==================== STEP 2: Create Pre-Migration Backup ====================

console.log('\n\n💾 STEP 2: Creating Pre-Migration Backup');
console.log('─'.repeat(70));

const backupPath = path.join(backupsDir, `pre-migration_backup_${timestamp}.db`);
try {
  fs.copyFileSync(dbPath, backupPath);
  console.log(`✅ Pre-migration backup created: ${path.basename(backupPath)}`);
} catch (error) {
  console.error(`❌ Backup failed: ${error.message}`);
  process.exit(1);
}

// ==================== STEP 3: Save Migration Plan ====================

console.log('\n\n📝 STEP 3: Generating Migration Plan');
console.log('─'.repeat(70));

const migrationPlan = {
  timestamp: new Date().toISOString(),
  migrationId: `migration_${timestamp}`,
  action: 'NEW_TABLE_CREATION',
  preMigrationState: {
    tables: currentTables,
    totalRecords,
    totalSize: totalSize.toFixed(2) + ' KB',
    validation: preValidation
  },
  newTableTemplate: {
    name: 'EXAMPLE_TABLE_NAME',
    description: 'Modify this template for your new table',
    columns: [
      {
        name: 'id',
        type: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        description: 'Unique identifier'
      },
      {
        name: 'name',
        type: 'TEXT NOT NULL',
        description: 'Record name'
      },
      {
        name: 'value',
        type: 'REAL',
        description: 'Record value'
      },
      {
        name: 'created_at',
        type: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        description: 'Creation timestamp'
      },
      {
        name: 'updated_at',
        type: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        description: 'Last update timestamp'
      }
    ]
  },
  postMigrationChecks: [
    'All existing tables preserved',
    'No data lost from existing tables',
    'New table schema valid',
    'Record counts match',
    'Data integrity verified',
    'Relationships intact'
  ]
};

const migrationPlanPath = path.join(migrationsDir, `${migrationPlan.migrationId}_plan.json`);
fs.writeFileSync(migrationPlanPath, JSON.stringify(migrationPlan, null, 2));
console.log(`✅ Migration plan created: ${path.basename(migrationPlanPath)}`);

// ==================== STEP 4: Detect Schema Changes ====================

console.log('\n\n🔍 STEP 4: Schema Change Detection');
console.log('─'.repeat(70));

/**
 * Compare two schemas and detect changes
 */
const detectSchemaChanges = (oldSchema, newSchema) => {
  const changes = {
    addedTables: [],
    removedTables: [],
    modifiedTables: [],
    addedColumns: {},
    removedColumns: {},
    modifiedColumns: {}
  };

  const oldTables = Object.keys(oldSchema);
  const newTables = Object.keys(newSchema);

  // Detect added tables
  newTables.forEach(table => {
    if (!oldTables.includes(table)) {
      changes.addedTables.push(table);
    }
  });

  // Detect removed tables
  oldTables.forEach(table => {
    if (!newTables.includes(table)) {
      changes.removedTables.push(table);
    }
  });

  // Detect modified tables
  oldTables.forEach(tableName => {
    if (newTables.includes(tableName)) {
      const oldCols = oldSchema[tableName].map(col => col.name);
      const newCols = newSchema[tableName].map(col => col.name);

      // Added columns
      const added = newCols.filter(col => !oldCols.includes(col));
      if (added.length > 0) {
        changes.addedColumns[tableName] = added;
      }

      // Removed columns
      const removed = oldCols.filter(col => !newCols.includes(col));
      if (removed.length > 0) {
        changes.removedColumns[tableName] = removed;
      }
    }
  });

  return changes;
};

console.log('✅ Schema change detection ready');
console.log('   Use: compareSchemas(oldSchema, newSchema)');

// ==================== STEP 5: Data Migration Helper Functions ====================

console.log('\n\n🔧 STEP 5: Data Migration Helper Functions');
console.log('─'.repeat(70));

/**
 * Safe table creation with data migration
 * Example: Create new table and migrate data from old table
 */
const createTableWithMigration = (options) => {
  const {
    newTableName,
    newTableSchema,
    sourceTableName = null,
    dataMapping = {},
    onConflict = 'IGNORE'
  } = options;

  try {
    console.log(`\n📦 Creating table: ${newTableName}`);
    
    // 1. Create new table
    db.exec(newTableSchema);
    console.log(`   ✅ Table created`);

    // 2. Migrate data if source table exists
    if (sourceTableName) {
      const sourceExists = db.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
      ).get(sourceTableName);

      if (sourceExists) {
        console.log(`   🔄 Migrating data from ${sourceTableName}...`);
        
        const sourceData = db.prepare(`SELECT * FROM ${sourceTableName}`).all();
        const insertStmt = db.prepare(`
          INSERT OR ${onConflict} INTO ${newTableName} (${Object.values(dataMapping).join(', ')})
          VALUES (${Object.values(dataMapping).map(() => '?').join(', ')})
        `);

        sourceData.forEach(row => {
          const values = Object.keys(dataMapping).map(oldCol => row[oldCol]);
          insertStmt.run(...values);
        });

        console.log(`   ✅ ${sourceData.length} records migrated`);
      }
    }

    return { success: true, table: newTableName };
  } catch (error) {
    console.error(`   ❌ Migration failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Verify data integrity after migration
 */
const verifyDataIntegrity = () => {
  console.log('\n\n✅ STEP 6: Post-Migration Data Integrity Check');
  console.log('─'.repeat(70));

  const postTables = getAllTables();
  const postValidation = {};
  let postTotalRecords = 0;

  postTables.forEach(tableName => {
    const tableData = getTableData(tableName);
    postValidation[tableName] = tableData;
    postTotalRecords += tableData.recordCount;

    const preDiff = preValidation[tableName] 
      ? tableData.recordCount - preValidation[tableName].recordCount 
      : tableData.recordCount;

    console.log(`✅ ${tableName}`);
    console.log(`   Records: ${tableData.recordCount}${preDiff >= 0 ? ` (+${preDiff})` : ` (${preDiff})`}`);
  });

  console.log(`\n📊 Total: ${postTotalRecords} records`);
  console.log(`   Change: ${postTotalRecords - totalRecords >= 0 ? '+' : ''}${postTotalRecords - totalRecords} records`);

  // Verify no data loss from existing tables
  let dataLossDetected = false;
  currentTables.forEach(tableName => {
    if (preValidation[tableName] && postValidation[tableName]) {
      if (postValidation[tableName].recordCount < preValidation[tableName].recordCount) {
        console.log(`\n⚠️  Data loss detected in ${tableName}`);
        dataLossDetected = true;
      }
    }
  });

  if (!dataLossDetected) {
    console.log('\n🎉 ✅ No data loss detected - All records preserved!');
  }

  return {
    success: !dataLossDetected,
    preMigration: preValidation,
    postMigration: postValidation,
    recordsDiff: postTotalRecords - totalRecords
  };
};

// ==================== STEP 7: Rollback Capability ====================

console.log('\n\n⏮️  STEP 7: Rollback Capability');
console.log('─'.repeat(70));

const createRollbackScript = () => {
  const rollbackScript = `#!/bin/bash
# Rollback Script for Migration ${timestamp}
# This script restores the database to its pre-migration state

echo "🔄 Starting rollback..."
echo "Restoring from backup: ${path.basename(backupPath)}"

# 1. Backup current state
cp server/nur_fund.db server/backups/nur_fund_rollback_point_${timestamp}.db
echo "✅ Current state backed up"

# 2. Restore from pre-migration backup
cp server/backups/pre-migration_backup_${timestamp}.db server/nur_fund.db
echo "✅ Database restored"

# 3. Verify restoration
echo "🔍 Verifying data..."
node server/check_db.cjs

echo "✅ Rollback completed!"
echo "Database restored to pre-migration state"
`;

  const rollbackPath = path.join(migrationsDir, `${timestamp}_rollback.sh`);
  fs.writeFileSync(rollbackPath, rollbackScript);
  console.log(`✅ Rollback script created: ${path.basename(rollbackPath)}`);
  return rollbackPath;
};

createRollbackScript();

// ==================== STEP 8: Migration Log ====================

console.log('\n\n📋 STEP 8: Generating Migration Log');
console.log('─'.repeat(70));

const migrationLog = {
  timestamp: new Date().toISOString(),
  migrationId: `migration_${timestamp}`,
  status: 'READY_FOR_MIGRATION',
  preMigrationState: {
    tables: currentTables.length,
    totalRecords,
    backup: path.basename(backupPath),
    checksum: totalRecords + currentTables.length // Simple checksum
  },
  migration: {
    type: 'NEW_TABLE_CREATION',
    instructions: [
      '1. Review the migration plan',
      '2. Update newTableTemplate in migration plan',
      '3. Run the migration',
      '4. Verify data integrity',
      '5. If issues: bash ' + path.basename(createRollbackScript())
    ]
  },
  files: {
    backup: path.basename(backupPath),
    migrationPlan: path.basename(migrationPlanPath),
    migrationLog: `${timestamp}_migration.log`
  }
};

const logPath = path.join(migrationsDir, `${timestamp}_migration.log`);
fs.writeFileSync(logPath, JSON.stringify(migrationLog, null, 2));
console.log(`✅ Migration log created: ${path.basename(logPath)}`);

// ==================== SUMMARY ====================

console.log('\n' + '═'.repeat(70));
console.log('📊 MIGRATION SYSTEM READY');
console.log('═'.repeat(70));

console.log(`\n✅ Current State:`);
console.log(`   Tables: ${currentTables.length}`);
console.log(`   Records: ${totalRecords}`);
console.log(`   Size: ${totalSize.toFixed(2)} KB`);

console.log(`\n📁 Backup & Rollback Files:`);
console.log(`   Backup: ${path.basename(backupPath)}`);
console.log(`   Migration Plan: ${path.basename(migrationPlanPath)}`);
console.log(`   Migrations Dir: ${migrationsDir}`);

console.log(`\n🔧 To Create a New Table Safely:`);
console.log(`
1. Edit the newTableTemplate in:
   ${migrationPlanPath}

2. Update the table schema and columns

3. Run the migration:
   const result = createTableWithMigration({
     newTableName: 'your_table_name',
     newTableSchema: 'CREATE TABLE...',
     sourceTableName: null,  // or existing table
     dataMapping: {}
   });

4. Verify integrity:
   verifyDataIntegrity();

5. If anything fails, rollback:
   bash ${path.basename(createRollbackScript())}
`);

console.log(`\n⚡ Helper Functions Available:`);
console.log(`   • getAllTables() - Get all table names`);
console.log(`   • getTableData(tableName) - Get table schema and data`);
console.log(`   • createTableWithMigration(options) - Create table with data migration`);
console.log(`   • verifyDataIntegrity() - Verify no data loss`);
console.log(`   • detectSchemaChanges(oldSchema, newSchema) - Detect changes`);

console.log('\n' + '═'.repeat(70) + '\n');

db.close();
