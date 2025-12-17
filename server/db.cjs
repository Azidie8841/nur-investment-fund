const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create or open database
const dbPath = path.join(__dirname, 'nur_fund.db');
const db = new Database(dbPath);

// ==================== DATA SAFETY FUNCTIONS ====================

/**
 * Backup database before making schema changes
 * Creates timestamped backup in backups folder
 */
const backupDatabase = () => {
  try {
    const backupsDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('Z')[0];
    const backupPath = path.join(backupsDir, `nur_fund_backup_${timestamp}.db`);
    
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✓ Database backed up: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error(`✗ Backup failed: ${error.message}`);
    return null;
  }
};

/**
 * Add column to table if it doesn't exist
 * Safely adds new columns without losing data
 */
const addColumnIfNotExists = (tableName, columnName, columnDefinition) => {
  try {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    const columnExists = columns.some(col => col.name === columnName);
    
    if (!columnExists) {
      db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`).run();
      console.log(`✓ Added column ${columnName} to ${tableName}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`✗ Error adding column ${columnName}: ${error.message}`);
    return false;
  }
};

/**
 * Check if table exists
 */
const tableExists = (tableName) => {
  try {
    const result = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(tableName);
    return !!result;
  } catch (error) {
    console.error(`✗ Error checking table: ${error.message}`);
    return false;
  }
};

/**
 * Get table column information
 */
const getTableColumns = (tableName) => {
  try {
    return db.prepare(`PRAGMA table_info(${tableName})`).all();
  } catch (error) {
    console.error(`✗ Error getting columns: ${error.message}`);
    return [];
  }
};

/**
 * Validate table schema matches expected columns
 */
const validateTableSchema = (tableName, expectedColumns) => {
  try {
    const actualColumns = getTableColumns(tableName);
    const actualNames = actualColumns.map(col => col.name);
    
    const missingColumns = expectedColumns.filter(col => !actualNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.warn(`⚠ Table ${tableName} missing columns:`, missingColumns);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`✗ Schema validation error: ${error.message}`);
    return false;
  }
};

/**
 * Execute operation with transaction for data safety
 * Rolls back all changes if any error occurs
 */
const executeTransaction = (operation, description = 'Database operation') => {
  const transaction = db.transaction(operation);
  
  try {
    console.log(`Starting transaction: ${description}`);
    transaction();
    console.log(`✓ Transaction completed: ${description}`);
    return true;
  } catch (error) {
    console.error(`✗ Transaction failed (${description}): ${error.message}`);
    console.error('All changes have been rolled back');
    return false;
  }
};

/**
 * Initialize or upgrade schema version
 */
const initializeSchemaVersion = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      id INTEGER PRIMARY KEY,
      version INTEGER NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  const schemaInfo = db.prepare(`SELECT version FROM schema_version LIMIT 1`).get();
  
  if (!schemaInfo) {
    db.prepare(`INSERT INTO schema_version (version) VALUES (?)`).run(1);
    console.log('✓ Initialized schema version to 1');
  }
  
  return schemaInfo?.version || 1;
};

