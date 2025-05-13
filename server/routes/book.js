// server/routes/book.js
const express    = require('express');
const pool       = require('../db');
const ensureAuth = require('../middleware/ensureAuth');
const router     = express.Router();

// POST /api/book — создаём новую бронь
router.post('/api/book', ensureAuth, async (req, res) => {
  const userId        = req.session.user.id;
  const { table_id, booking_date, booking_time } = req.body;

  try {
    await pool.query(
      `INSERT INTO bookings (user_id, table_id, booking_date, booking_time)
       VALUES ($1, $2, $3, $4)`,
      [userId, table_id, booking_date, booking_time]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка создания брони:', err);
    res.status(500).json({ success: false, error: 'Не удалось забронировать' });
  }
});

module.exports = router;
