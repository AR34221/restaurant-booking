// server/index.js
const path        = require('path');
const express     = require('express');
const session     = require('express-session');
const mysql       = require('mysql2');
const MySQLStore  = require('express-mysql-session')(session);
const cors        = require('cors');

// ваши роуты
const bookRoute   = require('./routes/book');
const tableRoute  = require('./routes/tables');
const authRoute   = require('./routes/auth');
const ensureAuth  = require('./middleware/ensureAuth');
const adminRoute = require('./routes/admin');
const cron = require('node-cron');

const db          = require('./db'); // mysql2/promise pool

const app = express();

// 1) Сессии
// используем тот же конфиг, что и в db.js, но без promise
const sessionStore = new MySQLStore({}, mysql.createPool({
  host:     'localhost',
  user:     'root',
  password: '',
  database: 'restaurant_booking'
}));

app.use(session({
  key:               'sid',
  secret:            'ваш-секрет-строкой',
  store:             sessionStore,
  resave:            false,
  saveUninitialized: false,
  cookie:           { maxAge: 1000 * 60 * 60 * 2 } // 2 часа
}));

// 2) Парсинг JSON и form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 3) Статика (css/js/img лежат в корне проекта рядом с server)
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/js',  express.static(path.join(__dirname, '..', 'js')));
app.use('/img', express.static(path.join(__dirname, '..', 'img')));

// 4) Движок EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 5) Простейшие GET-страницы (главная и бронирование)
app.get('/', (req, res) => {
  res.render('pages/index',   { user: req.session.user });
});
app.get('/booking', (req, res) => {
  res.render('pages/booking', { user: req.session.user });
});

// 6) Аутентификация (login/register/logout)
app.use('/', authRoute);

// 7) Личный кабинет — только для залогиненных
app.get('/account', ensureAuth, async (req, res, next) => {
  try {
    const user = req.session.user;
    // вытягиваем бронирования этого пользователя
    const [rows] = await db.query(
      `SELECT b.id, b.booking_date, b.booking_time, b.table_id, t.seats
         FROM bookings b
         JOIN tables t ON t.id = b.table_id
        WHERE b.user_id = ?
        ORDER BY b.booking_date DESC, b.booking_time`,
      [user.id]
    );
    // форматируем дату для шаблона
    const bookings = rows.map(b => ({
      ...b,
      dateFormatted: b.booking_date.toLocaleDateString('ru-RU')
    }));
    res.render('pages/account', { user, bookings });
  } catch (err) {
    next(err);
  }
});

// 7.1) Отмена бронирования — тоже только для залогиненных
app.post('/account/cancel', ensureAuth, async (req, res, next) => {
  const user = req.session.user;
  const bookingId = req.body.id;
  try {
    await db.query(
      'DELETE FROM bookings WHERE id = ? AND user_id = ?',
      [bookingId, user.id]
    );
    res.redirect('/account');
  } catch (err) {
    next(err);
  }
});

// 7.2) Удаление аккаунта — только для залогиненных
app.post('/account/delete', ensureAuth, async (req, res, next) => {
  const userId = req.session.user.id;
  try {
    // 1) Удаляем все брони пользователя
    await db.query(
      'DELETE FROM bookings WHERE user_id = ?',
      [userId]
    );
    // 2) Удаляем самого пользователя
    await db.query(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    // 3) Уничтожаем сессию
    req.session.destroy(err => {
      if (err) return next(err);
      // 4) Перенаправляем на главную
      res.redirect('/login');
    });
  } catch (err) {
    next(err);
  }
});


// 8) API-роуты
app.use('/api/book',   bookRoute);
app.use('/api/tables', tableRoute);
app.use('/', authRoute);
app.use('/', adminRoute);

// каждый день в 00:00
cron.schedule('0 0 * * *', async () => {
  try {
    await db.query(
      'DELETE FROM bookings WHERE booking_date < CURRENT_DATE()'
    );
    console.log('Old bookings cleaned up');
  } catch (err) {
    console.error('Error cleaning old bookings:', err);
  }
}, {
  timezone: 'Europe/Amsterdam'
});


// 9) Ошибка 404
app.use((req, res) => res.status(404).send('Not Found'));

// Запуск
const PORT = 3000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
