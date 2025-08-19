const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,                
  port:     Number(process.env.DB_PORT),         
  user:     process.env.DB_USER,              
  password: process.env.DB_PASSWORD,            
  database: process.env.DB_NAME,               
  max:      10,
  idleTimeoutMillis: 30000,
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

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
