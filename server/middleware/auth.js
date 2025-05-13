// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const db      = require('../db');
const router  = express.Router();

// GET /login
router.get('/login', (req, res) => {
  res.render('pages/login', { error: null });
});

// POST /login
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? OR phone = ?',
      [identifier, identifier]
    );
    if (!rows.length) {
      return res.render('pages/login', { error: 'Пользователь не найден' });
    }
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.render('pages/login', { error: 'Неверный пароль' });
    }
    // сохраняем в сессии
    req.session.user = {
      id:       user.id,
      username: user.username,
      email:    user.email,
      phone:    user.phone,
      role:     user.role
    };
    res.redirect('/account');
  } catch (e) {
    console.error(e);
    res.render('pages/login', { error: 'Ошибка сервера' });
  }
});

// GET /register
router.get('/register', (req, res) => {
  res.render('pages/register', { error: null });
});

// POST /register
router.post('/register', async (req, res) => {
  const { username, email, phone, password, confirm } = req.body;
  if (password !== confirm) {
    return res.render('pages/register', { error: 'Пароли не совпадают' });
  }
  const hash = await bcrypt.hash(password, 10);
  try {
    const [result] = await db.query(
      `INSERT INTO users (username, email, phone, password, role)
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, phone, hash, 'user']
    );
    // авто-логин
    req.session.user = {
      id:       result.insertId,
      username,
      email,
      phone,
      role:     'user'
    };
    res.redirect('/account');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.render('pages/register', {
        error: 'Имя, email или телефон уже заняты'
      });
    }
    console.error(err);
    res.render('pages/register', { error: 'Не удалось зарегистрироваться' });
  }
});

// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
