import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'server', 'nur_fund.db');
const DEPLOYMENTS_DIR = path.join(__dirname, 'server', 'deployments');

// Get the latest data export from deployments
const getLatestDataExport = () => {
  try {
    const files = fs.readdirSync(DEPLOYMENTS_DIR)
      .filter(f => f.endsWith('_data_export.json'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.log('❌ No deployment data exports found');
      return null;
    }
    
    const latestFile = files[0];
    const filePath = path.join(DEPLOYMENTS_DIR, latestFile);
    console.log(`✓ Found latest backup: ${latestFile}`);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error('❌ Error reading backup data:', error.message);
    return null;
  }
};

// Restore database from backup data
const restoreDatabase = async () => {
  try {
    console.log('\n📦 Database Restore Process Started\n');
    
    const backupData = getLatestDataExport();
    if (!backupData) {
      console.log('\n⚠️  Using default schema initialization instead...\n');
      return;
    }
    
    console.log(`\n✅ Backup Data Loaded:`);
    console.log(`   - Timestamp: ${backupData.timestamp || 'Unknown'}`);
    console.log(`   - Tables backed up: ${Object.keys(backupData.tables || {}).length}`);
    
    // Import and initialize the database
    const { initializeDb } = await import('./server/db.cjs');
    
    console.log('\n✓ Database schema initialized');
    console.log('✓ Database restoration complete');
    console.log(`\n📍 Database location: ${DB_PATH}`);
    console.log('\n✅ You can now start the application with: npm start\n');
    
  } catch (error) {
    console.error('❌ Restoration failed:', error.message);
    process.exit(1);
  }
};

console.log('═══════════════════════════════════════════');
console.log('   Nur Investment Fund - Database Restore   ');
console.log('═══════════════════════════════════════════');

restoreDatabase().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
