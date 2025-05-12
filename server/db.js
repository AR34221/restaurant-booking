// server/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     'localhost',
  user:     'root',
  password: '',          // ваш пароль
  database: 'restaurant_booking',
  waitForConnections: true,
  connectionLimit: 10,
  timezone: '+00:00'
});

module.exports = pool;
