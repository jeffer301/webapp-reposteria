const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('🔄 Ejecutando migraciones...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✅ Schema base completado');

    // Migraciones incrementales
    const migDir = __dirname;
    const files = fs.readdirSync(migDir).filter(f => f.startsWith('migrate-') && f.endsWith('.sql')).sort();
    for (const file of files) {
      console.log(`  → Ejecutando ${file}...`);
      const sql = fs.readFileSync(path.join(migDir, file), 'utf8');
      await client.query(sql);
    }

    console.log('✅ Migraciones completadas');
  } catch (err) {
    console.error('❌ Error en migraciones:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