// Initialize tables
const initializeDb = () => {
  // Initialize schema versioning system first
  initializeSchemaVersion();
  // Equities Companies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS equities_companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      value INTEGER NOT NULL,
      sector TEXT,
      ownership TEXT,
      country TEXT,
      type TEXT DEFAULT 'Index Funds & ETF',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Add type column if it doesn't exist
  addColumnIfNotExists('equities_companies', 'type', "TEXT DEFAULT 'Index Funds & ETF'");

  // Fixed Income Bonds table
  db.exec(`
    CREATE TABLE IF NOT EXISTS fixed_income_bonds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      value REAL NOT NULL,
      bond_type TEXT,
      rating TEXT,
      maturity_date TEXT,
      country TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Asset Monthly Data table
  db.exec(`
    CREATE TABLE IF NOT EXISTS asset_monthly_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_name TEXT NOT NULL,
      jan REAL,
      feb REAL,
      mar REAL,
      apr REAL,
      may REAL,
      jun REAL,
      jul REAL,
      aug REAL,
      sep REAL,
      oct REAL,
      nov REAL,
      dec REAL,
      incorporated TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(asset_name) REFERENCES equities_companies(name),
      UNIQUE(asset_name)
    )
  `);

  // Fixed Income Monthly Data table
  db.exec(`
    CREATE TABLE IF NOT EXISTS fixed_income_monthly_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_name TEXT NOT NULL,
      jan REAL,
      feb REAL,
      mar REAL,
      apr REAL,
      may REAL,
      jun REAL,
      jul REAL,
      aug REAL,
      sep REAL,
      oct REAL,
      nov REAL,
      dec REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(asset_name) REFERENCES fixed_income_bonds(name),
      UNIQUE(asset_name)
    )
  `);

  // Bond Annual Dividend table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bond_annual_dividends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bond_name TEXT NOT NULL,
      year INTEGER NOT NULL,
      dividend_amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(bond_name) REFERENCES fixed_income_bonds(name),
      UNIQUE(bond_name, year)
    )
  `);

  // Bond Monthly Dividend table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bond_monthly_dividends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bond_name TEXT NOT NULL,
      jan REAL,
      feb REAL,
      mar REAL,
      apr REAL,
      may REAL,
      jun REAL,
      jul REAL,
      aug REAL,
      sep REAL,
      oct REAL,
      nov REAL,
      dec REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(bond_name) REFERENCES fixed_income_bonds(name),
      UNIQUE(bond_name)
    )
  `);

  // Bond Monthly Value table (tracks bond price/value changes)
  db.exec(`
    CREATE TABLE IF NOT EXISTS bond_monthly_values (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bond_name TEXT NOT NULL,
      jan REAL,
      feb REAL,
      mar REAL,
      apr REAL,
      may REAL,
      jun REAL,
      jul REAL,
      aug REAL,
      sep REAL,
      oct REAL,
      nov REAL,
      dec REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(bond_name) REFERENCES fixed_income_bonds(name),
      UNIQUE(bond_name)
    )
  `);


  // Performance Data table
  db.exec(`
    CREATE TABLE IF NOT EXISTS performance_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      value INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User Profiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Savings Records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS savings_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      record_date TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Savings Goals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS savings_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      target_date TEXT,
      status TEXT DEFAULT 'Active',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Strategic Plans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS strategic_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      timeframe TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Fund Management table
  db.exec(`
    CREATE TABLE IF NOT EXISTS fund_management (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL DEFAULT 'Savings',
      target_value REAL NOT NULL,
      current_value REAL DEFAULT 0,
      description TEXT,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Allocation Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS allocation_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equities REAL DEFAULT 60,
      fixed_income REAL DEFAULT 30,
      alternatives REAL DEFAULT 8,
      cash REAL DEFAULT 2,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Alternative Investments table (Crypto, Gold, etc.)
  db.exec(`
    CREATE TABLE IF NOT EXISTS alternative_investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      asset_type TEXT NOT NULL,
      platform TEXT,
      allocation REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Check if old schema exists and migrate to new schema
  migrateAlternativeInvestments();

  // Alternative Investment Monthly Data table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alternative_investment_monthly_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      investment_name TEXT NOT NULL,
      jan REAL,
      feb REAL,
      mar REAL,
      apr REAL,
      may REAL,
      jun REAL,
      jul REAL,
      aug REAL,
      sep REAL,
      oct REAL,
      nov REAL,
      dec REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(investment_name) REFERENCES alternative_investments(name),
      UNIQUE(investment_name)
    )
  `);

  // Alternative Allocation Settings table (Bitcoin and Gold allocation percentages)
  db.exec(`
    CREATE TABLE IF NOT EXISTS alternative_allocation_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bitcoin_allocation REAL DEFAULT 50,
      gold_allocation REAL DEFAULT 50,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Alternative Investment Monthly Investments table - CRUD for Monthly Investments (2025)
  db.exec(`
    CREATE TABLE IF NOT EXISTS alternative_investment_monthly_investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      investment_name TEXT NOT NULL,
      month TEXT NOT NULL,
      amount_added REAL DEFAULT 0,
      quantity REAL DEFAULT 0,
      total_invested REAL DEFAULT 0,
      value REAL DEFAULT 0,
      profit REAL GENERATED ALWAYS AS (value - total_invested) STORED,
      return_percentage REAL GENERATED ALWAYS AS (CASE WHEN total_invested > 0 THEN (profit / total_invested * 100) ELSE 0 END) STORED,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(investment_name) REFERENCES alternative_investments(name),
      UNIQUE(investment_name, month)
    )
  `);

  // Monthly Investment Tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS monthly_investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL UNIQUE,
      amount_added REAL DEFAULT 0,
      total_invested REAL DEFAULT 0,
      value REAL DEFAULT 0,
      profit REAL GENERATED ALWAYS AS (value - total_invested) STORED,
      return_percentage REAL GENERATED ALWAYS AS (CASE WHEN total_invested > 0 THEN (profit / total_invested * 100) ELSE 0 END) STORED,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Check if tables have data, if not insert defaults
  const companiesCount = db.prepare('SELECT COUNT(*) as count FROM equities_companies').get().count;
  
  if (companiesCount === 0) {
    const insertCompany = db.prepare(`
      INSERT INTO equities_companies (name, value, sector, ownership, country)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertCompany.run('Equity ETF', 250000, 'ETF', '—', 'United States');
    insertCompany.run('Apple', 150000, 'Technology', '—', 'United States');
    insertCompany.run('NVIDIA', 120000, 'Technology', '—', 'United States');
    insertCompany.run('SPUS ETF', 120000, 'ETF', '—', 'United States');
  }

  const monthlyCount = db.prepare('SELECT COUNT(*) as count FROM asset_monthly_data').get().count;
  
  if (monthlyCount === 0) {
    const insertMonthly = db.prepare(`
      INSERT INTO asset_monthly_data (asset_name, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec, incorporated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertMonthly.run('Equity ETF', 250000, 255000, 260000, 265000, 270000, 275000, 280000, 278000, 285000, 290000, 295000, 250000, 'Luxembourg');
    insertMonthly.run('Apple', 140000, 142000, 144000, 146000, 148000, 150000, 152000, 151000, 153000, 155000, 157000, 150000, 'United States');
    insertMonthly.run('NVIDIA', 110000, 112000, 114000, 116000, 118000, 120000, 122000, 121000, 123000, 125000, 127000, 120000, 'United States');
    insertMonthly.run('SPUS ETF', 110000, 112000, 114000, 116000, 118000, 120000, 122000, 121000, 123000, 125000, 127000, 120000, 'United States');
  }

  const performanceCount = db.prepare('SELECT COUNT(*) as count FROM performance_data').get().count;
  
  if (performanceCount === 0) {
    const insertPerformance = db.prepare(`
      INSERT INTO performance_data (month, value)
      VALUES (?, ?)
    `);

    insertPerformance.run('Jan', 950000);
    insertPerformance.run('Feb', 980000);
    insertPerformance.run('Mar', 1020000);
    insertPerformance.run('Apr', 1050000);
    insertPerformance.run('May', 1080000);
    insertPerformance.run('Jun', 1150000);
    insertPerformance.run('Jul', 1200000);
    insertPerformance.run('Aug', 1180000);
    insertPerformance.run('Sep', 1250000);
    insertPerformance.run('Oct', 1320000);
    insertPerformance.run('Nov', 1380000);
    insertPerformance.run('Dec', 1450000);
  }

  const userCount = db.prepare('SELECT COUNT(*) as count FROM user_profiles').get().count;
  
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO user_profiles (name, email, role)
      VALUES (?, ?, ?)
    `);

    insertUser.run('Family Member', 'family@example.com', 'admin');
    insertUser.run('Investor A', 'investorA@example.com', 'user');
    insertUser.run('Investor B', 'investorB@example.com', 'user');
  }

  const savingsRecordCount = db.prepare('SELECT COUNT(*) as count FROM savings_records').get().count;
  
  if (savingsRecordCount === 0) {
    const insertRecord = db.prepare(`
      INSERT INTO savings_records (amount, record_date, notes)
      VALUES (?, ?, ?)
    `);

    insertRecord.run(5000, '2025-12-01', 'Monthly savings contribution');
    insertRecord.run(5000, '2025-11-01', 'Monthly savings contribution');
    insertRecord.run(5000, '2025-10-01', 'Monthly savings contribution');
    insertRecord.run(5000, '2025-09-01', 'Monthly savings contribution');
    insertRecord.run(5000, '2025-08-01', 'Monthly savings contribution');
  }

  const savingsGoalCount = db.prepare('SELECT COUNT(*) as count FROM savings_goals').get().count;
  
  if (savingsGoalCount === 0) {
    const insertGoal = db.prepare(`
      INSERT INTO savings_goals (goal_name, target_amount, target_date, status, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertGoal.run('Primary Goal', 500000, '2031-12-31', 'Active', 'Long-term wealth accumulation');
    insertGoal.run('Emergency Fund', 50000, '2025-12-31', 'On Track', 'Emergency savings for 6 months');
  }

  // Monthly Investment Tracking data
  const monthlyInvestmentCount = db.prepare('SELECT COUNT(*) as count FROM monthly_investments').get().count;
  
  if (monthlyInvestmentCount === 0) {
    const insertMonthlyInvestment = db.prepare(`
      INSERT INTO monthly_investments (month, amount_added, total_invested, value)
      VALUES (?, ?, ?, ?)
    `);

    // Sample data for 2025
    insertMonthlyInvestment.run('Jan', 300, 300, 310);
    insertMonthlyInvestment.run('Feb', 300, 600, 630);
    insertMonthlyInvestment.run('Mar', 300, 900, 960);
    insertMonthlyInvestment.run('Apr', 300, 1200, 1300);
    insertMonthlyInvestment.run('May', 300, 1500, 1650);
    insertMonthlyInvestment.run('Jun', 300, 1800, 2010);
    insertMonthlyInvestment.run('Jul', 300, 2100, 2400);
    insertMonthlyInvestment.run('Aug', 300, 2400, 2760);
    insertMonthlyInvestment.run('Sep', 300, 2700, 3150);
    insertMonthlyInvestment.run('Oct', 300, 3000, 3570);
    insertMonthlyInvestment.run('Nov', 300, 3300, 4020);
    insertMonthlyInvestment.run('Dec', 300, 3600, 4500);
  }
  
  // Create strategic plans table safely
  createStrategicPlansTableSafely();
};

// ==================== MIGRATION FUNCTIONS ====================

/**
 * Migrate alternative_investments table if schema changed
 * Preserves all existing data during migration
 */
const migrateAlternativeInvestments = () => {
  try {
    const tableInfo = db.prepare('PRAGMA table_info(alternative_investments)').all();
    const columnNames = tableInfo.map(col => col.name);
    
    // Check if allocation column exists
    if (!columnNames.includes('allocation')) {
      console.log('Adding allocation column to alternative_investments table');
      
      executeTransaction(() => {
        // Create backup
        backupDatabase();
        
        // Create new table with correct schema
        db.exec(`
          CREATE TABLE alternative_investments_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            asset_type TEXT NOT NULL,
            platform TEXT,
            quantity REAL,
            unit_price REAL,
            current_value REAL NOT NULL,
            cost REAL,
            allocation REAL DEFAULT 0,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Copy existing data, setting allocation to 0 for all rows
        db.exec(`
          INSERT INTO alternative_investments_new 
          SELECT id, name, asset_type, platform, quantity, unit_price, current_value, cost, 0, notes, created_at, updated_at
          FROM alternative_investments
        `);
        
        // Drop old table and rename new one
        db.exec(`DROP TABLE alternative_investments`);
        db.exec(`ALTER TABLE alternative_investments_new RENAME TO alternative_investments`);
        
        console.log('✓ Allocation column added successfully');
      }, 'Add allocation column to alternative_investments');
    }

    // Remove unused columns (current_value, quantity, unit_price, cost, notes) and keep only name, asset_type, platform, allocation
    const columnsToCheck = db.prepare(`PRAGMA table_info(alternative_investments)`).all();
    const hasCurrentValue = columnsToCheck.some(col => col.name === 'current_value');
    
    if (hasCurrentValue) {
      console.log('Cleaning up alternative_investments table schema - removing unused columns');
      
      executeTransaction(() => {
        // Create backup
        backupDatabase();
        
        // Create new table with simplified schema
        db.exec(`
          CREATE TABLE alternative_investments_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            asset_type TEXT NOT NULL,
            platform TEXT,
            allocation REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Copy existing data with simplified columns
        db.exec(`
          INSERT INTO alternative_investments_new (id, name, asset_type, platform, allocation, created_at, updated_at)
          SELECT id, name, asset_type, platform, allocation, created_at, updated_at
          FROM alternative_investments
        `);
        
        // Drop old table and rename new one
        db.exec(`DROP TABLE alternative_investments`);
        db.exec(`ALTER TABLE alternative_investments_new RENAME TO alternative_investments`);
        
        console.log('✓ Alternative investments table schema simplified successfully');
      }, 'Clean up alternative_investments table schema');
    }
  } catch (error) {
    console.error(`Migration error: ${error.message}`);
  }
};

/**
 * Create strategic plans table safely
 */
const createStrategicPlansTableSafely = () => {
  executeTransaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS strategic_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        timeframe TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✓ Strategic plans table ready');
  }, 'Create strategic_plans table');
};

