DB Mensageria
Supabase
pubsub6dsm
PubSub@6dsm

-- Criar banco
CREATE DATABASE reservas;

-- ========================
-- Tabela Customers (Cliente)
-- ========================
CREATE TABLE customers (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    document VARCHAR(50),
    phone VARCHAR(50),
    country VARCHAR(100),
    loyalty_tier INT,
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- Tabela Hotels
-- ========================
CREATE TABLE hotels (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(50),
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- Tabela Reservations
-- ========================
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    type VARCHAR(10),
    status VARCHAR(50),
    total_amount NUMERIC(12,2),
    currency VARCHAR(10),
    customer_id BIGINT REFERENCES customers(id),
    hotel_id BIGINT REFERENCES hotels(id),
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- Categorias de quarto
-- ========================
CREATE TABLE room_categories (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100),
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE room_subcategories (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100),
    category_id VARCHAR(10) REFERENCES room_categories(id),
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- Quartos reservados
-- ========================
CREATE TABLE rooms (
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
    sub_category_id VARCHAR(10) REFERENCES room_subcategories(id),
    -- NOVO campo calculado
    total_value NUMERIC(12,2) GENERATED ALWAYS AS (daily_rate * number_of_days) STORED,
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- Pagamento
-- ========================
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    reservation_id INT REFERENCES reservations(id) ON DELETE CASCADE,
    method VARCHAR(50),
    status VARCHAR(50),
    transaction_id VARCHAR(100),
    amount NUMERIC(12,2),
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- Metadata
-- ========================
CREATE TABLE metadata (
    id SERIAL PRIMARY KEY,
    reservation_id INT REFERENCES reservations(id) ON DELETE CASCADE,
    source VARCHAR(50),
    user_agent TEXT,
    ip_address VARCHAR(50),
    version VARCHAR(20),
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
