// server/routes/tables.js
const express = require('express');
const pool    = require('../db');
const router  = express.Router();

// GET /api/tables/booked — занятые столы для конкретной даты и времени
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
    // отдадим просто массив ID
    res.json({ booked: rows.map(r => r.table_id) });
  } catch (err) {
    console.error('Ошибка в /api/tables/booked:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