// ==================== FUND MANAGEMENT CRUD ====================

/**
 * Get all funds
 */
const getAllFunds = () => {
  try {
    return db.prepare('SELECT * FROM fund_management ORDER BY created_at DESC').all();
  } catch (error) {
    console.error('Error getting funds:', error.message);
    return [];
  }
};

/**
 * Get fund by ID
 */
const getFundById = (id) => {
  try {
    return db.prepare('SELECT * FROM fund_management WHERE id = ?').get(id);
  } catch (error) {
    console.error('Error getting fund:', error.message);
    return null;
  }
};

/**
 * Create new fund
 */
const createFund = (name, type, targetValue, currentValue = 0, description = '') => {
  try {
    const stmt = db.prepare(`
      INSERT INTO fund_management (name, type, target_value, current_value, description, status)
      VALUES (?, ?, ?, ?, ?, 'Active')
    `);
    const result = stmt.run(name, type, targetValue, currentValue, description);
    console.log(`✓ Fund created: ${name}`);
    return { id: result.lastInsertRowid, name, type, target_value: targetValue, current_value: currentValue, description, status: 'Active' };
  } catch (error) {
    console.error('Error creating fund:', error.message);
    return null;
  }
};

/**
 * Update fund
 */
const updateFund = (id, name, type, targetValue, currentValue, description, status) => {
  try {
    const stmt = db.prepare(`
      UPDATE fund_management 
      SET name = ?, type = ?, target_value = ?, current_value = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(name, type, targetValue, currentValue, description, status, id);
    console.log(`✓ Fund updated: ${name}`);
    return getFundById(id);
  } catch (error) {
    console.error('Error updating fund:', error.message);
    return null;
  }
};

/**
 * Delete fund
 */
const deleteFund = (id) => {
  try {
    const fund = getFundById(id);
    const stmt = db.prepare('DELETE FROM fund_management WHERE id = ?');
    stmt.run(id);
    console.log(`✓ Fund deleted: ${fund?.name || id}`);
    return true;
  } catch (error) {
    console.error('Error deleting fund:', error.message);
    return false;
  }
};

/**
 * Update fund current value
 */
const updateFundCurrentValue = (id, currentValue) => {
  try {
    const stmt = db.prepare(`
      UPDATE fund_management 
      SET current_value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(currentValue, id);
    return getFundById(id);
  } catch (error) {
    console.error('Error updating fund value:', error.message);
    return null;
  }
};

/**
 * Get current allocation settings
 */
const getAllocationSettings = () => {
  try {
    const stmt = db.prepare('SELECT * FROM allocation_settings LIMIT 1');
    let settings = stmt.get();
    
    // If no settings exist, create default ones
    if (!settings) {
      const insertStmt = db.prepare(`
        INSERT INTO allocation_settings (equities, fixed_income, alternatives, cash)
        VALUES (60, 30, 8, 2)
      `);
      insertStmt.run();
      settings = stmt.get();
    }
    
    return settings;
  } catch (error) {
    console.error('Error getting allocation settings:', error.message);
    return { equities: 60, fixed_income: 30, alternatives: 8, cash: 2 };
  }
};

/**
 * Update allocation settings
 */
const updateAllocationSettings = (equities, fixedIncome, alternatives, cash) => {
  try {
    const stmt = db.prepare(`
      UPDATE allocation_settings 
      SET equities = ?, fixed_income = ?, alternatives = ?, cash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM allocation_settings LIMIT 1)
    `);
    stmt.run(equities, fixedIncome, alternatives, cash);
    console.log(`✓ Allocation settings updated: ${equities}% / ${fixedIncome}% / ${alternatives}% / ${cash}%`);
    return getAllocationSettings();
  } catch (error) {
    console.error('Error updating allocation settings:', error.message);
    return null;
  }
};

/**
 * Get current alternative allocation settings (Bitcoin and Gold)
 */
const getAlternativeAllocationSettings = () => {
  try {
    const stmt = db.prepare('SELECT * FROM alternative_allocation_settings LIMIT 1');
    let settings = stmt.get();
    
    // If no settings exist, create default ones
    if (!settings) {
      const insertStmt = db.prepare(`
        INSERT INTO alternative_allocation_settings (bitcoin_allocation, gold_allocation)
        VALUES (50, 50)
      `);
      insertStmt.run();
      settings = stmt.get();
    }
    
    return settings;
  } catch (error) {
    console.error('Error getting alternative allocation settings:', error.message);
    return { bitcoin_allocation: 50, gold_allocation: 50 };
  }
};

/**
 * Update alternative allocation settings (Bitcoin and Gold)
 */
const updateAlternativeAllocationSettings = (bitcoinAllocation, goldAllocation) => {
  try {
    const stmt = db.prepare(`
      UPDATE alternative_allocation_settings 
      SET bitcoin_allocation = ?, gold_allocation = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM alternative_allocation_settings LIMIT 1)
    `);
    stmt.run(bitcoinAllocation, goldAllocation);
    console.log(`✓ Alternative allocation settings updated: Bitcoin ${bitcoinAllocation}% / Gold ${goldAllocation}%`);
    return getAlternativeAllocationSettings();
  } catch (error) {
    console.error('Error updating alternative allocation settings:', error.message);
    return null;
  }
};

// ==================== ALTERNATIVE INVESTMENT MONTHLY INVESTMENTS CRUD ====================

/**
 * Get all monthly investments for a specific alternative investment
 */
const getAlternativeInvestmentMonthlyInvestments = (investmentName) => {
  try {
    const stmt = db.prepare(`
      SELECT id, investment_name, month, amount_added, quantity, total_invested, value, profit, return_percentage, created_at, updated_at
      FROM alternative_investment_monthly_investments
      WHERE investment_name = ?
      ORDER BY 
        CASE month
          WHEN 'January' THEN 1 WHEN 'Feb' THEN 2 WHEN 'March' THEN 3 WHEN 'April' THEN 4
          WHEN 'May' THEN 5 WHEN 'June' THEN 6 WHEN 'July' THEN 7 WHEN 'August' THEN 8
          WHEN 'September' THEN 9 WHEN 'Oct' THEN 10 WHEN 'November' THEN 11 WHEN 'December' THEN 12
          WHEN 'Jan' THEN 1 WHEN 'Feb' THEN 2 WHEN 'Mar' THEN 3 WHEN 'Apr' THEN 4
          WHEN 'May' THEN 5 WHEN 'Jun' THEN 6 WHEN 'Jul' THEN 7 WHEN 'Aug' THEN 8
          WHEN 'Sep' THEN 9 WHEN 'Oct' THEN 10 WHEN 'Nov' THEN 11 WHEN 'Dec' THEN 12
        END ASC
    `);
    return stmt.all(investmentName);
  } catch (error) {
    console.error('Error fetching alternative investment monthly investments:', error.message);
    return [];
  }
};

/**
 * Create a new monthly investment entry for alternative investment
 */
const createAlternativeInvestmentMonthlyInvestment = (investmentName, month, amountAdded, quantity, totalInvested, value) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO alternative_investment_monthly_investments 
      (investment_name, month, amount_added, quantity, total_invested, value)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(investmentName, month, amountAdded || 0, quantity || 0, totalInvested || 0, value || 0);
    console.log(`✓ Created monthly investment for ${investmentName} - ${month}`);
    return { id: result.lastInsertRowid, investment_name: investmentName, month, amount_added: amountAdded, quantity, total_invested: totalInvested, value };
  } catch (error) {
    console.error('Error creating alternative investment monthly investment:', error.message);
    throw error;
  }
};

