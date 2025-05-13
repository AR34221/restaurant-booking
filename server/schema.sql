-- server/schema.sql

-- 1) Создаём ENUM-типы (если их ещё нет)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user','admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'table_location') THEN
    CREATE TYPE table_location AS ENUM ('Основной зал','Веранда');
  END IF;
END$$;

-- 2) Таблица users
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  username     VARCHAR(50) NOT NULL,
  phone        VARCHAR(20) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  email        VARCHAR(100) UNIQUE,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  role         user_role NOT NULL DEFAULT 'user'
);

-- 3) Таблица tables
CREATE TABLE IF NOT EXISTS tables (
  id       SERIAL PRIMARY KEY,
  seats    INT NOT NULL,
  location table_location NOT NULL
);

-- 4) Заполняем таблицу tables (если пуста)
INSERT INTO tables (id, seats, location)
SELECT id, seats, location FROM (VALUES
  (1, 2, 'Основной зал'),
  (2, 2, 'Основной зал'),
  (3, 2, 'Основной зал'),
  (4, 4, 'Основной зал'),
  (5, 4, 'Основной зал'),
  (6, 4, 'Основной зал'),
  (7, 6, 'Основной зал'),
  (8, 6, 'Основной зал'),
  (9, 6, 'Основной зал'),
  (10, 6, 'Основной зал'),
  (11, 2, 'Основной зал'),
  (12, 2, 'Основной зал'),
  (13, 4, 'Веранда'),
  (14, 2, 'Веранда'),
  (15, 2, 'Веранда'),
  (16, 2, 'Веранда'),
  (17, 4, 'Веранда')
) AS vals(id, seats, location)
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE id = vals.id);

-- 5) Таблица bookings
CREATE TABLE IF NOT EXISTS bookings (
  id            SERIAL PRIMARY KEY,
  user_id       INT  REFERENCES users(id)  ON DELETE SET NULL,
  table_id      INT  REFERENCES tables(id) ON DELETE CASCADE,
  booking_date  DATE NOT NULL,
  booking_time  VARCHAR(20) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (table_id, booking_date, booking_time)
);

-- 6) Дамп данных в bookings (если ещё нет)
INSERT INTO bookings (id, user_id, table_id, booking_date, booking_time, created_at)
SELECT id, user_id, table_id, booking_date, booking_time, created_at FROM (VALUES
  (223, 52,  7, '2025-05-11', '10:00 - 11:30', '2025-05-11 03:17:49'),
  (224, 52,  8, '2025-05-11', '18:00 - 19:30', '2025-05-11 03:17:54'),
  (225, 52, 16, '2025-05-18', '18:00 - 19:30', '2025-05-11 03:17:56'),
  (226, 52,  6, '2025-05-21', '18:00 - 19:30', '2025-05-11 03:17:59')
) AS b(id, user_id, table_id, booking_date, booking_time, created_at)
WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE id = b.id);

-- 7) Таблица sessions
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) PRIMARY KEY,
  expires    BIGINT       NOT NULL,
  data       TEXT
);
