const Database = require('better-sqlite3');
const path = require('path');

// Create or open database
const dbPath = path.join(__dirname, 'nur_fund.db');
const db = new Database(dbPath);

// Initialize tables
const initializeDb = () => {
  // Equities Companies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS equities_companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      value INTEGER NOT NULL,
      sector TEXT,
      ownership TEXT,
      country TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

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

  // Alternative Investments table (Crypto, Gold, etc.)
  db.exec(`
    CREATE TABLE IF NOT EXISTS alternative_investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      asset_type TEXT NOT NULL,
      platform TEXT,
      quantity REAL,
      unit_price REAL,
      current_value REAL NOT NULL,
      cost REAL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Check if old schema exists and migrate to new schema
  const tableInfo = db.prepare('PRAGMA table_info(alternative_investments)').all();
  const hasOldUnit = tableInfo.some(col => col.name === 'unit');
  const hasPlatform = tableInfo.some(col => col.name === 'platform');
  const hasUnitPrice = tableInfo.some(col => col.name === 'unit_price');
  const hasCost = tableInfo.some(col => col.name === 'cost');

  if (hasOldUnit && !hasPlatform) {
    console.log('Migrating alternative_investments table schema...');
    try {
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
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Copy data from old table
      db.exec(`
        INSERT INTO alternative_investments_new (id, name, asset_type, quantity, current_value, notes, created_at, updated_at)
        SELECT id, name, asset_type, quantity, current_value, notes, created_at, updated_at FROM alternative_investments
      `);
      
      // Drop old table and rename new one
      db.exec(`DROP TABLE alternative_investments`);
      db.exec(`ALTER TABLE alternative_investments_new RENAME TO alternative_investments`);
      
      console.log('✓ Migration completed successfully');
    } catch (err) {
      console.error('Migration error:', err.message);
    }
  } else if (!hasPlatform) {
    console.log('Adding missing columns to alternative_investments...');
    const addColumnIfNotExists = (columnName, columnType) => {
      try {
        db.prepare(`ALTER TABLE alternative_investments ADD COLUMN ${columnName} ${columnType}`).run();
        console.log(`✓ Added column ${columnName}`);
      } catch (err) {
        console.log(`Column ${columnName} already exists or error: ${err.message}`);
      }
    };

    addColumnIfNotExists('platform', 'TEXT');
    addColumnIfNotExists('unit_price', 'REAL');
    addColumnIfNotExists('cost', 'REAL');
  } else {
    console.log('✓ alternative_investments table schema is up to date');
  }

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
};

module.exports = { db, initializeDb };
