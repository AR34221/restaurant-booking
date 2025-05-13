-- server/schema.sql

-- 0) Сброс существующих таблиц и типов (удаляем всё, чтобы не было конфликтов)
DROP TABLE IF EXISTS sessions, bookings, tables, users CASCADE;
DROP TYPE  IF EXISTS table_location;
DROP TYPE  IF EXISTS user_role;

-- 1) Создаём ENUM-типы
CREATE TYPE user_role      AS ENUM ('user','admin');
CREATE TYPE table_location AS ENUM ('Основной зал','Веранда');

-- 2) Таблица users
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  username     VARCHAR(50) NOT NULL,
  phone        VARCHAR(20) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  email        VARCHAR(100) UNIQUE,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  role         user_role NOT NULL DEFAULT 'user'
);

-- 3) Таблица tables
CREATE TABLE tables (
  id       SERIAL PRIMARY KEY,
  seats    INT NOT NULL,
  location table_location NOT NULL
);

-- 4) Seed-данные для tables
INSERT INTO tables (id, seats, location)
VALUES
  (1,  2, 'Основной зал'::table_location),
  (2,  2, 'Основной зал'::table_location),
  (3,  2, 'Основной зал'::table_location),
  (4,  4, 'Основной зал'::table_location),
  (5,  4, 'Основной зал'::table_location),
  (6,  4, 'Основной зал'::table_location),
  (7,  6, 'Основной зал'::table_location),
  (8,  6, 'Основной зал'::table_location),
  (9,  6, 'Основной зал'::table_location),
  (10, 6, 'Основной зал'::table_location),
  (11, 2, 'Основной зал'::table_location),
  (12, 2, 'Основной зал'::table_location),
  (13, 4, 'Веранда'     ::table_location),
  (14, 2, 'Веранда'     ::table_location),
  (15, 2, 'Веранда'     ::table_location),
  (16, 2, 'Веранда'     ::table_location),
  (17, 4, 'Веранда'     ::table_location)
ON CONFLICT DO NOTHING;

-- 5) Таблица bookings
CREATE TABLE bookings (
  id            SERIAL PRIMARY KEY,
  user_id       INT REFERENCES users(id) ON DELETE SET NULL,
  table_id      INT REFERENCES tables(id) ON DELETE CASCADE,
  booking_date  DATE NOT NULL,
  booking_time  VARCHAR(20) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (table_id, booking_date, booking_time)
);

-- 6) Seed-данные для bookings
INSERT INTO bookings (id, user_id, table_id, booking_date, booking_time, created_at)
VALUES
  (223, 52,  7, '2025-05-11', '10:00 - 11:30', '2025-05-11 03:17:49'),
  (224, 52,  8, '2025-05-11', '18:00 - 19:30', '2025-05-11 03:17:54'),
  (225, 52, 16, '2025-05-18', '18:00 - 19:30', '2025-05-11 03:17:56'),
  (226, 52,  6, '2025-05-21', '18:00 - 19:30', '2025-05-11 03:17:59')
ON CONFLICT DO NOTHING;

-- 7) Таблица sessions для сессий
CREATE TABLE sessions (
  session_id VARCHAR(128) PRIMARY KEY,
  expires    BIGINT       NOT NULL,
  data       TEXT
);
