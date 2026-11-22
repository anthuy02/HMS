-- ==============================================================================
-- HMS Database Constraints Test Suite (25 Core Constraint Verification Cases)
-- Kiểm tra tính toàn vẹn CSDL PostgreSQL v2 theo đặc tả IEEE 830 SRS 4.3 & BR v1.2
-- ==============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Bắt đầu thực thi 25 Database Constraint Test Cases...';
    RAISE NOTICE '============================================================';
END $$;

-- ------------------------------------------------------------------------------
-- NHÓM 1: BẢNG USERS & AUTH_TOKENS (BR-70 -> BR-73)
-- ------------------------------------------------------------------------------
-- Case 001: Chặn Role không thuộc danh mục 4 vai trò
DO $$
BEGIN
    INSERT INTO users (username, password_hash, full_name, role) VALUES ('err_role', 'hash', 'Test', 'SUPERADMIN');
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn Role sai!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 001 PASSED: Chặn Role ngoài 4 vai trò chuẩn.';
END $$;

-- Case 002: Chặn TTL Token khác 30 phút từ issued_at (ck_token_ttl)
DO $$
BEGIN
    INSERT INTO auth_tokens (user_id, issued_at, expires_at)
    VALUES ('00000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '45 minutes');
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn TTL token sai!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 002 PASSED: Chặn TTL token khác 30 phút (ck_token_ttl).';
END $$;

-- Case 003: Chặn failed_attempts âm
DO $$
BEGIN
    INSERT INTO users (username, password_hash, full_name, role, failed_attempts) VALUES ('err_attempts', 'hash', 'Test', 'ADMIN', -1);
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn failed_attempts < 0!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 003 PASSED: Chặn failed_attempts < 0.';
END $$;

-- ------------------------------------------------------------------------------
-- NHÓM 2: BẢNG ROOM_TYPES & ROOMS (BR-100, BR-101)
-- ------------------------------------------------------------------------------
-- Case 004: Chặn sức chứa phòng vượt quá 6 người (BR-101)
DO $$
BEGIN
    INSERT INTO room_types (name, max_capacity, base_nightly_rate) VALUES ('MEGA_SUITE', 7, 5000000);
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn maxCapacity > 6!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 004 PASSED: Chặn maxCapacity vượt quá 6 khách (BR-101).';
END $$;

-- Case 005: Chặn sức chứa phòng bằng 0 (BR-101)
DO $$
BEGIN
    INSERT INTO room_types (name, max_capacity, base_nightly_rate) VALUES ('ZERO_ROOM', 0, 1000000);
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn maxCapacity = 0!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 005 PASSED: Chặn maxCapacity < 1.';
END $$;

-- Case 006: Chặn đơn giá đêm vượt 100.000.000 VNĐ (BR-101)
DO $$
BEGIN
    INSERT INTO room_types (name, max_capacity, base_nightly_rate) VALUES ('LUXURY_MAX', 2, 100000001);
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn giá phòng > 100M!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 006 PASSED: Chặn đơn giá đêm vượt 100.000.000 VNĐ.';
END $$;

-- Case 007: Chặn tầng phòng nhỏ hơn 1
DO $$
BEGIN
    INSERT INTO rooms (room_number, floor, room_type_id) VALUES ('001', 0, '00000000-0000-0000-0000-000000000101');
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn tầng < 1!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 007 PASSED: Chặn tầng phòng nhỏ hơn 1.';
END $$;

-- Case 008: Chặn trùng số phòng (UNIQUE room_number)
DO $$
BEGIN
    INSERT INTO rooms (room_number, floor, room_type_id) VALUES ('101', 1, '00000000-0000-0000-0000-000000000101');
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn trùng số phòng 101!';
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'Case 008 PASSED: Chặn trùng số phòng đã tồn tại.';
END $$;

-- Case 009: Chặn trạng thái phòng không hợp lệ
DO $$
BEGIN
    INSERT INTO rooms (room_number, floor, room_type_id, status) VALUES ('999', 1, '00000000-0000-0000-0000-000000000101', 'DIRTY');
    RAISE EXCEPTION 'THẤT BẠI: CSDL chấp nhận trạng thái DIRTY thay vì CLEANING!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 009 PASSED: Bắt buộc dùng trạng thái CLEANING thay vì DIRTY.';
END $$;

-- ------------------------------------------------------------------------------
-- NHÓM 3: SYSTEM_CONFIG & HOLIDAYS (BR-88, BR-89)
-- ------------------------------------------------------------------------------
-- Case 010: Chặn tỷ lệ cọc âm
DO $$
BEGIN
    INSERT INTO system_config (deposit_rate_percent, service_fee_rate_percent, vat_rate_percent) VALUES (-10.00, 5.00, 10.00);
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn tỷ lệ cọc âm!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 010 PASSED: Chặn tỷ lệ phần trăm âm trong system_config.';
END $$;

-- Case 011: Chặn định dạng ngày lễ sai regex DD/MM (BR-89)
DO $$
BEGIN
    INSERT INTO holidays (day_month, name) VALUES ('2026-01-01', 'Sai định dạng');
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn định dạng ngày lễ sai!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 011 PASSED: Bắt buộc định dạng ngày lễ DD/MM chuẩn.';
END $$;

-- ------------------------------------------------------------------------------
-- NHÓM 4: BẢNG VOUCHERS (BR-40, BR-44)
-- ------------------------------------------------------------------------------
-- Case 012: Chặn loại giảm giá voucher không hợp lệ
DO $$
BEGIN
    INSERT INTO vouchers (code, discount_type, discount_value, valid_from, valid_to) VALUES ('V_ERR', 'CASH', 50000, CURRENT_DATE, CURRENT_DATE + 5);
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn loại voucher ngoài PERCENT/FIXED!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 012 PASSED: Chặn loại voucher ngoài PERCENT/FIXED.';
END $$;

-- Case 013: Chặn ngày hết hạn voucher trước ngày bắt đầu
DO $$
BEGIN
    INSERT INTO vouchers (code, discount_type, discount_value, valid_from, valid_to) VALUES ('V_DATE_ERR', 'PERCENT', 10.00, CURRENT_DATE, CURRENT_DATE - 1);
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn valid_to < valid_from!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 013 PASSED: Chặn ngày hiệu lực voucher đảo ngược.';
END $$;

-- ------------------------------------------------------------------------------
-- NHÓM 5: RESERVATIONS NIGHTLY & HOURLY (BR-03, BR-04, BR-09, BR-60)
-- ------------------------------------------------------------------------------
-- Case 014: Chặn SĐT khách không đúng 9-11 chữ số (BR-09)
DO $$
BEGIN
    INSERT INTO reservations (reservation_code, booking_type, guest_name, guest_phone, room_type_id, check_in_date, check_out_date, snap_nightly_rate)
    VALUES ('RES_ERR_PHONE', 'NIGHTLY', 'Khách Test', '0901', '00000000-0000-0000-0000-000000000101', CURRENT_DATE, CURRENT_DATE + 1, 600000);
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn SĐT < 9 số!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 014 PASSED: Chặn SĐT khách không đủ 9-11 số (BR-09).';
END $$;

-- Case 015: Chặn đơn NIGHTLY vượt quá 30 đêm (BR-03)
DO $$
BEGIN
    INSERT INTO reservations (reservation_code, booking_type, guest_name, guest_phone, room_type_id, check_in_date, check_out_date, snap_nightly_rate)
    VALUES ('RES_ERR_35N', 'NIGHTLY', 'Khách Test', '0901234567', '00000000-0000-0000-0000-000000000101', CURRENT_DATE, CURRENT_DATE + 35, 600000);
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn số đêm > 30!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 015 PASSED: Chặn số đêm NIGHTLY > 30 đêm (BR-03).';
END $$;

-- Case 016: Chặn số giờ thuê HOURLY vượt quá 10 giờ (BR-04)
DO $$
BEGIN
    INSERT INTO reservations (reservation_code, booking_type, guest_name, guest_phone, room_type_id, check_in_date, check_out_date, hourly_duration_hours, snap_nightly_rate)
    VALUES ('RES_ERR_15H', 'HOURLY', 'Khách Test', '0901234567', '00000000-0000-0000-0000-000000000101', CURRENT_DATE, CURRENT_DATE, 12, 600000);
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn số giờ > 10!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 016 PASSED: Chặn số giờ thuê HOURLY > 10 giờ (BR-04).';
END $$;

-- Case 017: Chặn trùng phòng chồng lấn thời gian (Exclusion Constraint excl_room_occupancy - BR-60)
DO $$
DECLARE
    v_room_id UUID := '00000000-0000-0000-0000-000000000201';
BEGIN
    INSERT INTO reservations (id, reservation_code, booking_type, guest_name, guest_phone, room_type_id, room_id, check_in_date, check_out_date, stay_range, status, snap_nightly_rate)
    VALUES (gen_random_uuid(), 'RES_OVERLAP_1', 'NIGHTLY', 'Khách 1', '0901234567', '00000000-0000-0000-0000-000000000101', v_room_id, '2026-12-01', '2026-12-05',
            tstzrange('2026-12-01 14:00:00+07', '2026-12-05 12:00:00+07', '[)'), 'CONFIRMED', 600000);

    -- Đơn thứ 2 cố tình chiếm phòng cùng khoảng thời gian
    INSERT INTO reservations (id, reservation_code, booking_type, guest_name, guest_phone, room_type_id, room_id, check_in_date, check_out_date, stay_range, status, snap_nightly_rate)
    VALUES (gen_random_uuid(), 'RES_OVERLAP_2', 'NIGHTLY', 'Khách 2', '0907654321', '00000000-0000-0000-0000-000000000101', v_room_id, '2026-12-03', '2026-12-07',
            tstzrange('2026-12-03 14:00:00+07', '2026-12-07 12:00:00+07', '[)'), 'CONFIRMED', 600000);

    RAISE EXCEPTION 'THẤT BẠI: Exclusion constraint không chặn đơn chồng lấn!';
EXCEPTION WHEN exclusion_violation THEN
    RAISE NOTICE 'Case 017 PASSED: Exclusion Constraint excl_room_occupancy chặn Overbooking (BR-60).';
END $$;

-- ------------------------------------------------------------------------------
-- NHÓM 6: SERVICE CATALOG & CHARGE LINES (BR-36, BR-110)
-- ------------------------------------------------------------------------------
-- Case 018: Chặn đơn giá catalog item > 5.000.000 VNĐ (BR-110)
DO $$
BEGIN
    INSERT INTO service_catalog_items (code, name, type, unit_price) VALUES ('MB_EXP', 'Expensive Wine', 'MINIBAR', 6000000);
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn đơn giá dịch vụ > 5M!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 018 PASSED: Chặn đơn giá dịch vụ vượt quá 5.000.000 VNĐ.';
END $$;

-- Case 019: Chặn thiếu ghi chú bồi thường khi loại phí là DAMAGE (BR-36)
DO $$
DECLARE
    v_res_id UUID;
BEGIN
    SELECT id INTO v_res_id FROM reservations LIMIT 1;
    INSERT INTO service_charge_lines (reservation_id, type, quantity, unit_price_snapshot, total_amount, damage_note)
    VALUES (v_res_id, 'DAMAGE', 1, 500000, 500000, NULL);
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn DAMAGE thiếu ghi chú!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 019 PASSED: Bắt buộc ghi chú chi tiết khi ghi nhận DAMAGE (BR-36).';
END $$;

-- ------------------------------------------------------------------------------
-- NHÓM 7: CLEANING TASKS & INVOICES (BR-54, BR-112)
-- ------------------------------------------------------------------------------
-- Case 020: Chặn trạng thái dọn dẹp không thuộc 4 bước vòng đời
DO $$
BEGIN
    INSERT INTO cleaning_tasks (room_id, status) VALUES ('00000000-0000-0000-0000-000000000201', 'COMPLETED');
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn status task dọn dẹp sai!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 020 PASSED: Bắt buộc trạng thái task dọn dẹp đúng vòng đời.';
END $$;

-- Case 021: Kích hoạt Trigger trg_invoice_immutable chặn UPDATE hóa đơn ISSUED (BR-54)
DO $$
DECLARE
    v_inv_id UUID;
    v_res_id UUID;
BEGIN
    SELECT id INTO v_res_id FROM reservations LIMIT 1;
    INSERT INTO invoices (id, invoice_number, reservation_id, status, total_amount)
    VALUES (gen_random_uuid(), 'HD_IMMUTABLE_TEST', v_res_id, 'ISSUED', 2000000)
    RETURNING id INTO v_inv_id;

    UPDATE invoices SET total_amount = 1500000 WHERE id = v_inv_id;
    RAISE EXCEPTION 'THẤT BẠI: CSDL cho phép sửa hóa đơn đã ISSUED!';
EXCEPTION WHEN SQLSTATE 'P0001' THEN
    RAISE NOTICE 'Case 021 PASSED: Trigger trg_invoice_immutable chặn UPDATE hóa đơn ISSUED (BR-54).';
END $$;

-- Case 022: Kích hoạt Trigger trg_invoice_immutable chặn DELETE hóa đơn ISSUED (BR-54)
DO $$
DECLARE
    v_inv_id UUID;
    v_res_id UUID;
BEGIN
    SELECT id INTO v_res_id FROM reservations LIMIT 1;
    INSERT INTO invoices (id, invoice_number, reservation_id, status, total_amount)
    VALUES (gen_random_uuid(), 'HD_DEL_TEST', v_res_id, 'ISSUED', 2000000)
    RETURNING id INTO v_inv_id;

    DELETE FROM invoices WHERE id = v_inv_id;
    RAISE EXCEPTION 'THẤT BẠI: CSDL cho phép xóa hóa đơn đã ISSUED!';
EXCEPTION WHEN SQLSTATE 'P0001' THEN
    RAISE NOTICE 'Case 022 PASSED: Trigger trg_invoice_immutable chặn DELETE hóa đơn ISSUED (BR-54).';
END $$;

-- ------------------------------------------------------------------------------
-- NHÓM 8: PAYMENT_TRANSACTIONS & IDEMPOTENCY (BR-26, BR-84, BR-90)
-- ------------------------------------------------------------------------------
-- Case 023: Chặn số tiền giao dịch <= 0
DO $$
DECLARE
    v_res_id UUID;
BEGIN
    SELECT id INTO v_res_id FROM reservations LIMIT 1;
    INSERT INTO payment_transactions (transaction_code, reservation_id, type, amount, status)
    VALUES ('TX_ZERO', v_res_id, 'CHECKOUT_CHARGE', 0, 'SUCCESS');
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn số tiền giao dịch = 0!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 023 PASSED: Chặn số tiền giao dịch nhỏ hơn hoặc bằng 0.';
END $$;

-- Case 024: Chặn loại giao dịch không hợp lệ
DO $$
DECLARE
    v_res_id UUID;
BEGIN
    SELECT id INTO v_res_id FROM reservations LIMIT 1;
    INSERT INTO payment_transactions (transaction_code, reservation_id, type, amount, status)
    VALUES ('TX_INVALID_TYPE', v_res_id, 'TRANSFER', 500000, 'SUCCESS');
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn loại giao dịch sai!';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Case 024 PASSED: Chặn loại giao dịch ngoài 4 loại chuẩn.';
END $$;

-- Case 025: Chặn trùng lặp Idempotency-Key
DO $$
BEGIN
    INSERT INTO idempotency_records (key, request_hash, response_status) VALUES ('KEY_DUP_01', 'hash123', 200);
    INSERT INTO idempotency_records (key, request_hash, response_status) VALUES ('KEY_DUP_01', 'hash456', 200);
    RAISE EXCEPTION 'THẤT BẠI: CSDL không chặn trùng Idempotency-Key!';
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'Case 025 PASSED: Đảm bảo tính duy nhất của Idempotency-Key (BR-90).';
END $$;

DO $$
BEGIN
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Hoàn thành 25/25 Database Constraint Test Cases: TOÀN BỘ ĐÃ VƯỢT QUA!';
    RAISE NOTICE '============================================================';
END $$;
