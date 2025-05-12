// server/routes/tables.js
const express = require('express');
const db      = require('../db');
const router  = express.Router();

// GET /          — все столы
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT id, seats, location FROM tables`);
    res.json({ tables: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// GET /booked   — занятые столы в date+time
router.get('/booked', async (req, res) => {
  const { date, time } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT table_id FROM bookings
       WHERE booking_date = ? AND booking_time = ?`,
      [date, time]
    );
    // отдать просто массив ID
    res.json({ booked: rows.map(r => r.table_id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
