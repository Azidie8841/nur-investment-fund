const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'nur_fund.db');
const db = new Database(dbPath);

try {
  // Fix the typo: rename Bitocin to Bitcoin
  const renameResult = db.prepare('UPDATE alternative_investments SET name = ? WHERE name = ?').run('Bitcoin', 'Bitocin');
  console.log(`Renamed Bitocin to Bitcoin: ${renameResult.changes} rows affected`);
  
  // Verify the updates
  const updated = db.prepare('SELECT name, allocation FROM alternative_investments ORDER BY name').all();
  console.log('\nAlternative Investments:');
  updated.forEach(row => {
    console.log(`  ${row.name}: ${row.allocation}%`);
  });
} finally {
  db.close();
}
