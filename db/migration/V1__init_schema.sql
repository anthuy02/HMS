-- ==============================================================================
-- HMS Database Migration V1: Initial Schema (PostgreSQL 17)
-- 15 Relational Tables, UUID v4, 144 Constraints, Snake_case, btree_gist
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 1. USERS [F01]
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPER')),
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    failed_attempts INT NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. AUTH_TOKENS [F01]
CREATE TABLE auth_tokens (
    token UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT ck_token_ttl CHECK (expires_at = issued_at + INTERVAL '30 minutes')
);

-- 3. ROOM_TYPES [F02]
CREATE TABLE room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    max_capacity INT NOT NULL CHECK (max_capacity BETWEEN 1 AND 6),
    base_nightly_rate NUMERIC(15, 0) NOT NULL CHECK (base_nightly_rate BETWEEN 1 AND 100000000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. ROOMS [F02]
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number VARCHAR(10) NOT NULL,
    floor INT NOT NULL CHECK (floor >= 1),
    room_type_id UUID NOT NULL REFERENCES room_types(id),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'CLEANING', 'OUT_OF_SERVICE')),
    maintenance_reason VARCHAR(200),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_room_number UNIQUE (room_number)
);

-- 5. SYSTEM_CONFIG [UC-03]
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deposit_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 30.00 CHECK (deposit_rate_percent >= 0),
    service_fee_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00 CHECK (service_fee_rate_percent >= 0),
    vat_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 10.00 CHECK (vat_rate_percent >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. HOLIDAYS [UC-03, BR-33]
CREATE TABLE holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_month VARCHAR(5) UNIQUE NOT NULL CHECK (day_month ~ '^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])$'),
    name VARCHAR(100) NOT NULL
);

-- 7. VOUCHERS [UC-05, BR-40, BR-44]
CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    discount_type VARCHAR(10) NOT NULL CHECK (discount_type IN ('PERCENT', 'FIXED')),
    discount_value NUMERIC(15, 2) NOT NULL CHECK (discount_value > 0),
    max_discount_amount NUMERIC(15, 0),
    min_nights INT NOT NULL DEFAULT 1 CHECK (min_nights >= 1),
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT ck_voucher_date_range CHECK (valid_to >= valid_from)
);

-- 8. RESERVATIONS [F03]
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_code VARCHAR(20) UNIQUE NOT NULL,
    booking_type VARCHAR(10) NOT NULL CHECK (booking_type IN ('NIGHTLY', 'HOURLY')),
    guest_name VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL CHECK (guest_phone ~ '^[0-9]{9,11}$'),
    guest_email VARCHAR(100),
    room_type_id UUID NOT NULL REFERENCES room_types(id),
    room_id UUID REFERENCES rooms(id),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    hourly_start_time TIMESTAMPTZ,
    hourly_duration_hours INT CHECK (hourly_duration_hours BETWEEN 1 AND 10),
    stay_range TSTZRANGE,
    adult_count INT NOT NULL DEFAULT 1 CHECK (adult_count >= 1),
    child_count INT NOT NULL DEFAULT 0 CHECK (child_count >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW')),
    total_price NUMERIC(15, 0) NOT NULL DEFAULT 0,
    deposit_required NUMERIC(15, 0) NOT NULL DEFAULT 0,
    deposit_paid NUMERIC(15, 0) NOT NULL DEFAULT 0,
    deposit_forfeited NUMERIC(15, 0) NOT NULL DEFAULT 0,
    snap_nightly_rate NUMERIC(15, 0) NOT NULL,
    snap_voucher_code VARCHAR(30),
    actual_check_in_time TIMESTAMPTZ,
    actual_check_out_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_reservation_nightly_nights CHECK (booking_type != 'NIGHTLY' OR (check_out_date - check_in_date BETWEEN 1 AND 30)),
    CONSTRAINT excl_room_occupancy EXCLUDE USING gist (room_id WITH =, stay_range WITH &&) WHERE (status IN ('CONFIRMED', 'CHECKED_IN'))
);

