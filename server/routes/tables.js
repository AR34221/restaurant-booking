// server/routes/tables.js
const express = require('express');
const pool    = require('../db');       // pg.Pool
const router  = express.Router();

// GET /api/tables — все столы
router.get('/', async (req, res) => {
  try {
    // pg.Pool возвращает { rows, ... }
    const { rows } = await pool.query(
      'SELECT id, seats, location FROM tables ORDER BY id'
    );
    res.json({ tables: rows });
  } catch (err) {
    console.error('Ошибка в GET /api/tables:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// GET /api/tables/booked?date=…&time=… — занятые столы для даты+времени
router.get('/booked', async (req, res) => {
  const { date, time } = req.query;
  try {
    const { rows } = await pool.query(
      `SELECT table_id
         FROM bookings
        WHERE booking_date = $1
          AND booking_time = $2`,
      [date, time]
    );
    res.json({ booked: rows.map(r => r.table_id) });
  } catch (err) {
    console.error('Ошибка в GET /api/tables/booked:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
