const express = require('express');
const pool    = require('../db');
const router  = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, seats, location FROM tables'
    );
    res.json({ tables: result.rows });
  } catch (err) {
    console.error('Tables error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

router.get('/booked', async (req, res) => {
  const { date, time } = req.query;
  try {
    const result = await pool.query(
      'SELECT table_id FROM bookings WHERE booking_date = $1 AND booking_time = $2',
      [date, time]
    );
    res.json({ booked: result.rows.map(r => r.table_id) });
  } catch (err) {
    console.error('Booked error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
