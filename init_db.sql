-- ========================================================
-- FluxFast Modular Features E-Commerce Database Schema (MySQL 8.4+)
-- 5 Related Tables: categories, customers, products, orders, order_items
-- ========================================================

CREATE DATABASE IF NOT EXISTS ecommerce_modular CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce_modular;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    tier VARCHAR(20) NOT NULL DEFAULT 'standard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customer_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    sku VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_sku (sku),
    INDEX idx_product_category (category_id),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_number VARCHAR(32) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_orders_customer (customer_id),
    INDEX idx_orders_status (status),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id),
    CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data
INSERT IGNORE INTO categories (id, slug, name, description) VALUES
(1, 'electronics', 'Electronics', 'Consumer electronics, laptops, audio and gadgets'),
(2, 'apparel', 'Apparel', 'Modern casual, athletic wear and apparel'),
(3, 'home-living', 'Home & Living', 'Home decor, ergonomic office furniture, and kitchenware'),
(4, 'books', 'Books', 'Technical computing, architecture, and business books');

INSERT IGNORE INTO customers (id, email, name, tier) VALUES
(1, 'alice@example.com', 'Alice Johnson', 'gold'),
(2, 'bob@example.com', 'Bob Smith', 'standard'),
(3, 'carol@example.com', 'Carol Danvers', 'platinum');

INSERT IGNORE INTO products (id, category_id, sku, name, price, stock_quantity, is_active) VALUES
(1, 1, 'PROD-MBP', 'MacBook Pro M3 Max', 2499.00, 14, TRUE),
(2, 1, 'PROD-WCH', 'Wireless Noise-Canceling Headphones', 299.99, 45, TRUE),
(3, 2, 'PROD-TEE', 'Organic Cotton Minimalist T-Shirt', 29.50, 120, TRUE),
(4, 2, 'PROD-HDY', 'Merino Wool Technical Hoodie', 89.00, 58, TRUE),
(5, 3, 'PROD-DSK', 'Motorized Standing Desk 60x30', 480.00, 7, TRUE),
(6, 3, 'PROD-LMP', 'Architect LED Desk Task Lamp', 65.00, 32, TRUE),
(7, 4, 'PROD-DDIA', 'Designing Data-Intensive Applications', 49.99, 85, TRUE);

INSERT IGNORE INTO orders (id, customer_id, order_number, status, total_amount, notes) VALUES
(1, 1, 'ORD-2026-001', 'completed', 2798.99, 'Express shipping requested'),
(2, 2, 'ORD-2026-002', 'processing', 124.00, 'Standard ground shipping'),
(3, 3, 'ORD-2026-003', 'pending', 480.00, 'Hold at front desk');

INSERT IGNORE INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 1, 2499.00, 2499.00),
(2, 1, 2, 1, 299.99, 299.99),
(3, 2, 3, 2, 29.50, 59.00),
(4, 2, 6, 1, 65.00, 65.00),
(5, 3, 5, 1, 480.00, 480.00);
