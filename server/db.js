// server/db.js
// Поддержка PostgreSQL через pg Pool
const { Pool } = require('pg');

// Пул соединений с базой из переменных окружения
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max:      10,            // максимальное число соединений
  idleTimeoutMillis: 30000 // закрывать неактивные соединения через 30 сек
});

// Устанавливаем таймзону сразу после подключения
pool.on('connect', async (client) => {
  console.log('✅ Connected to Postgres on', process.env.DB_HOST);
  try {
    await client.query("SET TIME ZONE '+00:00';");
    console.log('🌐 Time zone set to +00:00');
  } catch (err) {
    console.error('❌ Error setting time zone:', err);
  }
});

// Обработка неожиданных ошибок
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle Postgres client', err);
  process.exit(-1);
});

module.exports = pool;
