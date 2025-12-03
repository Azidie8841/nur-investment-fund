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
};

module.exports = { db, initializeDb };
