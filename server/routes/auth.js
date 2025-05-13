// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const router = express.Router();

// GET: страница логина
router.get('/login', (req, res) => {
  res.render('pages/login', { error: null });
});

// POST: логин
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    // Ищем пользователя по username или email
    const { rows } = await pool.query(
      'SELECT id, username, phone, email, password, role FROM users WHERE username = $1 OR email = $1',
      [identifier]
    );
    if (!rows.length) {
      return res.render('pages/login', { error: 'Неверные учётные данные' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('pages/login', { error: 'Неверные учётные данные' });
    }
    // Сохраняем сессию
    req.session.user = {
      id: user.id,
      username: user.username,
      phone: user.phone,
      email: user.email,
      role: user.role
    };
    return res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).send('Ошибка сервера, попробуйте позже');
  }
});

// GET: страница регистрации
router.get('/register', (req, res) => {
  res.render('pages/register', { error: null });
});

// POST: регистрация
router.post('/register', async (req, res) => {
  const { username, phone, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (username, phone, email, password) VALUES ($1, $2, $3, $4) RETURNING id, username, phone, email, role',
      [username, phone, email, hash]
    );
    const newUser = rows[0];
    req.session.user = newUser;
    return res.redirect('/');
  } catch (err) {
    console.error('Register error:', err);
    return res.render('pages/register', { error: 'Не удалось зарегистрировать пользователя' });
  }
});

// POST: выход
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;
