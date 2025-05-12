// server/routes/auth.js
const express = require('express');
const bcrypt  = require('bcrypt');
const db      = require('../db');
const router  = express.Router();

// Форма входа
router.get('/login', (req, res) => {
  res.render('pages/login', { error: null });
});

// Обработка входа
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    // Ищем пользователя по email или телефону
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? OR phone = ?',
      [identifier, identifier]
    );
    if (rows.length === 0) {
      return res.render('pages/login', { error: 'Пользователь не найден' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('pages/login', { error: 'Неверный пароль' });
    }

    // Сохраняем в сессию
    req.session.user = {
      id:    user.id,
      username: user.username, 
      email: user.email,
      phone: user.phone,
      role:  user.role
    };
    res.redirect('/account');

  } catch (err) {
    console.error('Login error:', err);
    res.render('pages/login', { error: 'Ошибка сервера, попробуйте позже' });
  }
});

// Форма регистрации
router.get('/register', (req, res) => {
  res.render('pages/register', { error: null });
});

// Обработка регистрации
router.post('/register', async (req, res) => {
  const { username, phone, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render('pages/register', { error: 'Пароли не совпадают' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, phone, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [username, phone, email, hash, 'user']
    );

    // Авто‐логин
    req.session.user = {
      id:       result.insertId,
      username,
      email,
      phone,
      role:     'user'
    };
    res.redirect('/account');

  } catch (err) {
    console.error('Регистрация не удалась:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      let msg;
      if (err.sqlMessage.includes('email')) msg = 'Пользователь с таким email уже существует';
      else if (err.sqlMessage.includes('phone')) msg = 'Пользователь с таким телефоном уже существует';
      else msg = 'Пользователь с такими данными уже существует';
      return res.render('pages/register', { error: msg });
    }
    res.render('pages/register', { error: 'Не удалось зарегистрироваться, попробуйте ещё раз.' });
  }
});

// Выход
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
