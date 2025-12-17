const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'nur_fund.db');
const db = new Database(dbPath);

try {
  // Update Bitcoin allocation to 5%
  db.prepare('UPDATE alternative_investments SET allocation = 5 WHERE name = ?').run('Bitcoin');
  
  // Update Gold allocation to 3%
  db.prepare('UPDATE alternative_investments SET allocation = 3 WHERE name = ?').run('Gold');
  
  // Verify the updates
  const results = db.prepare('SELECT name, allocation FROM alternative_investments WHERE name IN (?, ?)').all('Bitcoin', 'Gold');
  console.log('✓ Updated allocations:');
  results.forEach(row => {
    console.log(`  ${row.name}: ${row.allocation}%`);
  });
} finally {
  db.close();
}
