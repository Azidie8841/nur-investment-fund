const fs = require('fs');
const path = require('path');

const BACKUPS_DIR = path.join(__dirname, 'backups');
const DB_PATH = path.join(__dirname, 'nur_fund.db');

// Ensure backups directory exists
const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
};

// Create automatic backup
const createBackup = () => {
  try {
    ensureBackupDir();
    if (fs.existsSync(DB_PATH)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(BACKUPS_DIR, `nur_fund_backup_${timestamp}.db`);
      fs.copyFileSync(DB_PATH, backupPath);
      console.log(`✓ Backup created: ${backupPath}`);
      return backupPath;
    }
  } catch (error) {
    console.error('Backup creation failed:', error);
  }
};

// Get list of all backups
const listBackups = () => {
  try {
    ensureBackupDir();
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.startsWith('nur_fund_backup_') && f.endsWith('.db'))
      .sort()
      .reverse();
    return files.map(f => ({
      name: f,
      path: path.join(BACKUPS_DIR, f),
      date: f.replace('nur_fund_backup_', '').replace('.db', '')
    }));
  } catch (error) {
    console.error('Failed to list backups:', error);
    return [];
  }
};

// Restore from backup
const restoreBackup = (backupName) => {
  try {
    const backupPath = path.join(BACKUPS_DIR, backupName);
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupName}`);
    }
    fs.copyFileSync(backupPath, DB_PATH);
    console.log(`✓ Database restored from: ${backupName}`);
    return true;
  } catch (error) {
    console.error('Restore failed:', error);
    return false;
  }
};

// Clean old backups (keep last 10)
const cleanOldBackups = () => {
  try {
    const backups = listBackups();
    if (backups.length > 10) {
      const toDelete = backups.slice(10);
      toDelete.forEach(backup => {
        fs.unlinkSync(backup.path);
        console.log(`✓ Deleted old backup: ${backup.name}`);
      });
    }
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
};

module.exports = { createBackup, listBackups, restoreBackup, cleanOldBackups };
