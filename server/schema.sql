-- server/schema.sql

-- 1) Типы (создать если не существует)
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
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL,
  phone      VARCHAR(20)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  email      VARCHAR(100) UNIQUE,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  role       user_role    NOT NULL DEFAULT 'user'
);

-- 3) Таблица tables
CREATE TABLE IF NOT EXISTS tables (
  id       SERIAL PRIMARY KEY,
  seats    INT   NOT NULL,
  location table_location NOT NULL
);

-- 4) Таблица bookings
CREATE TABLE IF NOT EXISTS bookings (
  id           SERIAL PRIMARY KEY,
  user_id      INT REFERENCES users(id)   ON DELETE SET NULL,
  table_id     INT REFERENCES tables(id)  ON DELETE CASCADE,
  booking_date DATE  NOT NULL,
  booking_time VARCHAR(20) NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (table_id, booking_date, booking_time)
);

-- 5) Таблица sessions для connect-pg-simple
CREATE TABLE IF NOT EXISTS sessions (
  sid    VARCHAR(128) PRIMARY KEY,
  sess   JSON        NOT NULL,
  expire TIMESTAMP   NOT NULL
);
