-- ========================================================
-- DATABASE SCHEMA: MULTI-TENANT WMS & ERP SYSTEM
-- PostgreSQL Compatible
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 1. SUBSCRIPTION & TENANT MANAGEMENT
-- ========================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,        -- 'BASIC_MONTHLY', 'PRO_YEARLY', 'ENTERPRISE'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    billing_cycle VARCHAR(20) NOT NULL,      -- 'MONTHLY', 'YEARLY', 'LIFETIME'
    
    -- Feature Quota Limits
    max_warehouses INT NOT NULL DEFAULT 1,
    max_users INT NOT NULL DEFAULT 3,
    max_products INT NOT NULL DEFAULT 1000,
    
    -- Feature & Menu Access Flags
    has_lot_tracking BOOLEAN NOT NULL DEFAULT FALSE,
    has_barcode_scanner BOOLEAN NOT NULL DEFAULT FALSE,
    has_cycle_count BOOLEAN NOT NULL DEFAULT FALSE,
    has_analytics_reports BOOLEAN NOT NULL DEFAULT FALSE,
    has_import_export BOOLEAN NOT NULL DEFAULT FALSE,
    has_api_access BOOLEAN NOT NULL DEFAULT FALSE,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    
    status VARCHAR(50) NOT NULL DEFAULT 'trialing', 
    -- 'trialing', 'active', 'past_due', 'canceled', 'expired'
    
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    current_period_starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    canceled_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscription_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    
    invoice_number VARCHAR(100) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'FAILED', 'REFUNDED'
    
    payment_method VARCHAR(50),
    payment_gateway_ref VARCHAR(255),
    paid_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, invoice_number)
);

-- ========================================================
-- 2. USER MANAGEMENT
-- ========================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff', -- 'admin', 'manager', 'staff'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

-- ========================================================
-- 3. SYSTEM & TENANT MASTER DATA
-- ========================================================

-- Global System Masters (No tenant_id)
CREATE TABLE barcode_symbologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,         -- 'CODE128', 'EAN13', 'QR_CODE'
    name VARCHAR(100) NOT NULL,
    description TEXT
);

INSERT INTO barcode_symbologies (code, name, description) VALUES
('CODE128', 'Code 128', 'บาร์โค้ดมาตรฐาน 1 มิติที่ใช้แพร่หลายในคลังสินค้า'),
('EAN13', 'EAN-13', 'บาร์โค้ดมาตรฐานสินค้าอุปโภคบริโภค 13 หลัก'),
('QR_CODE', 'QR Code', 'บาร์โค้ด 2 มิติ เก็บข้อมูลได้ปริมาณมาก');

CREATE TABLE discount_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,         -- 'PERCENTAGE', 'FIXED_AMOUNT'
    name VARCHAR(100) NOT NULL,
    description TEXT
);

INSERT INTO discount_types (code, name, description) VALUES
('PERCENTAGE', 'Percentage Discount', 'ส่วนลดคิดเป็นเปอร์เซ็นต์ (%)'),
('FIXED_AMOUNT', 'Fixed Amount Discount', 'ส่วนลดคิดเป็นจำนวนเงินคงที่');

-- Tenant Masters
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,                -- เช่น 'PCS', 'BOX', 'KG'
    name VARCHAR(100) NOT NULL,               -- เช่น 'ชิ้น', 'กล่อง', 'กิโลกรัม'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE TABLE manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE TABLE tax_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,                -- เช่น 'VAT_7', 'VAT_0', 'EXEMPT'
    name VARCHAR(100) NOT NULL,
    rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    is_inclusive BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,               -- เช่น WH-01
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE TABLE bin_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,               -- เช่น A-01-01
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, code)
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

-- ========================================================
-- 4. PRODUCTS & IMAGES MANAGEMENT
-- ========================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Mandatory Foreign Keys
    base_unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    
    -- Optional Foreign Keys
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
    barcode_symbology_id UUID REFERENCES barcode_symbologies(id) ON DELETE SET NULL,
    tax_type_id UUID REFERENCES tax_types(id) ON DELETE SET NULL,
    
    -- Identification & Codes
    code VARCHAR(100) NOT NULL,              -- รหัสสินค้า
    sku VARCHAR(100) NOT NULL,               -- SKU สำหรับสต็อก
    barcode VARCHAR(100),                    -- บาร์โค้ด
    slug VARCHAR(255),                       -- e-Commerce Slug
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    warranty_period_days INT DEFAULT 0,
    
    -- Pricing
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    
    -- [ADDED] Physical Dimensions & Weight
    weight_kg NUMERIC(8, 3) DEFAULT 0.000,   -- น้ำหนัก (กิโลกรัม)
    width_cm NUMERIC(8, 2) DEFAULT 0.00,     -- ความกว้าง (ซม.)
    length_cm NUMERIC(8, 2) DEFAULT 0.00,    -- ความยาว (ซม.)
    height_cm NUMERIC(8, 2) DEFAULT 0.00,    -- ความสูง (ซม.)
    
    -- [ADDED] Inventory Planning & Reorder Controls
    reorder_point NUMERIC(12, 4) DEFAULT 0.0000,    -- จุดสั่งซื้อเพิ่ม (เมื่อสต็อกรวม <= ค่านี)
    min_reorder_qty NUMERIC(12, 4) DEFAULT 0.0000,  -- จำนวนขั้นต่ำที่ต้องสั่งซื้อเติม
    
    -- WMS Controls
    is_lot_control BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, code),
    UNIQUE(tenant_id, sku),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 5. PRODUCT LOTS & INVENTORY BALANCES
