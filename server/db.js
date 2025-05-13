// server/db.js
const { Pool } = require('pg');

// Если вы видите у себя в Render переменную DATABASE_URL,
// она уже содержит все параметры подключения.
// Иначе раскомментируйте секцию ниже и задайте по-отдельности.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // host:     process.env.DB_HOST,
  // port:     process.env.DB_PORT,
  // user:     process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,
  max:      10,
  idleTimeoutMillis: 30000,
});

// Сразу выставляем часовой пояс
pool.on('connect', async client => {
  try {
    await client.query("SET TIME ZONE '+00:00'");
    console.log('🌐 Time zone set to +00:00');
  } catch (err) {
    console.error('❌ Cannot set time zone:', err);
  }
});

pool.on('error', err => {
  console.error('❌ Unexpected Postgres error:', err);
  process.exit(-1);
});

module.exports = pool;
