const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'nur_fund.db');
const db = new Database(dbPath);

console.log('Updating database values...');

// Update SPUS ETF
const updateSpus = db.prepare('UPDATE equities_companies SET value = 211.76 WHERE name = ?');
updateSpus.run('SPUS ETF');
console.log('✓ SPUS ETF updated to 211.76');

// Update Equity ETF
const updateEquity = db.prepare('UPDATE equities_companies SET value = 925000.00 WHERE name = ?');
updateEquity.run('Equity ETF');
console.log('✓ Equity ETF updated to 925000.00');

// Show all companies
const companies = db.prepare('SELECT id, name, value, type FROM equities_companies ORDER BY id DESC').all();
console.log('\nCurrent companies:');
companies.forEach(c => {
  console.log(`${c.name}: RM ${c.value} (${c.type})`);
});

db.close();
console.log('\n✓ Database updated successfully!');
