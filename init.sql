-- ==========================================
-- 1. Database Initialization
-- ==========================================

-- Check if wms_order database exists, if not create it
SELECT count(*) = 0 as db_not_exist FROM pg_database WHERE datname = 'wms_order' \gset
\if :db_not_exist
  CREATE DATABASE wms_order;
\endif

-- Ensure the wms user has full permissions on the wms_order database
GRANT ALL PRIVILEGES ON DATABASE wms_order TO wms;


-- ==========================================
-- 2. Schema and Mock Data for wms_core
-- ==========================================
\c wms_core;

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Entity Framework PascalCase casing wrapped in double quotes)
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Email" VARCHAR(255) NOT NULL,
    "PasswordHash" VARCHAR(255) NOT NULL,
    "FullName" VARCHAR(255) NOT NULL,
    "Role" VARCHAR(50) NOT NULL DEFAULT 'User',
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_Email" ON "Users" ("Email");

-- Categories Table
CREATE TABLE IF NOT EXISTS "Categories" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" VARCHAR(255) NOT NULL,
    "Description" TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Categories_Name" ON "Categories" ("Name");

-- Products Table
CREATE TABLE IF NOT EXISTS "Products" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" VARCHAR(255) NOT NULL,
    "Description" TEXT,
    "Price" DECIMAL(18,2) NOT NULL,
    "Stock" INT NOT NULL DEFAULT 0,
    "CategoryId" UUID NOT NULL,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_category FOREIGN KEY ("CategoryId") REFERENCES "Categories" ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_Products_CategoryId" ON "Products" ("CategoryId");

-- Grant permissions for wms_core schema objects to the wms user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO wms;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO wms;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO wms;

-- Insert Mock Users (Passwords are hashed "password123" via BCrypt)
INSERT INTO "Users" ("Id", "Email", "PasswordHash", "FullName", "Role", "CreatedAt")
VALUES 
('f0000000-0000-0000-0000-000000000000', 'admin@wms.com', '$2b$10$J9sKibJrjclqUwDQfz8HruVX9LM1A1QEVrKExSRB7XZd4ByOEzxeu', 'System Administrator', 'Admin', NOW()),
('f1111111-1111-1111-1111-111111111111', 'operator@wms.com', '$2b$10$J9sKibJrjclqUwDQfz8HruVX9LM1A1QEVrKExSRB7XZd4ByOEzxeu', 'Warehouse Operator', 'User', NOW())
ON CONFLICT ("Email") DO NOTHING;

-- Insert Mock Categories
INSERT INTO "Categories" ("Id", "Name", "Description")
VALUES 
('11111111-1111-1111-1111-111111111111', 'Electronics', 'Electronic devices, gadgets, and accessories.'),
('22222222-2222-2222-2222-222222222222', 'Office Supplies', 'Pens, notebooks, desk accessories, and organizers.'),
('33333333-3333-3333-3333-333333333333', 'Apparel', 'Branded clothing, t-shirts, hoodies, and hats.')
ON CONFLICT ("Name") DO NOTHING;

-- Insert Mock Products
INSERT INTO "Products" ("Id", "Name", "Description", "Price", "Stock", "CategoryId", "CreatedAt")
VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mechanical Keyboard', 'RGB mechanical keyboard with red linear switches.', 89.99, 25, '11111111-1111-1111-1111-111111111111', NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Gaming Mouse', 'Wireless gaming mouse with 20K DPI optical sensor.', 49.50, 15, '11111111-1111-1111-1111-111111111111', NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ergonomic Office Chair', 'High-back ergonomic chair with lumbar support.', 199.00, 5, '22222222-2222-2222-2222-222222222222', NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'WMS Cotton Hoodie', 'Super cozy branded cotton hoodie.', 35.00, 50, '33333333-3333-3333-3333-333333333333', NOW())
ON CONFLICT ("Id") DO NOTHING;


-- ==========================================
-- 3. Schema and Mock Data for wms_order
-- ==========================================
\c wms_order;

-- Orders Table (GORM snake_case naming conventions)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    total_amount DECIMAL(18,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(18,2) NOT NULL,
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

-- Grant permissions for wms_order schema objects to the wms user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO wms;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO wms;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO wms;

-- Insert Mock Orders
INSERT INTO orders (id, user_id, total_amount, status, created_at, updated_at)
VALUES 
('e0000000-0000-0000-0000-000000000000', 'f1111111-1111-1111-1111-111111111111', 139.49, 'Confirmed', NOW() - INTERVAL '1 DAY', NOW() - INTERVAL '1 DAY')
ON CONFLICT (id) DO NOTHING;

-- Insert Mock Order Items
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price)
VALUES 
('e0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mechanical Keyboard', 1, 89.99),
('e0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000000', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Gaming Mouse', 1, 49.50)
ON CONFLICT (id) DO NOTHING;
