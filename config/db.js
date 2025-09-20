const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'reservas.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

const DDL = `
-- Cliente
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    document VARCHAR(50),
    phone VARCHAR(50),
    country VARCHAR(100),
    loyalty_tier INT
);

-- Hotel
CREATE TABLE IF NOT EXISTS hotels (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(50)
);

-- Reserva
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    type VARCHAR(10),
    status VARCHAR(50),
    total_amount NUMERIC(12,2),
    currency VARCHAR(10),
    customer_id BIGINT REFERENCES customers(id),
    hotel_id BIGINT REFERENCES hotels(id)
);

-- Categorias de quarto
CREATE TABLE IF NOT EXISTS room_categories (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS room_subcategories (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100),
    category_id VARCHAR(10) REFERENCES room_categories(id)
);

-- Quartos reservados
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    reservation_id INT REFERENCES reservations(id) ON DELETE CASCADE,
    room_number VARCHAR(20),
    daily_rate NUMERIC(10,2),
    number_of_days INT,
    checkin_date DATE,
    checkout_date DATE,
    status VARCHAR(50),
    guests INT,
    breakfast_included BOOLEAN,
    category_id VARCHAR(10) REFERENCES room_categories(id),
    sub_category_id VARCHAR(10) REFERENCES room_subcategories(id)
);

-- Pagamento
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    reservation_id INT REFERENCES reservations(id) ON DELETE CASCADE,
    method VARCHAR(50),
    status VARCHAR(50),
    transaction_id VARCHAR(100),
    amount NUMERIC(12,2)
);

-- Metadata
CREATE TABLE IF NOT EXISTS metadata (
    id SERIAL PRIMARY KEY,
    reservation_id INT REFERENCES reservations(id) ON DELETE CASCADE,
    source VARCHAR(50),
    user_agent TEXT,
    ip_address VARCHAR(50),
    version VARCHAR(20)
);
`;

db.exec(DDL);

module.exports = db;
