-- server/schema.sql

-- 1) Типы (если не существуют)
CREATE TYPE IF NOT EXISTS user_role      AS ENUM ('user','admin');
CREATE TYPE IF NOT EXISTS table_location AS ENUM ('Основной зал','Веранда');

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

-- 3) Seed users
INSERT INTO users (id, username, phone, password, email, created_at, role) VALUES
  (50, '1', '1111111111', '$2b$10$jUXyR737gOTfTJC1Aq7Z5uKBj8H5Va6DyyDzlnnH8Ka8aDdsYQ7nW', '1@1', '2025-05-10 05:20:29', 'user'),
  (51, '2', '2222222222', '$2b$10$1TcObGFmQQhUu2919P0qZeEfp9U2TI6JOUBQqiO40G2sTezHOa8JO', '2@2', '2025-05-10 16:40:39', 'user'),
  (52, 'Администратор', '+79530023032', '$2b$10$KTLdQBpRDXvhFpxSCGlA6uLzYIdPdK0WRkRaFyFVmENsTMugEOrKS', 'admin@flavor.ru', '2025-05-10 16:48:41', 'admin')
ON CONFLICT (id) DO NOTHING;

-- 4) Таблица tables
CREATE TABLE IF NOT EXISTS tables (
  id       SERIAL PRIMARY KEY,
  seats    INT   NOT NULL,
  location table_location NOT NULL
);

-- 5) Seed tables
INSERT INTO tables (id, seats, location) VALUES
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
ON CONFLICT (id) DO NOTHING;

-- 6) Таблица bookings
CREATE TABLE IF NOT EXISTS bookings (
  id           SERIAL PRIMARY KEY,
  user_id      INT REFERENCES users(id)   ON DELETE SET NULL,
  table_id     INT REFERENCES tables(id)  ON DELETE CASCADE,
  booking_date DATE  NOT NULL,
  booking_time VARCHAR(20) NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (table_id, booking_date, booking_time)
);

-- 7) Seed bookings
INSERT INTO bookings (id, user_id, table_id, booking_date, booking_time, created_at) VALUES
  (223, 52,  7,  '2025-05-11', '10:00 - 11:30', '2025-05-11 03:17:49'),
  (224, 52,  8,  '2025-05-11', '18:00 - 19:30', '2025-05-11 03:17:54'),
  (225, 52, 16,  '2025-05-18', '18:00 - 19:30', '2025-05-11 03:17:56'),
  (226, 52,  6,  '2025-05-21', '18:00 - 19:30', '2025-05-11 03:17:59')
ON CONFLICT (id) DO NOTHING;

-- 8) Таблица sessions для connect-pg-simple
CREATE TABLE IF NOT EXISTS sessions (
  sid    VARCHAR(128) PRIMARY KEY,
  sess   JSON        NOT NULL,
  expire TIMESTAMP   NOT NULL
);
