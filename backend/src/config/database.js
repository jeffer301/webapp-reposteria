const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'reposteria',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Error en PostgreSQL:', err.message);
});

const originalQuery = pool.query.bind(pool);
pool.query = async (text, params) => {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await originalQuery(text, params);
    } catch (err) {
      lastError = err;
      if ((err.code === 'ECONNREFUSED' || err.code === '57P01' || err.message?.includes('connection')) && attempt < 3) {
        console.log(`Reintentando conexion a BD (intento ${attempt}/3)...`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};

module.exports = pool;
