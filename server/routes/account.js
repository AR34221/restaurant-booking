// server/routes/account.js
const express    = require('express');
const router     = express.Router();
const db         = require('../db');
const ensureAuth = require('../middleware/ensureAuth'); // блокирует неавторизованных

router.get('/', ensureAuth, async (req, res, next) => {
  try {
    // в сессии мы храним user = { id, username, email, role }
    const user = req.session.user;

    // забираем все бронирования этого пользователя
    const [bookings] = await db.promise().execute(
      `SELECT booking_date, booking_time, table_id
         FROM bookings
         WHERE user_id = ?
         ORDER BY booking_date DESC, booking_time`,
      [user.id]
    );

    // рендерим шаблон и даём ему и user, и bookings
    res.render('pages/account', { user, bookings });
  } catch(err) {
    next(err);
  }
});

module.exports = router;