-- 9. RESERVATION_HOLIDAY_NIGHTS [F03, BR-33]
CREATE TABLE reservation_holiday_nights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    holiday_date DATE NOT NULL,
    surcharge_amount NUMERIC(15, 0) NOT NULL DEFAULT 0,
    CONSTRAINT uq_res_holiday_date UNIQUE (reservation_id, holiday_date)
);

-- 10. SERVICE_CATALOG_ITEMS [F06, BR-110]
CREATE TABLE service_catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('MINIBAR', 'LAUNDRY')),
    unit_price NUMERIC(15, 0) NOT NULL CHECK (unit_price BETWEEN 1 AND 5000000),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 11. SERVICE_CHARGE_LINES [F06, BR-34..37]
CREATE TABLE service_charge_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    service_item_id UUID REFERENCES service_catalog_items(id),
    type VARCHAR(10) NOT NULL CHECK (type IN ('MINIBAR', 'LAUNDRY', 'DAMAGE')),
    quantity INT NOT NULL CHECK (quantity >= 1),
    unit_price_snapshot NUMERIC(15, 0) NOT NULL CHECK (unit_price_snapshot > 0),
    total_amount NUMERIC(15, 0) NOT NULL CHECK (total_amount > 0),
    damage_note VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_damage_note_required CHECK (type != 'DAMAGE' OR (damage_note IS NOT NULL AND length(trim(damage_note)) > 0))
);

-- 12. CLEANING_TASKS [F06, BR-111..114]
CREATE TABLE cleaning_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id),
    assigned_to_user_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
    notes VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- 13. INVOICES [F05, BR-50, BR-54]
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(20) UNIQUE NOT NULL,
    reservation_id UUID NOT NULL REFERENCES reservations(id),
    room_charge NUMERIC(15, 0) NOT NULL DEFAULT 0,
    holiday_surcharge NUMERIC(15, 0) NOT NULL DEFAULT 0,
    early_checkin_surcharge NUMERIC(15, 0) NOT NULL DEFAULT 0,
    late_checkout_surcharge NUMERIC(15, 0) NOT NULL DEFAULT 0,
    extra_person_surcharge NUMERIC(15, 0) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(15, 0) NOT NULL DEFAULT 0,
    service_fee NUMERIC(15, 0) NOT NULL DEFAULT 0,
    services_total NUMERIC(15, 0) NOT NULL DEFAULT 0,
    vat_amount NUMERIC(15, 0) NOT NULL DEFAULT 0,
    total_amount NUMERIC(15, 0) NOT NULL DEFAULT 0,
    deposit_deducted NUMERIC(15, 0) NOT NULL DEFAULT 0,
    amount_due NUMERIC(15, 0) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ISSUED')),
    issued_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger đảm bảo tính bất biến của hóa đơn sau khi ISSUED (BR-54)
CREATE OR REPLACE FUNCTION fn_prevent_issued_invoice_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'ISSUED' THEN
        RAISE EXCEPTION 'Quy tắc [BR-54]: Hóa đơn đã xuất (ISSUED) là bất biến, nghiêm cấm chỉnh sửa hoặc xóa.'
            USING ERRCODE = 'P0001';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_immutable
BEFORE UPDATE OR DELETE ON invoices
FOR EACH ROW
EXECUTE FUNCTION fn_prevent_issued_invoice_modification();

-- 14. PAYMENT_TRANSACTIONS [F05, BR-26, BR-84..86]
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    reservation_id UUID NOT NULL REFERENCES reservations(id),
    invoice_id UUID REFERENCES invoices(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('DEPOSIT_CHARGE', 'DEPOSIT_REFUND', 'CHECKOUT_CHARGE', 'CHECKOUT_REFUND')),
    amount NUMERIC(15, 0) NOT NULL CHECK (amount > 0),
    gateway_reference VARCHAR(100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 15. IDEMPOTENCY_RECORDS [BR-90, BR-91]
CREATE TABLE idempotency_records (
    key VARCHAR(100) PRIMARY KEY,
    request_hash VARCHAR(64) NOT NULL,
    response_status INT NOT NULL,
    response_body TEXT,
    locked_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
