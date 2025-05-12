// server/routes/admin.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const ensureAdmin = require('../middleware/ensureAdmin');

// Dashboard — общий обзор
router.get('/admin', ensureAdmin, async (req, res, next) => {
  try {
    // 1) Все бронирования с пользователем
    const [bookings] = await db.query(`
      SELECT b.id, u.username, b.table_id, b.booking_date, b.booking_time
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      ORDER BY b.booking_date, b.booking_time
    `);

    // 2) Все столы
    const [tables] = await db.query(`
      SELECT id, seats, location
      FROM tables
      ORDER BY id
    `);

    // 3) Все пользователи
    const [users] = await db.query(`
      SELECT id, username, email, role
      FROM users
      ORDER BY id
    `);

    res.render('pages/admin/dashboard', { user: req.session.user, bookings, tables, users });
  } catch (err) {
    next(err);
  }
});

// Удалить бронирование
router.post('/admin/bookings/delete', ensureAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM bookings WHERE id = ?', [req.body.id]);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

// Добавить стол
router.post('/admin/tables/add', ensureAdmin, async (req, res, next) => {
  const { seats, location } = req.body;
  try {
    await db.query('INSERT INTO tables (seats, location) VALUES (?, ?)', [seats, location]);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

// Обновить стол
router.post('/admin/tables/edit', ensureAdmin, async (req, res, next) => {
  const { id, seats, location } = req.body;
  try {
    await db.query('UPDATE tables SET seats = ?, location = ? WHERE id = ?', [seats, location, id]);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

// Удалить стол
router.post('/admin/tables/delete', ensureAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM tables WHERE id = ?', [req.body.id]);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

// Удалить пользователя
router.post('/admin/users/delete', ensureAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.body.id]);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
