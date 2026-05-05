'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG_SQL) {
      console.log(`SQL (${duration}ms):`, text.substring(0, 100));
    }
    return result;
  } catch (err) {
    console.error('Database query error:', err.message);
    throw err;
  }
}

async function getClient() {
  const client = await pool.connect();
  return client;
}

module.exports = { query, getClient, pool };
