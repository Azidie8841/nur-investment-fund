// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { db, initializeDb } = require('./db.cjs');
const { createBackup, listBackups, restoreBackup, cleanOldBackups } = require('./backup.cjs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database with error handling
try {
  initializeDb();
} catch (error) {
  console.error('⚠️  Database initialization error:', error.message);
  // Continue running despite initialization error
}

// ===== Equities Companies Routes =====
app.get('/api/equities-companies', (req, res) => {
  try {
    const companies = db.prepare('SELECT * FROM equities_companies ORDER BY id DESC').all();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/equities-companies', (req, res) => {
  try {
    const { name, value, sector, ownership, country } = req.body;
    const stmt = db.prepare(`
      INSERT INTO equities_companies (name, value, sector, ownership, country)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, value, sector, ownership, country);
    res.json({ id: result.lastInsertRowid, name, value, sector, ownership, country });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/equities-companies/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, value, sector, ownership, country } = req.body;
    db.prepare(`
      UPDATE equities_companies
      SET name = ?, value = ?, sector = ?, ownership = ?, country = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, value, sector, ownership, country, id);
    res.json({ id, name, value, sector, ownership, country });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/equities-companies/:id', (req, res) => {
  try {
    const { id } = req.params;
    // First delete related monthly data
    db.prepare('DELETE FROM asset_monthly_data WHERE asset_name = (SELECT name FROM equities_companies WHERE id = ?)').run(id);
    // Then delete the company
    db.prepare('DELETE FROM equities_companies WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Fixed Income Bonds Routes =====
app.get('/api/fixed-income-bonds', (req, res) => {
  try {
    const bonds = db.prepare('SELECT * FROM fixed_income_bonds ORDER BY id DESC').all();
    res.json(bonds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fixed-income-bonds', (req, res) => {
  try {
    const { name, value, bond_type, rating, maturity_date, country } = req.body;
    const stmt = db.prepare(`
      INSERT INTO fixed_income_bonds (name, value, bond_type, rating, maturity_date, country)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, value, bond_type, rating, maturity_date, country);
    res.json({ id: result.lastInsertRowid, name, value, bond_type, rating, maturity_date, country });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/fixed-income-bonds/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, value, bond_type, rating, maturity_date, country } = req.body;
    db.prepare(`
      UPDATE fixed_income_bonds
      SET name = ?, value = ?, bond_type = ?, rating = ?, maturity_date = ?, country = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, value, bond_type, rating, maturity_date, country, id);
    res.json({ id, name, value, bond_type, rating, maturity_date, country });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/fixed-income-bonds/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM fixed_income_bonds WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Asset Monthly Data Routes =====
app.get('/api/asset-monthly-data', (req, res) => {
  try {
    const data = db.prepare('SELECT * FROM asset_monthly_data ORDER BY asset_name').all();
    // Convert to object format { assetName: { jan, feb, ... } }
    const result = {};
    data.forEach(row => {
      result[row.asset_name] = {
        jan: row.jan,
        feb: row.feb,
        mar: row.mar,
        apr: row.apr,
        may: row.may,
        jun: row.jun,
        jul: row.jul,
        aug: row.aug,
        sep: row.sep,
        oct: row.oct,
        nov: row.nov,
        dec: row.dec,
        incorporated: row.incorporated
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/asset-monthly-data/:assetName', (req, res) => {
  try {
    const { assetName } = req.params;
    const { jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec, incorporated } = req.body;
    
    // Check if exists
    const existing = db.prepare('SELECT id FROM asset_monthly_data WHERE asset_name = ?').get(assetName);
    
    if (existing) {
      db.prepare(`
        UPDATE asset_monthly_data
        SET jan = ?, feb = ?, mar = ?, apr = ?, may = ?, jun = ?, jul = ?, aug = ?, sep = ?, oct = ?, nov = ?, dec = ?, incorporated = ?, updated_at = CURRENT_TIMESTAMP
        WHERE asset_name = ?
      `).run(jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec, incorporated, assetName);
    } else {
      db.prepare(`
        INSERT INTO asset_monthly_data (asset_name, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec, incorporated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(assetName, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec, incorporated);
    }
    
    res.json({ asset_name: assetName, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec, incorporated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Performance Data Routes =====
app.get('/api/performance-data', (req, res) => {
  try {
    const data = db.prepare('SELECT month, value FROM performance_data ORDER BY id').all();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== User Profiles Routes =====
app.get('/api/user-profiles', (req, res) => {
  try {
    const profiles = db.prepare('SELECT id, name, email, role FROM user_profiles ORDER BY id DESC').all();
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user-profiles', (req, res) => {
  try {
    const { name, email, role } = req.body;
    const stmt = db.prepare(`
      INSERT INTO user_profiles (name, email, role)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(name, email, role);
    res.json({ id: result.lastInsertRowid, name, email, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user-profiles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    db.prepare(`
      UPDATE user_profiles
      SET name = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, email, role, id);
    res.json({ id, name, email, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/user-profiles/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM user_profiles WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Savings Records Routes =====
app.get('/api/savings-records', (req, res) => {
  try {
    const records = db.prepare('SELECT * FROM savings_records ORDER BY record_date DESC').all();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/savings-records', (req, res) => {
  try {
    const { amount, record_date, notes } = req.body;
    const stmt = db.prepare(`
      INSERT INTO savings_records (amount, record_date, notes)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(amount, record_date, notes);
    res.json({ id: result.lastInsertRowid, amount, record_date, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/savings-records/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { amount, record_date, notes } = req.body;
    const stmt = db.prepare(`
      UPDATE savings_records 
      SET amount = ?, record_date = ?, notes = ?
      WHERE id = ?
    `);
    stmt.run(amount, record_date || new Date().toISOString(), notes || null, id);
    res.json({ success: true, id, amount, record_date, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/savings-records/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM savings_records WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Savings Goals Routes =====
app.get('/api/savings-goals', (req, res) => {
  try {
    const goals = db.prepare('SELECT * FROM savings_goals ORDER BY target_date DESC').all();
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/savings-goals', (req, res) => {
  try {
    const { goal_name, target_amount, target_date, description } = req.body;
    const stmt = db.prepare(`
      INSERT INTO savings_goals (goal_name, target_amount, target_date, status, description)
      VALUES (?, ?, ?, 'Active', ?)
    `);
    const result = stmt.run(goal_name, target_amount, target_date, description);
    res.json({ id: result.lastInsertRowid, goal_name, target_amount, target_date, status: 'Active', description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/savings-goals/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { goal_name, target_amount, target_date, status, description } = req.body;
    db.prepare(`
      UPDATE savings_goals SET goal_name = ?, target_amount = ?, target_date = ?, status = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(goal_name, target_amount, target_date, status, description, id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/savings-goals/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM savings_goals WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Fixed Income Monthly Data Routes =====
app.get('/api/fixed-income-monthly-data', (req, res) => {
  try {
    const data = db.prepare('SELECT * FROM fixed_income_monthly_data ORDER BY asset_name').all();
    // Convert to object format { assetName: { jan, feb, ... } }
    const result = {};
    data.forEach(row => {
      result[row.asset_name] = {
        jan: row.jan,
        feb: row.feb,
        mar: row.mar,
        apr: row.apr,
        may: row.may,
        jun: row.jun,
        jul: row.jul,
        aug: row.aug,
        sep: row.sep,
        oct: row.oct,
        nov: row.nov,
        dec: row.dec
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/fixed-income-monthly-data/:assetName', (req, res) => {
  try {
    const { assetName } = req.params;
    const { jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec } = req.body;
    
    // Check if exists
    const existing = db.prepare('SELECT id FROM fixed_income_monthly_data WHERE asset_name = ?').get(assetName);
    
    if (existing) {
      db.prepare(`
        UPDATE fixed_income_monthly_data
        SET jan = ?, feb = ?, mar = ?, apr = ?, may = ?, jun = ?, jul = ?, aug = ?, sep = ?, oct = ?, nov = ?, dec = ?, updated_at = CURRENT_TIMESTAMP
        WHERE asset_name = ?
      `).run(jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec, assetName);
    } else {
      db.prepare(`
        INSERT INTO fixed_income_monthly_data (asset_name, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(assetName, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec);
    }
    
    res.json({ asset_name: assetName, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bond Annual Dividends endpoints
app.get('/api/bond-dividends/:bondName', (req, res) => {
  try {
    const { bondName } = req.params;
    const data = db.prepare('SELECT * FROM bond_annual_dividends WHERE bond_name = ? ORDER BY year DESC').all(bondName);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bond-dividends', (req, res) => {
  try {
    const { bondName, year, dividendAmount } = req.body;
    const existing = db.prepare('SELECT id FROM bond_annual_dividends WHERE bond_name = ? AND year = ?').get(bondName, year);
    
    if (existing) {
      db.prepare('UPDATE bond_annual_dividends SET dividend_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE bond_name = ? AND year = ?')
        .run(dividendAmount, bondName, year);
    } else {
      db.prepare('INSERT INTO bond_annual_dividends (bond_name, year, dividend_amount) VALUES (?, ?, ?)')
        .run(bondName, year, dividendAmount);
    }
    
    res.json({ bondName, year, dividendAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/bond-dividends/:bondName/:year', (req, res) => {
  try {
    const { bondName, year } = req.params;
    db.prepare('DELETE FROM bond_annual_dividends WHERE bond_name = ? AND year = ?').run(bondName, parseInt(year));
    res.json({ success: true, message: 'Dividend record deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bond Monthly Dividends endpoints
app.get('/api/bond-monthly-dividends', (req, res) => {
  try {
    const data = db.prepare('SELECT * FROM bond_monthly_dividends ORDER BY bond_name').all();
    const result = {};
    data.forEach(row => {
      result[row.bond_name] = {
        jan: row.jan,
        feb: row.feb,
        mar: row.mar,
        apr: row.apr,
        may: row.may,
        jun: row.jun,
        jul: row.jul,
        aug: row.aug,
        sep: row.sep,
        oct: row.oct,
        nov: row.nov,
        dec: row.dec
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/bond-monthly-dividends/:bondName', (req, res) => {
  try {
    const { bondName } = req.params;
    const { jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec } = req.body;
    
    const existing = db.prepare('SELECT id FROM bond_monthly_dividends WHERE bond_name = ?').get(bondName);
    
    if (existing) {
      db.prepare(`
        UPDATE bond_monthly_dividends
        SET jan = ?, feb = ?, mar = ?, apr = ?, may = ?, jun = ?, jul = ?, aug = ?, sep = ?, oct = ?, nov = ?, dec = ?, updated_at = CURRENT_TIMESTAMP
        WHERE bond_name = ?
      `).run(jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec, bondName);
    } else {
      db.prepare(`
        INSERT INTO bond_monthly_dividends (bond_name, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(bondName, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec);
    }
    
    res.json({ bond_name: bondName, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bond Monthly Values endpoints
app.get('/api/bond-monthly-values', (req, res) => {
  try {
    const data = db.prepare('SELECT * FROM bond_monthly_values ORDER BY bond_name').all();
    const result = {};
    data.forEach(row => {
      result[row.bond_name] = {
        jan: row.jan,
        feb: row.feb,
        mar: row.mar,
        apr: row.apr,
        may: row.may,
        jun: row.jun,
        jul: row.jul,
        aug: row.aug,
        sep: row.sep,
        oct: row.oct,
        nov: row.nov,
        dec: row.dec
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/bond-monthly-values/:bondName', (req, res) => {
  try {
    const { bondName } = req.params;
    const { jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec } = req.body;
    
    const existing = db.prepare('SELECT id FROM bond_monthly_values WHERE bond_name = ?').get(bondName);
    
    if (existing) {
      db.prepare(`
        UPDATE bond_monthly_values
        SET jan = ?, feb = ?, mar = ?, apr = ?, may = ?, jun = ?, jul = ?, aug = ?, sep = ?, oct = ?, nov = ?, dec = ?, updated_at = CURRENT_TIMESTAMP
        WHERE bond_name = ?
      `).run(jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec, bondName);
    } else {
      db.prepare(`
        INSERT INTO bond_monthly_values (bond_name, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(bondName, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec);
    }
    
    res.json({ bond_name: bondName, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Backup endpoints
app.post('/api/backup/create', (req, res) => {
  try {
    const backupPath = createBackup();
    cleanOldBackups(); // Keep only last 10 backups
    res.json({ success: true, message: 'Backup created', backupPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/backup/list', (req, res) => {
  try {
    const backups = listBackups();
    res.json(backups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/backup/restore/:backupName', (req, res) => {
  try {
    const { backupName } = req.params;
    
    // Restore the backup while connection is still open
    const success = restoreBackup(backupName);
    
    if (success) {
      res.json({ success: true, message: 'Database restored successfully' });
      
      // Close database and exit to force process restart (which reloads all modules)
      setTimeout(() => {
        try {
          db.close();
        } catch (e) {
          // Ignore close errors
        }
        process.exit(0);
      }, 500);
    } else {
      res.status(400).json({ error: 'Failed to restore backup' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Alternative Investments Routes =====
app.get('/api/alternative-investments', (req, res) => {
  try {
    const investments = db.prepare('SELECT * FROM alternative_investments ORDER BY created_at DESC').all();
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/alternative-investments', (req, res) => {
  try {
    const { name, asset_type, platform, quantity, unit_price, current_value, cost, notes } = req.body;
    const stmt = db.prepare(`
      INSERT INTO alternative_investments (name, asset_type, platform, quantity, unit_price, current_value, cost, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, asset_type, platform || null, quantity || null, unit_price || null, current_value, cost || null, notes || null);
    res.json({ id: result.lastInsertRowid, name, asset_type, platform, quantity, unit_price, current_value, cost, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/alternative-investments/:id', (req, res) => {
  try {
    const { name, asset_type, platform, quantity, unit_price, current_value, cost, notes } = req.body;
    const stmt = db.prepare(`
      UPDATE alternative_investments 
      SET name = ?, asset_type = ?, platform = ?, quantity = ?, unit_price = ?, current_value = ?, cost = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(name, asset_type, platform || null, quantity || null, unit_price || null, current_value, cost || null, notes || null, req.params.id);
    res.json({ id: req.params.id, name, asset_type, platform, quantity, unit_price, current_value, cost, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/alternative-investments/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM alternative_investments WHERE id = ?').run(req.params.id);
    db.prepare('DELETE FROM alternative_investment_monthly_data WHERE investment_name = (SELECT name FROM alternative_investments WHERE id = ?)').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Alternative Investment Monthly Data
app.get('/api/alternative-investment-monthly-data/:investmentName', (req, res) => {
  try {
    const data = db.prepare('SELECT * FROM alternative_investment_monthly_data WHERE investment_name = ?').get(req.params.investmentName);
    res.json(data || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/alternative-investment-monthly-data/:investmentName', (req, res) => {
  try {
    const { jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec } = req.body;
    const existing = db.prepare('SELECT id FROM alternative_investment_monthly_data WHERE investment_name = ?').get(req.params.investmentName);
    
    if (existing) {
      db.prepare(`
        UPDATE alternative_investment_monthly_data 
        SET jan = ?, feb = ?, mar = ?, apr = ?, may = ?, jun = ?, jul = ?, aug = ?, sep = ?, oct = ?, nov = ?, dec = ?, updated_at = CURRENT_TIMESTAMP
        WHERE investment_name = ?
      `).run(jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec, req.params.investmentName);
    } else {
      db.prepare(`
        INSERT INTO alternative_investment_monthly_data (investment_name, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(req.params.investmentName, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec);
    }
    res.json({ investment_name: req.params.investmentName, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Strategic Plans Routes =====
app.get('/api/strategic-plans', (req, res) => {
  try {
    const plans = db.prepare('SELECT * FROM strategic_plans ORDER BY id DESC').all();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/strategic-plans', (req, res) => {
  try {
    const { name, timeframe } = req.body;
    const stmt = db.prepare(`
      INSERT INTO strategic_plans (name, timeframe)
      VALUES (?, ?)
    `);
    const result = stmt.run(name, timeframe);
    res.json({ id: result.lastInsertRowid, name, timeframe });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/strategic-plans/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, timeframe } = req.body;
    db.prepare(`
      UPDATE strategic_plans
      SET name = ?, timeframe = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, timeframe, id);
    res.json({ id, name, timeframe });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/strategic-plans/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM strategic_plans WHERE id = ?').run(id);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Strategic Plans Routes (JSON File Storage) =====
const fs = require('fs');
const path = require('path');
const plansFilePath = path.join(__dirname, 'strategic_plans.json');

// Helper to read plans from JSON file
const readPlans = () => {
  try {
    if (fs.existsSync(plansFilePath)) {
      const data = fs.readFileSync(plansFilePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading plans file:', error);
    return [];
  }
};

// Helper to write plans to JSON file
const writePlans = (plans) => {
  try {
    fs.writeFileSync(plansFilePath, JSON.stringify(plans, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing plans file:', error);
    return false;
  }
};

// GET all strategic plans
app.get('/api/strategic-plans', (req, res) => {
  try {
    const plans = readPlans();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new strategic plan
app.post('/api/strategic-plans', (req, res) => {
  try {
    const { name, timeframe } = req.body;
    const plans = readPlans();
    
    const newPlan = {
      id: Math.max(...plans.map(p => p.id), 0) + 1,
      name,
      timeframe,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    plans.push(newPlan);
    writePlans(plans);
    res.json(newPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update strategic plan
app.put('/api/strategic-plans/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, timeframe } = req.body;
    const plans = readPlans();
    
    const planIndex = plans.findIndex(p => p.id === parseInt(id));
    if (planIndex === -1) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    plans[planIndex] = {
      ...plans[planIndex],
      name,
      timeframe,
      updated_at: new Date().toISOString()
    };
    
    writePlans(plans);
    res.json(plans[planIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE strategic plan
app.delete('/api/strategic-plans/:id', (req, res) => {
  try {
    const { id } = req.params;
    let plans = readPlans();
    
    const planIndex = plans.findIndex(p => p.id === parseInt(id));
    if (planIndex === -1) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    plans = plans.filter(p => p.id !== parseInt(id));
    writePlans(plans);
    res.json({ success: true, id: parseInt(id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Email Report Routes =====
const { generateSavingsEmailReport, generateInvestmentEmailReport } = require('./email-report-service.cjs');
const transporter = require('./email-config.cjs');

app.post('/api/reports/savings-email', async (req, res) => {
  try {
    console.log('📧 Email report request received');
    
    const records = db.prepare('SELECT * FROM savings_records ORDER BY record_date DESC').all();
    console.log('✓ Retrieved', records.length, 'records from database');
    
    const totalSavings = records.reduce((sum, r) => sum + (r.amount || 0), 0);
    console.log('✓ Total savings calculated:', totalSavings);
    
    // Generate HTML report
    const htmlContent = generateSavingsEmailReport(records, totalSavings, 'Savings Records Report');
    console.log('✓ HTML report generated');
    
    // Send email via Gmail
    const recipientEmail = process.env.GMAIL_RECIPIENT || 'family@example.com';
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: recipientEmail,
      subject: 'Savings Records Report - Nur Investment Fund',
      html: htmlContent,
      text: `Savings Report\n\nTotal Records: ${records.length}\nTotal Savings: RM ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✓ Email sent successfully via Gmail to:', recipientEmail);
    
    const response = { 
      success: true, 
      message: 'Email report sent successfully!',
      recordCount: records.length,
      totalSavings: totalSavings,
      sentTo: recipientEmail,
      timestamp: new Date().toISOString()
    };
    
    console.log('✓ Sending success response');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(response));
    console.log('✓ Response sent');
  } catch (error) {
    console.error('❌ Error in email report endpoint:', error.message);
    console.error('Stack:', error.stack);
    
    let errorMessage = error.message;
    let setupInstructions = '';
    
    // Check for specific Gmail errors
    if (error.message.includes('Invalid login') || error.message.includes('Unauthorized')) {
      setupInstructions = 'Please check your Gmail credentials and App Password';
      errorMessage = 'Gmail authentication failed. Invalid email or password.';
    } else if (error.message.includes('GMAIL_USER') || !process.env.GMAIL_USER) {
      setupInstructions = 'Gmail is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables';
      errorMessage = 'Gmail configuration missing.';
    }
    
    res.status(500).setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      instructions: setupInstructions || 'Check server logs for details'
    }));
  }
});

app.get('/api/reports/savings-email-download', (req, res) => {
  try {
    const records = db.prepare('SELECT * FROM savings_records ORDER BY record_date DESC').all();
    const totalSavings = records.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    const htmlReport = generateSavingsEmailReport(records, totalSavings, 'Savings Records Report');
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="savings-report.html"');
    res.send(htmlReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports/investments-email', (req, res) => {
  try {
    const equities = db.prepare('SELECT * FROM equities_companies').all();
    const bonds = db.prepare('SELECT * FROM fixed_income_bonds').all();
    const alternatives = db.prepare('SELECT * FROM alternative_investments').all();
    
    const equitiesTotal = equities.reduce((sum, e) => sum + (e.value || 0), 0);
    const bondsTotal = bonds.reduce((sum, b) => sum + (b.value || 0), 0);
    const altTotal = alternatives.reduce((sum, a) => sum + (a.current_value || 0), 0);
    const totalValue = equitiesTotal + bondsTotal + altTotal;
    
    const htmlReport = generateInvestmentEmailReport(equities, bonds, alternatives, totalValue);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="investment-report.html"');
    res.send(htmlReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server running' });
});

// Add global error handlers
process.on('uncaughtException', (error) => {
  console.error('⚠️  Uncaught Exception:', error.message);
  // Don't exit - keep server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection:', reason);
  // Don't exit - keep server running
});

app.listen(PORT, () => {
  console.log(`✓ API Server running on http://localhost:${PORT}`);
  console.log(`✓ Database: ${require('path').join(__dirname, 'nur_fund.db')}`);
  console.log(`✓ CORS enabled for all origins`);
});
