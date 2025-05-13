// server/db.js
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,                 // Render: e.g. db-xxxx.us-east-1.postgres.render.com
  port:     Number(process.env.DB_PORT),         // обычно 5432
  user:     process.env.DB_USER,                 // из Render Connect Info
  password: process.env.DB_PASSWORD,             // из Render Connect Info
  database: process.env.DB_NAME,                 // имя базы в Render
  max:      10,
  idleTimeoutMillis: 30000
});

// Устанавливаем таймзону на UTC при каждом подключении
pool.on('connect', async client => {
  try {
    await client.query("SET TIME ZONE '+00:00';");
  } catch (err) {
    console.error('Error setting time zone:', err);
  }
});

pool.on('error', err => {
  console.error('Unexpected Postgres error:', err);
  process.exit(-1);
});

module.exports = pool;
