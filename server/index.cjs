const express = require('express');
const cors = require('cors');
const { db, initializeDb } = require('./db.cjs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDb();

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server running' });
});

// Add global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

app.listen(PORT, () => {
  console.log(`✓ API Server running on http://localhost:${PORT}`);
  console.log(`✓ Database: ${require('path').join(__dirname, 'nur_fund.db')}`);
  console.log(`✓ CORS enabled for all origins`);
});
