const express    = require('express');
const router     = express.Router();
const db         = require('../db');
const ensureAuth = require('../middleware/ensureAuth'); 

router.get('/', ensureAuth, async (req, res, next) => {
  try {
    const user = req.session.user;

    const [bookings] = await db.promise().execute(
      `SELECT booking_date, booking_time, table_id
         FROM bookings
         WHERE user_id = ?
         ORDER BY booking_date DESC, booking_time`,
      [user.id]
    );

    res.render('pages/account', { user, bookings });
  } catch(err) {
    next(err);
  }
});

module.exports = router;
