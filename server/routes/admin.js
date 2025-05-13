// server/routes/admin.js
const express     = require('express');
const pool        = require('../db');
const ensureAuth  = require('../middleware/ensureAuth');
const router      = express.Router();

// Middleware: доступ только для админа
router.use('/admin', ensureAuth, (req, res, next) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).send('Доступ запрещён');
  }
  next();
});

// GET /admin — панель администратора
router.get('/admin', async (req, res, next) => {
  try {
    const bookingsRes = await pool.query(
      `SELECT b.id, u.username, b.table_id,
              to_char(b.booking_date, 'YYYY-MM-DD') AS booking_date,
              b.booking_time
         FROM bookings b
         LEFT JOIN users u ON u.id = b.user_id
        ORDER BY b.booking_date DESC, b.booking_time`
    );
    const tablesRes = await pool.query(
      'SELECT id, seats, location FROM tables ORDER BY id'
    );
    const usersRes = await pool.query(
      'SELECT id, username, email, role FROM users ORDER BY id'
    );

    res.render('pages/admin', {
      user: req.session.user,
      bookings: bookingsRes.rows,
      tables:   tablesRes.rows,
      users:    usersRes.rows
    });
  } catch (err) {
    next(err);
  }
});

// POST /admin/bookings/delete
router.post('/admin/bookings/delete', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM bookings WHERE id = $1', [req.body.id]);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

// POST /admin/tables/add
router.post('/admin/tables/add', async (req, res, next) => {
  const { seats, location } = req.body;
  try {
    await pool.query(
      'INSERT INTO tables (seats, location) VALUES ($1, $2)',
      [seats, location]
    );
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

// POST /admin/tables/edit
router.post('/admin/tables/edit', async (req, res, next) => {
  const { id, seats, location } = req.body;
  try {
    await pool.query(
      'UPDATE tables SET seats = $1, location = $2 WHERE id = $3',
      [seats, location, id]
    );
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

// POST /admin/tables/delete
router.post('/admin/tables/delete', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM tables WHERE id = $1', [req.body.id]);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

// POST /admin/users/delete
router.post('/admin/users/delete', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.body.id]);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
