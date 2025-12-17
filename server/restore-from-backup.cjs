const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'nur_fund.db');
const DEPLOYMENTS_DIR = path.join(__dirname, 'deployments');

// Get the latest backup file
const getLatestBackup = () => {
  try {
    const files = fs.readdirSync(DEPLOYMENTS_DIR)
      .filter(f => f.endsWith('_data_export.json'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.error('❌ No backup files found in deployments/');
      return null;
    }
    
    const latestFile = files[0];
    const filePath = path.join(DEPLOYMENTS_DIR, latestFile);
    console.log(`📦 Found latest backup: ${latestFile}`);
    
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error('❌ Error reading backup:', error.message);
    return null;
  }
};

// Restore data from backup
const restoreFromBackup = () => {
  try {
    console.log('\n════════════════════════════════════════════');
    console.log('   Database Restore from Backup');
    console.log('════════════════════════════════════════════\n');
    
    const backup = getLatestBackup();
    if (!backup || !backup.tables) {
      console.error('❌ Invalid backup data');
      process.exit(1);
    }
    
    const db = new Database(DB_PATH);
    
    // Disable foreign keys during restore
    db.pragma('foreign_keys = OFF');
    
    console.log(`⏰ Backup timestamp: ${backup.timestamp}`);
    console.log(`📊 Tables in backup: ${Object.keys(backup.tables).length}\n`);
    
    let totalRestored = 0;
    
    // Process each table from backup
    for (const [tableName, tableData] of Object.entries(backup.tables)) {
      // Skip if no data
      if (!tableData || !tableData.data || tableData.data.length === 0) {
        console.log(`⊘ Table "${tableName}": No data`);
        continue;
      }
      
      try {
        // Get column names from first record
        const columns = Object.keys(tableData.data[0]);
        
        // Clear existing data
        db.prepare(`DELETE FROM ${tableName}`).run();
        
        // Prepare insert statement
        const placeholders = columns.map(() => '?').join(', ');
        const insertStmt = db.prepare(
          `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`
        );
        
        // Insert all records
        for (const record of tableData.data) {
          const values = columns.map(col => record[col]);
          insertStmt.run(...values);
        }
        
        console.log(`✓ Restored "${tableName}": ${tableData.data.length} records`);
        totalRestored += tableData.data.length;
      } catch (error) {
        console.log(`⚠ "${tableName}": ${error.message}`);
      }
    }
    
    // Re-enable foreign keys
    db.pragma('foreign_keys = ON');
    
    console.log(`\n✅ Restore complete!`);
    console.log(`📈 Total records restored: ${totalRestored}`);
    console.log(`📍 Database: ${DB_PATH}\n`);
    
    db.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
  }
};

// Run restore
restoreFromBackup();
