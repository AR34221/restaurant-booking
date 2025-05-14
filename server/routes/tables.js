// server/routes/tables.js
const express = require('express');
const pool    = require('../db');
const router  = express.Router();

// GET /api/tables — список всех столов
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, seats, location FROM tables ORDER BY id'
    );
    res.json({ tables: rows });
  } catch (err) {
    console.error('GET /api/tables error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// GET /api/tables/booked?date=YYYY-MM-DD&time=HH:MM%20-%20HH:MM
router.get('/booked', async (req, res) => {
  const { date, time } = req.query;
  console.log('booking lookup for', { date, time });
  try {
    const { rows } = await pool.query(
      `SELECT table_id
         FROM bookings
        WHERE booking_date = $1::date
          AND booking_time = $2`,
      [date, time]
    );
    res.json({ booked: rows.map(r => r.table_id) });
  } catch (err) {
    console.error('GET /api/tables/booked error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