-- ========================================================

CREATE TABLE product_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    lot_number VARCHAR(100) NOT NULL,
    manufactured_date DATE,
    expiration_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, product_id, lot_number)
);

CREATE TABLE inventory_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    bin_location_id UUID REFERENCES bin_locations(id) ON DELETE SET NULL,
    lot_id UUID REFERENCES product_lots(id) ON DELETE SET NULL,
    quantity_on_hand NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    quantity_reserved NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_inventory_balance UNIQUE NULLS NOT DISTINCT (tenant_id, product_id, warehouse_id, bin_location_id, lot_id)
);

-- ========================================================
-- 6. STOCK TRANSACTIONS & AUDIT
-- ========================================================

CREATE TABLE stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL,   -- 'RECEIVE', 'ISSUE', 'TRANSFER', 'ADJUSTMENT'
    document_no VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, document_no)
);

CREATE TABLE stock_transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES stock_transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    lot_id UUID REFERENCES product_lots(id) ON DELETE SET NULL,
    
    from_warehouse_id UUID REFERENCES warehouses(id),
    from_bin_location_id UUID REFERENCES bin_locations(id),
    to_warehouse_id UUID REFERENCES warehouses(id),
    to_bin_location_id UUID REFERENCES bin_locations(id),
    
    quantity NUMERIC(12, 4) NOT NULL,
    unit_price NUMERIC(12, 2) DEFAULT 0.00,
    
    discount_type_id UUID REFERENCES discount_types(id) ON DELETE SET NULL,
    discount_value NUMERIC(12, 2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    count_no VARCHAR(100) NOT NULL,            -- เลขที่ใบนับ เช่น SC-202608-001
    count_type VARCHAR(50) NOT NULL DEFAULT 'CYCLE_COUNT',
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    notes TEXT,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, count_no)
);

CREATE TABLE stock_count_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    stock_count_id UUID NOT NULL REFERENCES stock_counts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    bin_location_id UUID REFERENCES bin_locations(id),
    lot_id UUID REFERENCES product_lots(id),
    
    system_quantity NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    counted_quantity NUMERIC(12, 4),
    variance_quantity NUMERIC(12, 4) GENERATED ALWAYS AS (counted_quantity - system_quantity) STORED,
    
    counted_by UUID REFERENCES users(id),
    counted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 7. PERFORMANCE & TENANT ISOLATION INDEXES
-- ========================================================

-- Subscriptions & Tenants
CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id, status);
CREATE INDEX idx_subscriptions_expiry ON subscriptions(status, current_period_ends_at);
CREATE INDEX idx_invoices_tenant ON subscription_invoices(tenant_id, status);

-- Products & Master Data
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_products_tenant_code ON products(tenant_id, code);
CREATE INDEX idx_products_tenant_sku ON products(tenant_id, sku);
CREATE INDEX idx_products_barcode ON products(tenant_id, barcode);
CREATE INDEX idx_products_reorder ON products(tenant_id, reorder_point);
CREATE INDEX idx_products_brand ON products(tenant_id, brand_id);
CREATE INDEX idx_product_images_product ON product_images(tenant_id, product_id);

-- WMS Core Operations
CREATE INDEX idx_bins_warehouse ON bin_locations(warehouse_id);
CREATE INDEX idx_lots_product ON product_lots(tenant_id, product_id, expiration_date);
CREATE INDEX idx_balances_lookup ON inventory_balances(tenant_id, product_id, warehouse_id, bin_location_id, lot_id);
CREATE INDEX idx_transactions_tenant ON stock_transactions(tenant_id, transaction_type);
CREATE INDEX idx_tx_items_transaction ON stock_transaction_items(transaction_id);
CREATE INDEX idx_count_items_count_id ON stock_count_items(stock_count_id);