// server/routes/book.js
const express    = require('express');
const ensureAuth = require('../middleware/ensureAuth');
const db         = require('../db');       // ваш pool из db.js
const router     = express.Router();

// POST /api/book — создаёт бронь, только для авторизованных
router.post('/', ensureAuth, async (req, res) => {
  const userId = req.session.user.id;
  const { table_id, booking_date, booking_time } = req.body;

  try {
    await db.execute(
      `INSERT INTO bookings
         (user_id, table_id, booking_date, booking_time, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, table_id, booking_date, booking_time]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка создания брони:', err);
    res.status(500).json({ success: false, error: 'Не удалось забронировать' });
  }
});

module.exports = router;
