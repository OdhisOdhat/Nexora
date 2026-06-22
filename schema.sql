-- Nexora PostgreSQL Database Schema
-- Production-ready relational design

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Products Catalog Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    rating DECIMAL(3, 2) DEFAULT 4.5,
    rating_count INT DEFAULT 12,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    tag VARCHAR(50),
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Cart Items Table (Linked by user email)
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a unique constraint on user-product mapping for cart updates
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_user_product ON cart_items(user_email, product_id);

-- 3. Wishlist Items Table
CREATE TABLE IF NOT EXISTS wishlist_items (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a unique index on user-product for wishlist
CREATE UNIQUE INDEX IF NOT EXISTS idx_wishlist_user_product ON wishlist_items(user_email, product_id);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY, -- e.g., NX-ORD-123456
    user_email VARCHAR(255) NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT,
    payment_method VARCHAR(100) DEFAULT 'Quantum-Pay',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL
);

-- 6. AI Companion Chat Logs
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for speedy queries
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_email);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_email);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_email);
