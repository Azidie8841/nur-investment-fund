const Database = require('better-sqlite3');
const db = new Database('server/nur_fund.db');

console.log('\n========== DATABASE INFORMATION ==========\n');

// Get all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

tables.forEach(t => {
  const table = t.name;
  const count = db.prepare(`SELECT COUNT(*) as cnt FROM ${table}`).get().cnt;
  const info = db.prepare(`PRAGMA table_info(${table})`).all();
  
  console.log(`📊 TABLE: ${table}`);
  console.log(`   Rows: ${count}`);
  console.log(`   Columns: ${info.length}`);
  info.forEach(col => console.log(`      - ${col.name} (${col.type})`));
  
  if (count > 0) {
    const sample = db.prepare(`SELECT * FROM ${table} LIMIT 2`).all();
    console.log(`   Sample Data (first 2 rows):`);
    sample.forEach((row, idx) => console.log(`      Row ${idx+1}: ${JSON.stringify(row)}`));
  }
  console.log('');
});

console.log('========== SUMMARY ==========');
const totalRows = tables.reduce((sum, t) => sum + db.prepare(`SELECT COUNT(*) as cnt FROM ${t.name}`).get().cnt, 0);
console.log(`Total Tables: ${tables.length}`);
console.log(`Total Rows Across All Tables: ${totalRows}`);

db.close();
