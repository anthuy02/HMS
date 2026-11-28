-- =====================================================================
-- HMS – Dữ liệu mẫu cố định (Phụ lục Business Rules v1.2), lược đồ v2
-- Chỉ dùng cho môi trường test / demo. Không chạy trên môi trường thật.
-- Mật khẩu mẫu Hotel@2026 được băm BCrypt bằng pgcrypto ($2a$, cost 10),
-- tương thích BCryptPasswordEncoder của Spring Security.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (username, password_hash, role) VALUES
    ('admin01',    crypt('Hotel@2026', gen_salt('bf', 10)), 'ADMIN'),
    ('quanly01',   crypt('Hotel@2026', gen_salt('bf', 10)), 'MANAGER'),
    ('letan01',    crypt('Hotel@2026', gen_salt('bf', 10)), 'RECEPTIONIST'),
    ('donphong01', crypt('Hotel@2026', gen_salt('bf', 10)), 'HOUSEKEEPER'),
    ('donphong02', crypt('Hotel@2026', gen_salt('bf', 10)), 'HOUSEKEEPER');

INSERT INTO system_config (id, deposit_rate_percent, service_fee_rate_percent, vat_rate_percent)
VALUES (1, 30.00, 5.00, 10.00);

INSERT INTO holidays (month_day, holiday_name) VALUES
    ('01-01', 'Tết Dương lịch'),
    ('04-30', 'Ngày Giải phóng miền Nam'),
    ('05-01', 'Quốc tế Lao động'),
    ('09-02', 'Quốc khánh');

INSERT INTO room_types (room_type_name, max_capacity, base_nightly_rate) VALUES
    ('STANDARD', 2,  600000),
    ('DELUXE',   3, 1000000),
    ('SUITE',    4, 1800000);

INSERT INTO rooms (room_number, room_type_id)
SELECT r.num, t.room_type_id
FROM (VALUES ('101','STANDARD'), ('102','STANDARD'), ('103','STANDARD'),
             ('201','DELUXE'),   ('202','DELUXE'),
             ('301','SUITE')) AS r(num, type_name)
JOIN room_types t ON t.room_type_name = r.type_name;

INSERT INTO service_catalog_items (code, name, category, unit_price) VALUES
    ('MB01', 'Nước suối 500 ml',  'MINIBAR', 15000),
    ('MB02', 'Nước ngọt lon',     'MINIBAR', 25000),
    ('MB03', 'Bia lon',           'MINIBAR', 40000),
    ('MB04', 'Snack khoai tây',   'MINIBAR', 30000),
    ('MB05', 'Rượu vang mini',    'MINIBAR', 50000),
    ('LD01', 'Giặt ủi (mỗi món)', 'LAUNDRY', 25000);

INSERT INTO vouchers (code, type, value, max_discount, min_nights, valid_from, valid_to) VALUES
    ('SALE10',  'PERCENT',     10.00, 200000, 2, DATE '2026-01-01', DATE '2026-12-31'),
    ('OFF300K', 'FIXED',   300000.00,   NULL, 1, DATE '2026-01-01', DATE '2026-12-31');