/**
 * Update a monthly investment entry for alternative investment
 */
const updateAlternativeInvestmentMonthlyInvestment = (id, amountAdded, quantity, totalInvested, value) => {
  try {
    const stmt = db.prepare(`
      UPDATE alternative_investment_monthly_investments
      SET amount_added = ?, quantity = ?, total_invested = ?, value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(amountAdded || 0, quantity || 0, totalInvested || 0, value || 0, id);
    console.log(`✓ Updated monthly investment (ID: ${id})`);
    
    // Fetch and return updated record
    const updated = db.prepare('SELECT * FROM alternative_investment_monthly_investments WHERE id = ?').get(id);
    return updated;
  } catch (error) {
    console.error('Error updating alternative investment monthly investment:', error.message);
    throw error;
  }
};

/**
 * Delete a monthly investment entry for alternative investment
 */
const deleteAlternativeInvestmentMonthlyInvestment = (id) => {
  try {
    const stmt = db.prepare('DELETE FROM alternative_investment_monthly_investments WHERE id = ?');
    stmt.run(id);
    console.log(`✓ Deleted monthly investment (ID: ${id})`);
    return true;
  } catch (error) {
    console.error('Error deleting alternative investment monthly investment:', error.message);
    throw error;
  }
};

/**
 * Get a single monthly investment by ID
 */
const getAlternativeInvestmentMonthlyInvestmentById = (id) => {
  try {
    const stmt = db.prepare('SELECT * FROM alternative_investment_monthly_investments WHERE id = ?');
    return stmt.get(id);
  } catch (error) {
    console.error('Error fetching monthly investment by ID:', error.message);
    return null;
  }
};


// ==================== INITIALIZATION ====================

module.exports = { 
  db, 
  initializeDb,
  backupDatabase,
  addColumnIfNotExists,
  tableExists,
  getTableColumns,
  validateTableSchema,
  executeTransaction,
  initializeSchemaVersion,
  migrateAlternativeInvestments,
  createStrategicPlansTableSafely,
  // Fund Management CRUD
  getAllFunds,
  getFundById,
  createFund,
  updateFund,
  deleteFund,
  updateFundCurrentValue,
  // Allocation Settings
  getAllocationSettings,
  updateAllocationSettings,
  // Alternative Allocation Settings
  getAlternativeAllocationSettings,
  updateAlternativeAllocationSettings,
  // Alternative Investment Monthly Investments CRUD
  getAlternativeInvestmentMonthlyInvestments,
  createAlternativeInvestmentMonthlyInvestment,
  updateAlternativeInvestmentMonthlyInvestment,
  deleteAlternativeInvestmentMonthlyInvestment,
  getAlternativeInvestmentMonthlyInvestmentById
};
