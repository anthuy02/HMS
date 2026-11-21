-- ==============================================================================
-- HMS Database Migration V2: Seed Data (Khớp Phụ lục BR v1.2)
-- 5 Tài khoản Oracle, 3 Loại phòng, 6 Phòng, 4 Ngày lễ, 6 Dịch vụ, 2 Voucher
-- Mật khẩu mẫu: Hotel@2026 (BCrypt $2a$10$ hashed)
-- ==============================================================================

-- 1. SEED USERS (Password: Hotel@2026 -> $2a$10$w0f4iWq6Kj9uN9mY9o9q7Oq9uN9mY9o9q7Oq9uN9mY9o9q7Oq9uN9)
INSERT INTO users (id, username, password_hash, full_name, role, phone, email, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'admin01', crypt('Hotel@2026', gen_salt('bf', 10)), 'Quản trị viên Hệ thống', 'ADMIN', '0901111222', 'admin@hotel.vn', TRUE),
('00000000-0000-0000-0000-000000000002', 'quanly01', crypt('Hotel@2026', gen_salt('bf', 10)), 'Quản lý Khách sạn', 'MANAGER', '0903333444', 'manager@hotel.vn', TRUE),
('00000000-0000-0000-0000-000000000003', 'letan01', crypt('Hotel@2026', gen_salt('bf', 10)), 'Lễ tân Ca trực', 'RECEPTIONIST', '0905555666', 'receptionist@hotel.vn', TRUE),
('00000000-0000-0000-0000-000000000004', 'donphong01', crypt('Hotel@2026', gen_salt('bf', 10)), 'Nhân viên Dọn phòng 01', 'HOUSEKEEPER', '0907777888', 'housekeeper1@hotel.vn', TRUE),
('00000000-0000-0000-0000-000000000005', 'donphong02', crypt('Hotel@2026', gen_salt('bf', 10)), 'Nhân viên Dọn phòng 02', 'HOUSEKEEPER', '0909999000', 'housekeeper2@hotel.vn', TRUE)
ON CONFLICT (username) DO NOTHING;

-- 2. SEED SYSTEM_CONFIG (BR-88: 30% Cọc, 5% Phí dịch vụ, 10% VAT)
INSERT INTO system_config (id, deposit_rate_percent, service_fee_rate_percent, vat_rate_percent) VALUES
('00000000-0000-0000-0000-000000000010', 30.00, 5.00, 10.00)
ON CONFLICT DO NOTHING;

-- 3. SEED ROOM_TYPES (BR-101: STANDARD 600k 2 cap, DELUXE 1M 3 cap, SUITE 1.8M 4 cap)
INSERT INTO room_types (id, name, max_capacity, base_nightly_rate) VALUES
('00000000-0000-0000-0000-000000000101', 'STANDARD', 2, 600000),
('00000000-0000-0000-0000-000000000102', 'DELUXE', 3, 1000000),
('00000000-0000-0000-0000-000000000103', 'SUITE', 4, 1800000)
ON CONFLICT (name) DO NOTHING;

-- 4. SEED ROOMS (BR-101: 6 phòng chuẩn: 101-103, 201-202, 301)
INSERT INTO rooms (id, room_number, floor, room_type_id, status) VALUES
('00000000-0000-0000-0000-000000000201', '101', 1, '00000000-0000-0000-0000-000000000101', 'AVAILABLE'),
('00000000-0000-0000-0000-000000000202', '102', 1, '00000000-0000-0000-0000-000000000101', 'AVAILABLE'),
('00000000-0000-0000-0000-000000000203', '103', 1, '00000000-0000-0000-0000-000000000101', 'AVAILABLE'),
('00000000-0000-0000-0000-000000000204', '201', 2, '00000000-0000-0000-0000-000000000102', 'AVAILABLE'),
('00000000-0000-0000-0000-000000000205', '202', 2, '00000000-0000-0000-0000-000000000102', 'AVAILABLE'),
('00000000-0000-0000-0000-000000000206', '301', 3, '00000000-0000-0000-0000-000000000103', 'AVAILABLE')
ON CONFLICT (room_number) DO NOTHING;

-- 5. SEED HOLIDAYS (BR-33: 01/01, 30/04, 01/05, 02/09)
INSERT INTO holidays (id, day_month, name) VALUES
('00000000-0000-0000-0000-000000000301', '01/01', 'Tết Dương Lịch'),
('00000000-0000-0000-0000-000000000302', '30/04', 'Ngày Giải Phóng Miền Nam'),
('00000000-0000-0000-0000-000000000303', '01/05', 'Quốc Tế Lao Động'),
('00000000-0000-0000-0000-000000000304', '02/09', 'Quốc Khánh')
ON CONFLICT (day_month) DO NOTHING;

-- 6. SEED SERVICE_CATALOG_ITEMS (BR-34, BR-35, BR-110: MB01-MB05, LD01)
INSERT INTO service_catalog_items (id, code, name, type, unit_price, is_active) VALUES
('00000000-0000-0000-0000-000000000401', 'MB01', 'Nước suối 500ml', 'MINIBAR', 15000, TRUE),
('00000000-0000-0000-0000-000000000402', 'MB02', 'Nước ngọt lon', 'MINIBAR', 25000, TRUE),
('00000000-0000-0000-0000-000000000403', 'MB03', 'Bia lon', 'MINIBAR', 40000, TRUE),
('00000000-0000-0000-0000-000000000404', 'MB04', 'Snack khoai tây', 'MINIBAR', 30000, TRUE),
('00000000-0000-0000-0000-000000000405', 'MB05', 'Rượu vang mini', 'MINIBAR', 50000, TRUE),
('00000000-0000-0000-0000-000000000406', 'LD01', 'Giặt ủi (mỗi món)', 'LAUNDRY', 25000, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 7. SEED VOUCHERS (BR-40, BR-44: SALE10, OFF300K)
INSERT INTO vouchers (id, code, discount_type, discount_value, max_discount_amount, min_nights, valid_from, valid_to, is_active) VALUES
('00000000-0000-0000-0000-000000000501', 'SALE10', 'PERCENT', 10.00, 200000, 2, '2026-01-01', '2026-12-31', TRUE),
('00000000-0000-0000-0000-000000000502', 'OFF300K', 'FIXED', 300000, NULL, 1, '2026-01-01', '2026-12-31', TRUE)
ON CONFLICT (code) DO NOTHING;
