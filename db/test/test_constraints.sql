-- =====================================================================
-- Kiểm thử ràng buộc CSDL HMS – lược đồ v2 (chạy sau V1 + V2, trên DB vừa dựng)
--
-- Mỗi case thuộc một trong ba loại:
--   expect_ok  : câu lệnh phải THÀNH CÔNG.
--   expect_fail: câu lệnh phải BỊ CHẶN bởi ĐÚNG ràng buộc ghi ở tham số 3
--                (tên ràng buộc/trigger, hoặc SQLSTATE 5 ký tự khi lỗi không
--                có tên, ví dụ 22001 = vượt độ dài VARCHAR). Bị chặn bởi ràng
--                buộc khác thì case FAIL (DB-F20).
--   expect_eq  : truy vấn phải trả đúng giá trị (kiểm dữ liệu seed).
-- Expected lấy từ Business Rules v1.2, không lấy từ thân CHECK.
--
-- Cách chạy: psql -X -v ON_ERROR_STOP=1 -f test_constraints.sql
-- Toàn bộ chạy trong một giao dịch và ROLLBACK ở cuối, không để lại dữ liệu.
-- Có case sai thì lệnh DO cuối ném lỗi => psql trả exit code khác 0.
-- Các case nối tiếp nhau về trạng thái: đừng đổi thứ tự.
-- =====================================================================
BEGIN;

CREATE TEMP TABLE _result (no SERIAL, label TEXT, expected TEXT, actual TEXT, detail TEXT);

CREATE FUNCTION pg_temp.expect_fail(label TEXT, stmt TEXT, exp TEXT) RETURNS void LANGUAGE plpgsql AS $f$
DECLARE v_con TEXT; v_state TEXT; v_msg TEXT;
BEGIN
    BEGIN
        EXECUTE stmt;
        INSERT INTO _result(label, expected, actual) VALUES (label, 'FAIL:' || exp, 'OK');
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_con = CONSTRAINT_NAME, v_state = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
        INSERT INTO _result(label, expected, actual, detail) VALUES (label, 'FAIL:' || exp,
            'FAIL:' || CASE WHEN v_con = exp OR v_state = exp THEN exp
                            ELSE coalesce(nullif(v_con, ''), v_state) END,
            v_msg);
    END;
END $f$;

CREATE FUNCTION pg_temp.expect_ok(label TEXT, stmt TEXT) RETURNS void LANGUAGE plpgsql AS $f$
BEGIN
    BEGIN
        EXECUTE stmt;
        INSERT INTO _result(label, expected, actual) VALUES (label, 'OK', 'OK');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO _result(label, expected, actual, detail) VALUES (label, 'OK', 'FAIL', SQLERRM);
    END;
END $f$;

CREATE FUNCTION pg_temp.expect_eq(label TEXT, query TEXT, exp TEXT) RETURNS void LANGUAGE plpgsql AS $f$
DECLARE v TEXT;
BEGIN
    BEGIN
        EXECUTE query INTO v;
        INSERT INTO _result(label, expected, actual) VALUES (label, 'EQ:' || exp, 'EQ:' || coalesce(v, '<null>'));
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO _result(label, expected, actual, detail) VALUES (label, 'EQ:' || exp, 'ERROR', SQLERRM);
    END;
END $f$;

-- Tra id theo khóa nghiệp vụ
CREATE FUNCTION pg_temp.uid(n TEXT) RETURNS UUID LANGUAGE sql AS
    $f$ SELECT user_id FROM users WHERE username = n $f$;
CREATE FUNCTION pg_temp.rtid(n TEXT) RETURNS UUID LANGUAGE sql AS
    $f$ SELECT room_type_id FROM room_types WHERE room_type_name = n $f$;
CREATE FUNCTION pg_temp.rid(n TEXT) RETURNS UUID LANGUAGE sql AS
    $f$ SELECT room_id FROM rooms WHERE room_number = n AND NOT deleted $f$;
CREATE FUNCTION pg_temp.res(d DATE) RETURNS UUID LANGUAGE sql AS
    $f$ SELECT reservation_id FROM reservations WHERE check_in_date = d AND status <> 'CANCELLED' $f$;
CREATE FUNCTION pg_temp.inv(d DATE) RETURNS UUID LANGUAGE sql AS
    $f$ SELECT invoice_id FROM invoices WHERE reservation_id = pg_temp.res(d) $f$;

-- Mẫu INSERT đơn NIGHTLY, gán phòng room_no (lấy loại theo phòng)
CREATE FUNCTION pg_temp.nightly(room_no TEXT, d_in DATE, d_out DATE, st TEXT DEFAULT 'CONFIRMED')
RETURNS TEXT LANGUAGE sql AS $f$
SELECT format($q$
 INSERT INTO reservations (booking_type, status, room_type_id, assigned_room_id, guest_name, guest_phone,
   check_in_date, check_out_date, adult_count,
   snap_nightly_rate, snap_deposit_rate_percent, snap_service_fee_rate_percent, snap_vat_rate_percent,
   deposit_required, deposit_paid, created_by_user_id, actual_check_in_time)
 SELECT 'NIGHTLY', %1$L, r.room_type_id, r.room_id, 'Nguyen Van A', '0901234567',
   %2$L::date, %3$L::date, 2,
   1800000, 30, 5, 10, 540000, 540000, pg_temp.uid('letan01'),
   CASE WHEN %1$L IN ('CHECKED_IN','CHECKED_OUT') THEN now() END
 FROM rooms r WHERE r.room_number = %4$L$q$, st, d_in, d_out, room_no)
$f$;

-- Mẫu INSERT đơn HOURLY; room_no NULL = chưa gán phòng (loại STANDARD)
CREATE FUNCTION pg_temp.hourly(room_no TEXT, d DATE, h TEXT, hrs INT,
                               adults INT DEFAULT 1, c611 INT DEFAULT 0,
                               d_out DATE DEFAULT NULL, vcode TEXT DEFAULT NULL)
RETURNS TEXT LANGUAGE sql AS $f$
SELECT format($q$
 INSERT INTO reservations (booking_type, room_type_id, assigned_room_id, guest_name, guest_phone,
   check_in_date, check_out_date, hourly_start_time, hourly_duration_hours, adult_count, child_6to11_count,
   snap_nightly_rate, snap_deposit_rate_percent, snap_service_fee_rate_percent, snap_vat_rate_percent,
   deposit_required, created_by_user_id, snap_voucher_code, snap_voucher_type, snap_voucher_value)
 VALUES ('HOURLY',
   coalesce((SELECT room_type_id FROM rooms WHERE room_number = %1$L AND NOT deleted), pg_temp.rtid('STANDARD')),
   (SELECT room_id FROM rooms WHERE room_number = %1$L AND NOT deleted),
   'Khach Theo Gio', '0901234567',
   %2$L::date, %3$L::date, %4$L::time, %5$L::smallint, %6$L, %7$L,
   600000, 30, 5, 10, 54000, pg_temp.uid('letan01'),
   %8$L, CASE WHEN %8$L IS NULL THEN NULL ELSE 'PERCENT' END, CASE WHEN %8$L IS NULL THEN NULL ELSE 10 END)$q$,
 room_no, d, coalesce(d_out, d), h, hrs, adults, c611, vcode)
$f$;

-- ======================= Dữ liệu seed (DB-F18) =======================
SELECT pg_temp.expect_eq('Seed: 5 tài khoản', $$SELECT count(*)::text FROM users$$, '5');
SELECT pg_temp.expect_eq('Seed: phân bổ vai trò',
  $$SELECT string_agg(role || ':' || n, ',' ORDER BY role) FROM (SELECT role, count(*) n FROM users GROUP BY role) s$$,
  'ADMIN:1,HOUSEKEEPER:2,MANAGER:1,RECEPTIONIST:1');
SELECT pg_temp.expect_eq('Seed: mật khẩu Hotel@2026 băm BCrypt (BR-76)',
  $$SELECT count(*)::text FROM users WHERE password_hash LIKE '$2a$10$%' AND password_hash = crypt('Hotel@2026', password_hash)$$, '5');
SELECT pg_temp.expect_eq('Seed: cấu hình 30/5/10 (BR-88)',
  $$SELECT deposit_rate_percent || '/' || service_fee_rate_percent || '/' || vat_rate_percent FROM system_config$$,
  '30.00/5.00/10.00');
SELECT pg_temp.expect_eq('Seed: 4 ngày lễ',
  $$SELECT string_agg(month_day, ',' ORDER BY month_day) FROM holidays$$, '01-01,04-30,05-01,09-02');
SELECT pg_temp.expect_eq('Seed: 3 loại phòng',
  $$SELECT string_agg(room_type_name || ':' || max_capacity || ':' || base_nightly_rate, ',' ORDER BY base_nightly_rate) FROM room_types$$,
  'STANDARD:2:600000,DELUXE:3:1000000,SUITE:4:1800000');
SELECT pg_temp.expect_eq('Seed: 6 phòng đúng loại',
  $$SELECT string_agg(r.room_number || ':' || t.room_type_name, ',' ORDER BY r.room_number) FROM rooms r JOIN room_types t USING (room_type_id)$$,
  '101:STANDARD,102:STANDARD,103:STANDARD,201:DELUXE,202:DELUXE,301:SUITE');
SELECT pg_temp.expect_eq('Seed: phòng AVAILABLE, chưa dùng, chưa xóa',
  $$SELECT count(*)::text FROM rooms WHERE status = 'AVAILABLE' AND NOT ever_used AND NOT deleted$$, '6');
SELECT pg_temp.expect_eq('Seed: 6 mục dịch vụ',
  $$SELECT string_agg(code || ':' || category || ':' || unit_price, ',' ORDER BY code) FROM service_catalog_items$$,
  'LD01:LAUNDRY:25000,MB01:MINIBAR:15000,MB02:MINIBAR:25000,MB03:MINIBAR:40000,MB04:MINIBAR:30000,MB05:MINIBAR:50000');
SELECT pg_temp.expect_eq('Seed: 2 voucher',
  $$SELECT string_agg(code || ':' || type || ':' || value || ':' || coalesce(max_discount::text, '-') || ':' || min_nights, ',' ORDER BY code) FROM vouchers$$,
  'OFF300K:FIXED:300000.00:-:1,SALE10:PERCENT:10.00:200000:2');

-- ======================= F01 – tài khoản, token =======================
SELECT pg_temp.expect_fail('BR-93 username trùng khác hoa thường (ADMIN01)',
  $$INSERT INTO users(username,password_hash,role) VALUES ('ADMIN01','x','ADMIN')$$, 'ux_user_username_ci');
SELECT pg_temp.expect_fail('BR-93 username 3 ký tự',
  $$INSERT INTO users(username,password_hash,role) VALUES ('abc','x','ADMIN')$$, 'ck_user_username');
SELECT pg_temp.expect_ok  ('BR-93 username 4 ký tự',
  $$INSERT INTO users(username,password_hash,role) VALUES ('abcd','x','ADMIN')$$);
SELECT pg_temp.expect_ok  ('BR-93 username 30 ký tự, có chữ hoa, dấu chấm, gạch dưới',
  $$INSERT INTO users(username,password_hash,role) VALUES ('Le.Tan_' || repeat('x',23),'x','RECEPTIONIST')$$);
SELECT pg_temp.expect_fail('BR-93 username 31 ký tự',
  $$INSERT INTO users(username,password_hash,role) VALUES (repeat('a',31),'x','ADMIN')$$, '22001');
SELECT pg_temp.expect_fail('BR-93 username có ký tự cấm (-)',
  $$INSERT INTO users(username,password_hash,role) VALUES ('le-tan','x','ADMIN')$$, 'ck_user_username');
SELECT pg_temp.expect_fail('BR-93 vai trò ngoài danh sách',
  $$INSERT INTO users(username,password_hash,role) VALUES ('guest01','x','GUEST')$$, 'ck_user_role');
SELECT pg_temp.expect_fail('BR-71 bộ đếm sai mật khẩu 6',
  $$UPDATE users SET failed_login_attempts = 6 WHERE username = 'letan01'$$, 'ck_user_failed');
SELECT pg_temp.expect_fail('BR-72 token sống 31 phút',
  $$INSERT INTO auth_tokens(token_value,user_id,role_snapshot,issued_at,expires_at)
    VALUES ('tok-31', pg_temp.uid('admin01'), 'ADMIN', '2026-11-21 08:00Z', '2026-11-21 08:31Z')$$, 'ck_token_ttl');
SELECT pg_temp.expect_fail('BR-72 token sống 29 phút',
  $$INSERT INTO auth_tokens(token_value,user_id,role_snapshot,issued_at,expires_at)
    VALUES ('tok-29', pg_temp.uid('admin01'), 'ADMIN', '2026-11-21 08:00Z', '2026-11-21 08:29Z')$$, 'ck_token_ttl');
SELECT pg_temp.expect_ok  ('BR-72 token sống đúng 30 phút',
  $$INSERT INTO auth_tokens(token_value,user_id,role_snapshot,issued_at,expires_at)
    VALUES ('tok-30', pg_temp.uid('admin01'), 'ADMIN', '2026-11-21 08:00Z', '2026-11-21 08:30Z')$$);
SELECT pg_temp.expect_fail('Token: vai trò snapshot ngoài danh sách',
  $$INSERT INTO auth_tokens(token_value,user_id,role_snapshot,issued_at,expires_at)
    VALUES ('tok-x', pg_temp.uid('admin01'), 'ROOT', '2026-11-21 08:00Z', '2026-11-21 08:30Z')$$, 'ck_token_role');

-- ======================= BR-88, BR-89 =======================
SELECT pg_temp.expect_fail('BR-88 tỷ lệ cọc 0',        $$UPDATE system_config SET deposit_rate_percent = 0$$, 'ck_config_deposit');
SELECT pg_temp.expect_ok  ('BR-88 tỷ lệ cọc 100',      $$UPDATE system_config SET deposit_rate_percent = 100$$);
SELECT pg_temp.expect_fail('BR-88 tỷ lệ cọc 100,01',   $$UPDATE system_config SET deposit_rate_percent = 100.01$$, 'ck_config_deposit');
SELECT pg_temp.expect_ok  ('BR-88 phí dịch vụ 20',     $$UPDATE system_config SET service_fee_rate_percent = 20$$);
SELECT pg_temp.expect_fail('BR-88 phí dịch vụ 20,01',  $$UPDATE system_config SET service_fee_rate_percent = 20.01$$, 'ck_config_service_fee');
SELECT pg_temp.expect_fail('BR-88 VAT 20,01',          $$UPDATE system_config SET vat_rate_percent = 20.01$$, 'ck_config_vat');
SELECT pg_temp.expect_fail('BR-88 dòng cấu hình thứ hai', $$INSERT INTO system_config(id) VALUES (2)$$, 'ck_config_singleton');
SELECT pg_temp.expect_fail('BR-89 ngày 31/04',         $$INSERT INTO holidays VALUES ('04-31','x')$$, 'ck_holiday_month_day_valid');
SELECT pg_temp.expect_fail('BR-89 ngày 29/02',         $$INSERT INTO holidays VALUES ('02-29','x')$$, 'ck_holiday_month_day_valid');
SELECT pg_temp.expect_ok  ('BR-89 ngày 28/02 hợp lệ',  $$INSERT INTO holidays VALUES ('02-28','x')$$);
SELECT pg_temp.expect_fail('BR-89 sai định dạng 1-1',  $$INSERT INTO holidays VALUES ('1-1','x')$$, 'ck_holiday_month_day_format');
SELECT pg_temp.expect_fail('BR-89 tháng 13',           $$INSERT INTO holidays VALUES ('13-01','x')$$, 'ck_holiday_month_day_format');
SELECT pg_temp.expect_fail('BR-89 ngày lễ trùng 01/01', $$INSERT INTO holidays VALUES ('01-01','x')$$, 'pk_holidays');

-- ======================= F02 – phòng =======================
SELECT pg_temp.expect_fail('BR-100 số phòng trùng khác hoa thường',
  $$INSERT INTO rooms(room_number, room_type_id) VALUES ('a101', pg_temp.rtid('STANDARD'));
    INSERT INTO rooms(room_number, room_type_id) VALUES ('A101', pg_temp.rtid('STANDARD'))$$, 'ux_room_number_ci');
SELECT pg_temp.expect_fail('BR-100 số phòng 11 ký tự',
  $$INSERT INTO rooms(room_number, room_type_id) VALUES ('12345678901', pg_temp.rtid('STANDARD'))$$, '22001');
SELECT pg_temp.expect_fail('BR-100 số phòng có ký tự cấm',
  $$INSERT INTO rooms(room_number, room_type_id) VALUES ('1-01', pg_temp.rtid('STANDARD'))$$, 'ck_room_number');
-- DB2-F02: biên trong sát mốc
SELECT pg_temp.expect_fail('BR-100 số phòng rỗng',
  $$INSERT INTO rooms(room_number, room_type_id) VALUES ('', pg_temp.rtid('STANDARD'))$$, 'ck_room_number');
SELECT pg_temp.expect_ok  ('BR-100 số phòng 1 ký tự',
  $$INSERT INTO rooms(room_number, room_type_id) VALUES ('A', pg_temp.rtid('STANDARD'))$$);
SELECT pg_temp.expect_ok  ('BR-100 số phòng 10 ký tự',
  $$INSERT INTO rooms(room_number, room_type_id) VALUES ('1234567890', pg_temp.rtid('STANDARD'))$$);
SELECT pg_temp.expect_ok  ('BR-101 maxCapacity 6',    $$UPDATE room_types SET max_capacity = 6 WHERE room_type_name = 'SUITE'$$);
SELECT pg_temp.expect_ok  ('BR-101 giá 100.000.000',  $$UPDATE room_types SET base_nightly_rate = 100000000 WHERE room_type_name = 'SUITE'$$);
SELECT pg_temp.expect_fail('BR-101 maxCapacity 7',    $$UPDATE room_types SET max_capacity = 7 WHERE room_type_name = 'SUITE'$$, 'ck_room_type_capacity');
SELECT pg_temp.expect_fail('BR-101 maxCapacity 0',    $$UPDATE room_types SET max_capacity = 0 WHERE room_type_name = 'SUITE'$$, 'ck_room_type_capacity');
SELECT pg_temp.expect_fail('BR-101 giá 100.000.001',  $$UPDATE room_types SET base_nightly_rate = 100000001 WHERE room_type_name = 'SUITE'$$, 'ck_room_type_rate');
SELECT pg_temp.expect_fail('BR-101 giá 0',            $$UPDATE room_types SET base_nightly_rate = 0 WHERE room_type_name = 'SUITE'$$, 'ck_room_type_rate');
SELECT pg_temp.expect_fail('BR-101 tên loại trùng sau trim, khác hoa thường',
  $$INSERT INTO room_types(room_type_name, max_capacity, base_nightly_rate) VALUES (' suite ', 2, 500000)$$, 'ux_room_type_name_ci');
SELECT pg_temp.expect_fail('BR-104 OUT_OF_SERVICE không lý do',
  $$UPDATE rooms SET status = 'OUT_OF_SERVICE' WHERE room_number = '103'$$, 'ck_room_oos_reason_required');
SELECT pg_temp.expect_fail('BR-104 lý do toàn khoảng trắng',
  $$UPDATE rooms SET status = 'OUT_OF_SERVICE', maintenance_reason = '   ' WHERE room_number = '103'$$, 'ck_room_oos_reason_required');
SELECT pg_temp.expect_fail('BR-104 lý do khi phòng không bảo trì',
  $$UPDATE rooms SET maintenance_reason = 'x' WHERE room_number = '102'$$, 'ck_room_reason_only_oos');
SELECT pg_temp.expect_ok  ('BR-104 OUT_OF_SERVICE có lý do 200 ký tự',
  $$UPDATE rooms SET status = 'OUT_OF_SERVICE', maintenance_reason = repeat('h', 200) WHERE room_number = '103'$$);
SELECT pg_temp.expect_fail('BR-104 lý do 201 ký tự',
  $$UPDATE rooms SET maintenance_reason = repeat('h', 201) WHERE room_number = '103'$$, '22001');
SELECT pg_temp.expect_fail('BR-102 xóa loại phòng còn phòng',
  $$DELETE FROM room_types WHERE room_type_name = 'SUITE'$$, 'fk_rooms_room_type');
SELECT pg_temp.expect_ok  ('BR-102 xóa loại phòng rỗng',
  $$INSERT INTO room_types(room_type_name, max_capacity, base_nightly_rate) VALUES ('EMPTY', 1, 1);
    DELETE FROM room_types WHERE room_type_name = 'EMPTY'$$);

-- ======================= Voucher BR-44 =======================
SELECT pg_temp.expect_fail('BR-44 FIXED giá trị 0',
  $$INSERT INTO vouchers(code,type,value,valid_from,valid_to) VALUES ('F0','FIXED',0,'2026-01-01','2026-12-31')$$, 'ck_voucher_fixed_value');
SELECT pg_temp.expect_fail('BR-44 FIXED giá trị −1',
  $$INSERT INTO vouchers(code,type,value,valid_from,valid_to) VALUES ('FM1','FIXED',-1,'2026-01-01','2026-12-31')$$, 'ck_voucher_fixed_value');
SELECT pg_temp.expect_fail('BR-44 maxDiscount −1',
  $$INSERT INTO vouchers(code,type,value,max_discount,valid_from,valid_to) VALUES ('PM1','PERCENT',10,-1,'2026-01-01','2026-12-31')$$, 'ck_voucher_max_discount');
SELECT pg_temp.expect_fail('BR-44 FIXED giá trị lẻ 100,5',
  $$INSERT INTO vouchers(code,type,value,valid_from,valid_to) VALUES ('F1','FIXED',100.5,'2026-01-01','2026-12-31')$$, 'ck_voucher_fixed_value');
SELECT pg_temp.expect_fail('BR-44 FIXED có maxDiscount',
  $$INSERT INTO vouchers(code,type,value,max_discount,valid_from,valid_to) VALUES ('F2','FIXED',1000,500,'2026-01-01','2026-12-31')$$, 'ck_voucher_fixed_no_max');
SELECT pg_temp.expect_fail('BR-44 PERCENT 0',
  $$INSERT INTO vouchers(code,type,value,valid_from,valid_to) VALUES ('P0','PERCENT',0,'2026-01-01','2026-12-31')$$, 'ck_voucher_percent_value');
SELECT pg_temp.expect_ok  ('BR-44 PERCENT 100',
  $$INSERT INTO vouchers(code,type,value,valid_from,valid_to) VALUES ('P100','PERCENT',100,'2026-01-01','2026-12-31')$$);
SELECT pg_temp.expect_fail('BR-44 PERCENT 100,01',
  $$INSERT INTO vouchers(code,type,value,valid_from,valid_to) VALUES ('P1','PERCENT',100.01,'2026-01-01','2026-12-31')$$, 'ck_voucher_percent_value');
SELECT pg_temp.expect_fail('BR-44 maxDiscount 0',
  $$INSERT INTO vouchers(code,type,value,max_discount,valid_from,valid_to) VALUES ('P2','PERCENT',10,0,'2026-01-01','2026-12-31')$$, 'ck_voucher_max_discount');
SELECT pg_temp.expect_fail('BR-44 minNights 0',
  $$INSERT INTO vouchers(code,type,value,min_nights,valid_from,valid_to) VALUES ('P4','PERCENT',10,0,'2026-01-01','2026-12-31')$$, 'ck_voucher_min_nights');
SELECT pg_temp.expect_fail('BR-44 validFrom sau validTo',
  $$INSERT INTO vouchers(code,type,value,valid_from,valid_to) VALUES ('P3','PERCENT',10,'2026-12-31','2026-01-01')$$, 'ck_voucher_period');
SELECT pg_temp.expect_fail('BR-44 mã rỗng sau trim',
  $$INSERT INTO vouchers(code,type,value,valid_from,valid_to) VALUES ('   ','PERCENT',10,'2026-01-01','2026-12-31')$$, 'ck_voucher_code_nonempty');
SELECT pg_temp.expect_fail('BR-44 mã trùng khác hoa thường (sale10)',
  $$INSERT INTO vouchers(code,type,value,valid_from,valid_to) VALUES ('sale10','PERCENT',10,'2026-01-01','2026-12-31')$$, 'ux_voucher_code_ci');

-- ======================= F03 – đơn đặt NIGHTLY, chặn trùng =======================
SELECT pg_temp.expect_ok  ('BR-03 NIGHTLY 1 đêm',  pg_temp.nightly('101','2026-12-01','2026-12-02'));
SELECT pg_temp.expect_fail('BR-03 NIGHTLY 0 đêm',  pg_temp.nightly('102','2026-12-01','2026-12-01'), 'ck_res_nightly_nights');
SELECT pg_temp.expect_ok  ('BR-03 NIGHTLY 30 đêm', pg_temp.nightly('102','2027-01-01','2027-01-31'));
SELECT pg_temp.expect_fail('BR-03 NIGHTLY 31 đêm', pg_temp.nightly('201','2027-01-01','2027-02-01'), 'ck_res_nightly_nights');
SELECT pg_temp.expect_fail('BR-05 NIGHTLY có trường HOURLY',
  $$UPDATE reservations SET hourly_start_time = '10:00' WHERE check_in_date = '2026-12-01'$$, 'ck_res_nightly_no_hourly');

SELECT pg_temp.expect_ok  ('BR-64 phòng 301 đêm 10–12/12', pg_temp.nightly('301','2026-12-10','2026-12-12'));
SELECT pg_temp.expect_fail('BR-64/BR-60 phòng 301 chồng đêm 11/12',
  pg_temp.nightly('301','2026-12-11','2026-12-13'), 'ex_res_room_no_overlap');
SELECT pg_temp.expect_ok  ('BR-60 trả 12:00 và nhận 14:00 cùng ngày 12/12 không xung đột',
  pg_temp.nightly('301','2026-12-12','2026-12-14'));
SELECT pg_temp.expect_ok  ('BR-63/BR-08 hủy đơn kèm bỏ gán phòng',
  $$UPDATE reservations SET status = 'CANCELLED', cancelled_at = now(), assigned_room_id = NULL
    WHERE assigned_room_id = pg_temp.rid('301') AND check_in_date = '2026-12-10'$$);
SELECT pg_temp.expect_ok  ('BR-63 đặt lại khoảng của đơn đã hủy',
  pg_temp.nightly('301','2026-12-10','2026-12-12'));
SELECT pg_temp.expect_fail('BR-08 đơn CANCELLED còn giữ phòng',
  $$UPDATE reservations SET status = 'CANCELLED', cancelled_at = now() WHERE check_in_date = '2026-12-12'$$,
  'ck_res_released_room');
SELECT pg_temp.expect_fail('BR-24 đơn NO_SHOW còn giữ phòng',
  $$UPDATE reservations SET status = 'NO_SHOW', no_show_at = now() WHERE check_in_date = '2026-12-12'$$,
  'ck_res_released_room');

SELECT pg_temp.expect_fail('BR-82 hai đơn CHECKED_IN cùng phòng',
  pg_temp.nightly('202','2026-11-01','2026-11-03','CHECKED_IN') || ';' ||
  pg_temp.nightly('202','2026-11-05','2026-11-06','CHECKED_IN'), 'ux_res_one_checked_in_per_room');
SELECT pg_temp.expect_fail('BR-66 CHECKED_IN nhưng chưa gán phòng',
  $$INSERT INTO reservations (booking_type, status, room_type_id, guest_name, guest_phone, check_in_date, check_out_date,
    adult_count, snap_nightly_rate, snap_deposit_rate_percent, snap_service_fee_rate_percent, snap_vat_rate_percent,
    deposit_required, created_by_user_id, actual_check_in_time)
    VALUES ('NIGHTLY','CHECKED_IN', pg_temp.rtid('STANDARD'), 'B', '0901234567', '2026-11-01', '2026-11-02',
    1, 600000, 30, 5, 10, 180000, pg_temp.uid('letan01'), now())$$, 'ck_res_checkin_room');
SELECT pg_temp.expect_fail('BR-66 CHECKED_IN thiếu actual_check_in_time',
  $$UPDATE reservations SET status = 'CHECKED_IN' WHERE check_in_date = '2026-12-01'$$, 'ck_res_checkin_time');
SELECT pg_temp.expect_fail('BR-66 CANCELLED thiếu cancelled_at',
  $$UPDATE reservations SET status = 'CANCELLED', assigned_room_id = NULL WHERE check_in_date = '2026-12-01'$$, 'ck_res_cancelled_at');
-- DB-F17
SELECT pg_temp.expect_fail('BR-66 NO_SHOW thiếu no_show_at',
  $$UPDATE reservations SET status = 'NO_SHOW', assigned_room_id = NULL WHERE check_in_date = '2026-12-12'$$, 'ck_res_no_show_at');
SELECT pg_temp.expect_fail('BR-66 CHECKED_OUT thiếu actual_check_out_time',
  $$UPDATE reservations SET status = 'CHECKED_OUT', actual_check_in_time = now() WHERE check_in_date = '2026-12-01'$$, 'ck_res_checked_out_at');

-- ======================= BR-09 thông tin khách, BR-31/32 số khách =======================
SELECT pg_temp.expect_fail('BR-09 tên rỗng',         $$UPDATE reservations SET guest_name = '' WHERE check_in_date = '2026-12-01'$$, 'ck_res_guest_name_length');
SELECT pg_temp.expect_fail('BR-09 tên toàn khoảng trắng', $$UPDATE reservations SET guest_name = '   ' WHERE check_in_date = '2026-12-01'$$, 'ck_res_guest_name_trimmed');
SELECT pg_temp.expect_fail('BR-09 tên có khoảng trắng đầu', $$UPDATE reservations SET guest_name = ' An' WHERE check_in_date = '2026-12-01'$$, 'ck_res_guest_name_trimmed');
SELECT pg_temp.expect_ok  ('BR-09 tên 1 ký tự',       $$UPDATE reservations SET guest_name = 'A' WHERE check_in_date = '2026-12-01'$$);
SELECT pg_temp.expect_ok  ('BR-09 tên 100 ký tự',     $$UPDATE reservations SET guest_name = repeat('B',100) WHERE check_in_date = '2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-09 tên 101 ký tự',     $$UPDATE reservations SET guest_name = repeat('B',101) WHERE check_in_date = '2026-12-01'$$, '22001');
SELECT pg_temp.expect_fail('BR-09 điện thoại 8 số',   $$UPDATE reservations SET guest_phone = '09012345' WHERE check_in_date = '2026-12-01'$$, 'ck_res_guest_phone');
SELECT pg_temp.expect_ok  ('BR-09 điện thoại 9 số',   $$UPDATE reservations SET guest_phone = '090123456' WHERE check_in_date = '2026-12-01'$$);
SELECT pg_temp.expect_ok  ('BR-09 điện thoại 11 số',  $$UPDATE reservations SET guest_phone = '09012345678' WHERE check_in_date = '2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-09 điện thoại 12 số',  $$UPDATE reservations SET guest_phone = '090123456789' WHERE check_in_date = '2026-12-01'$$, '22001');
SELECT pg_temp.expect_fail('BR-09 điện thoại có khoảng trắng', $$UPDATE reservations SET guest_phone = '0901 23456' WHERE check_in_date = '2026-12-01'$$, 'ck_res_guest_phone');
SELECT pg_temp.expect_fail('BR-09 điện thoại có chữ', $$UPDATE reservations SET guest_phone = '09012345a' WHERE check_in_date = '2026-12-01'$$, 'ck_res_guest_phone');
SELECT pg_temp.expect_fail('BR-09 email thiếu @',     $$UPDATE reservations SET guest_email = 'a.example.com' WHERE check_in_date = '2026-12-01'$$, 'ck_res_guest_email');
SELECT pg_temp.expect_ok  ('BR-09 email không có dấu chấm tên miền (khach@gmail)',
  $$UPDATE reservations SET guest_email = 'khach@gmail' WHERE check_in_date = '2026-12-01'$$);
SELECT pg_temp.expect_ok  ('BR-09 email 100 ký tự',
  $$UPDATE reservations SET guest_email = repeat('a',94) || '@x.com' WHERE check_in_date = '2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-09 email 101 ký tự',
  $$UPDATE reservations SET guest_email = repeat('a',95) || '@x.com' WHERE check_in_date = '2026-12-01'$$, '22001');
SELECT pg_temp.expect_ok  ('BR-09 email để trống',   $$UPDATE reservations SET guest_email = NULL WHERE check_in_date = '2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-32 0 người lớn',      $$UPDATE reservations SET adult_count = 0 WHERE check_in_date = '2026-12-01'$$, 'ck_res_adults');
SELECT pg_temp.expect_fail('BR-31 số trẻ 6–11 âm',   $$UPDATE reservations SET child_6to11_count = -1 WHERE check_in_date = '2026-12-01'$$, 'ck_res_child_6to11');
SELECT pg_temp.expect_ok  ('BR-32 2 trẻ dưới 6',     $$UPDATE reservations SET child_under6_count = 2 WHERE check_in_date = '2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-32 3 trẻ dưới 6',     $$UPDATE reservations SET child_under6_count = 3 WHERE check_in_date = '2026-12-01'$$, 'ck_res_child_under6');

-- ======================= HOURLY (BR-04, BR-40, BR-32) – DB-F15 =======================
SELECT pg_temp.expect_ok  ('BR-04 HOURLY 06:00 + 1 giờ',               pg_temp.hourly(NULL,'2027-04-01','06:00',1));
SELECT pg_temp.expect_ok  ('BR-04 HOURLY 21:00 + 3 giờ (kết thúc 24:00)', pg_temp.hourly(NULL,'2027-04-02','21:00',3));
SELECT pg_temp.expect_ok  ('BR-04 HOURLY 22:00 + 2 giờ',               pg_temp.hourly(NULL,'2027-04-03','22:00',2));
SELECT pg_temp.expect_ok  ('BR-04 HOURLY 10 giờ',                      pg_temp.hourly(NULL,'2027-04-04','06:00',10));
SELECT pg_temp.expect_fail('BR-04 HOURLY bắt đầu 05:59',  pg_temp.hourly(NULL,'2026-12-20','05:59',1),  'ck_res_hourly_start');
SELECT pg_temp.expect_fail('BR-04 HOURLY bắt đầu 22:01',  pg_temp.hourly(NULL,'2026-12-20','22:01',1),  'ck_res_hourly_start');
SELECT pg_temp.expect_fail('BR-04 HOURLY 0 giờ',          pg_temp.hourly(NULL,'2026-12-20','10:00',0),  'ck_res_hourly_hours');
SELECT pg_temp.expect_fail('BR-04 HOURLY 11 giờ',         pg_temp.hourly(NULL,'2026-12-20','10:00',11), 'ck_res_hourly_hours');
SELECT pg_temp.expect_fail('BR-04 HOURLY 22:00 + 3 giờ (qua nửa đêm)', pg_temp.hourly(NULL,'2026-12-20','22:00',3), 'ck_res_hourly_end');
SELECT pg_temp.expect_fail('BR-04 HOURLY 21:00 + 4 giờ (qua nửa đêm)', pg_temp.hourly(NULL,'2026-12-20','21:00',4), 'ck_res_hourly_end');
SELECT pg_temp.expect_fail('BR-04 HOURLY ngày trả khác ngày nhận',
  pg_temp.hourly(NULL,'2026-12-20','10:00',3, d_out => '2026-12-21'), 'ck_res_hourly_same_day');
SELECT pg_temp.expect_fail('BR-05 HOURLY thiếu số giờ',   pg_temp.hourly(NULL,'2026-12-20','10:00',NULL), 'ck_res_hourly_fields');
SELECT pg_temp.expect_fail('BR-40 HOURLY kèm voucher',    pg_temp.hourly(NULL,'2026-12-20','10:00',3, vcode => 'SALE10'), 'ck_res_hourly_no_voucher');
SELECT pg_temp.expect_ok  ('BR-32 HOURLY 1 người lớn + 1 trẻ 6–11', pg_temp.hourly(NULL,'2027-04-05','10:00',3, adults => 1, c611 => 1));
SELECT pg_temp.expect_fail('BR-32 HOURLY 3 người',        pg_temp.hourly(NULL,'2026-12-20','10:00',3, adults => 2, c611 => 1), 'ck_res_hourly_guests');

-- ======================= Snapshot voucher, cọc (BR-55, BR-24) =======================
SELECT pg_temp.expect_fail('BR-55 snapshot voucher thiếu loại',
  $$UPDATE reservations SET snap_voucher_code = 'SALE10' WHERE check_in_date = '2026-12-01'$$, 'ck_res_voucher_snap_complete');
SELECT pg_temp.expect_fail('BR-44 snapshot FIXED có maxDiscount',
  $$UPDATE reservations SET snap_voucher_code = 'OFF300K', snap_voucher_type = 'FIXED', snap_voucher_value = 300000,
    snap_voucher_max_discount = 1 WHERE check_in_date = '2026-12-01'$$, 'ck_res_voucher_snap_fixed');
SELECT pg_temp.expect_fail('BR-44 snapshot PERCENT 100,01',
  $$UPDATE reservations SET snap_voucher_code = 'SALE10', snap_voucher_type = 'PERCENT', snap_voucher_value = 100.01
    WHERE check_in_date = '2026-12-01'$$, 'ck_res_voucher_snap_percent');
SELECT pg_temp.expect_fail('BR-20 cọc yêu cầu âm',
  $$UPDATE reservations SET deposit_required = -1 WHERE check_in_date = '2026-12-01'$$, 'ck_res_deposit_required');
SELECT pg_temp.expect_fail('BR-55 snapshot giá đêm 0',
  $$UPDATE reservations SET snap_nightly_rate = 0 WHERE check_in_date = '2026-12-01'$$, 'ck_res_snap_rate');
SELECT pg_temp.expect_fail('BR-66 trạng thái đơn ngoài danh sách',
  $$UPDATE reservations SET status = 'PENDING' WHERE check_in_date = '2026-12-01'$$, 'ck_res_status');
SELECT pg_temp.expect_ok  ('BR-55 snapshot voucher PERCENT đầy đủ',
  $$UPDATE reservations SET snap_voucher_code = 'SALE10', snap_voucher_type = 'PERCENT', snap_voucher_value = 10,
    snap_voucher_max_discount = 200000 WHERE check_in_date = '2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-24 cọc mất khi đơn còn CONFIRMED',
  $$UPDATE reservations SET deposit_forfeited = TRUE WHERE check_in_date = '2026-12-01'$$, 'ck_res_forfeited_status');
SELECT pg_temp.expect_fail('BR-26 cọc đã thu âm',
  $$UPDATE reservations SET deposit_paid = -1 WHERE check_in_date = '2026-12-01'$$, 'ck_res_deposit_paid');
SELECT pg_temp.expect_ok  ('BR-20 cọc yêu cầu bằng 0 (làm tròn)',
  $$UPDATE reservations SET deposit_required = 0 WHERE check_in_date = '2027-04-01'$$);
SELECT pg_temp.expect_fail('BR-88 snapshot VAT 20,01',
  $$UPDATE reservations SET snap_vat_rate_percent = 20.01 WHERE check_in_date = '2026-12-01'$$, 'ck_res_snap_vat_rate');
SELECT pg_temp.expect_fail('BR-33 đêm lễ snapshot 29/02',
  $$INSERT INTO reservation_holiday_nights VALUES (pg_temp.res('2026-12-01'), '02-29')$$, 'ck_rhn_month_day_valid');
SELECT pg_temp.expect_ok  ('BR-55 đêm lễ snapshot 01/01',
  $$INSERT INTO reservation_holiday_nights VALUES (pg_temp.res('2027-01-01'), '01-01')$$);

-- ======================= F06 dịch vụ (BR-34 đến BR-36, BR-110) =======================
SELECT pg_temp.expect_fail('BR-34 minibar số lượng 0',
  $$INSERT INTO service_charge_lines(reservation_id, created_by_user_id, service_type, item_code, quantity, unit_price_snapshot)
    VALUES (pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'MINIBAR', 'MB01', 0, 15000)$$, 'ck_scl_item_quantity');
SELECT pg_temp.expect_ok  ('BR-34 minibar số lượng 99',
  $$INSERT INTO service_charge_lines(reservation_id, created_by_user_id, service_type, item_code, quantity, unit_price_snapshot)
    VALUES (pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'MINIBAR', 'MB01', 99, 15000)$$);
SELECT pg_temp.expect_fail('BR-34 minibar số lượng 100',
  $$INSERT INTO service_charge_lines(reservation_id, created_by_user_id, service_type, item_code, quantity, unit_price_snapshot)
    VALUES (pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'MINIBAR', 'MB01', 100, 15000)$$, 'ck_scl_item_quantity');
SELECT pg_temp.expect_fail('BR-34 minibar thiếu mã mục',
  $$INSERT INTO service_charge_lines(reservation_id, created_by_user_id, service_type, quantity, unit_price_snapshot)
    VALUES (pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'MINIBAR', 1, 15000)$$, 'ck_scl_item_required');
SELECT pg_temp.expect_ok  ('BR-35 giặt ủi 1 món',
  $$INSERT INTO service_charge_lines(reservation_id, created_by_user_id, service_type, item_code, quantity, unit_price_snapshot)
    VALUES (pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'LAUNDRY', 'LD01', 1, 25000)$$);
SELECT pg_temp.expect_ok  ('BR-36 hư hao 50.000.000',
  $$INSERT INTO service_charge_lines(reservation_id, created_by_user_id, service_type, quantity, unit_price_snapshot, damage_note)
    VALUES (pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'DAMAGE', 1, 50000000, 'Vỡ TV')$$);
SELECT pg_temp.expect_ok  ('BR-36 hư hao 1 đ, ghi chú 200 ký tự',
  $$INSERT INTO service_charge_lines(reservation_id, created_by_user_id, service_type, quantity, unit_price_snapshot, damage_note)
    VALUES (pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'DAMAGE', 1, 1, repeat('n', 200))$$);
SELECT pg_temp.expect_fail('BR-36 hư hao 0 đ',
  $$INSERT INTO service_charge_lines(reservation_id, created_by_user_id, service_type, quantity, unit_price_snapshot, damage_note)
    VALUES (pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'DAMAGE', 1, 0, 'Vỡ ly')$$, 'ck_scl_damage_price');
SELECT pg_temp.expect_fail('BR-36 ghi chú hư hao 201 ký tự',
  $$INSERT INTO service_charge_lines(reservation_id, created_by_user_id, service_type, quantity, unit_price_snapshot, damage_note)
    VALUES (pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'DAMAGE', 1, 100000, repeat('n', 201))$$, '22001');
SELECT pg_temp.expect_fail('BR-36 hư hao 50.000.001',
  $$INSERT INTO service_charge_lines(reservation_id, created_by_user_id, service_type, quantity, unit_price_snapshot, damage_note)
    VALUES (pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'DAMAGE', 1, 50000001, 'Vỡ ly')$$, 'ck_scl_damage_price');
SELECT pg_temp.expect_fail('BR-36 hư hao ghi chú toàn khoảng trắng',
  $$INSERT INTO service_charge_lines(reservation_id, created_by_user_id, service_type, quantity, unit_price_snapshot, damage_note)
    VALUES (pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'DAMAGE', 1, 100000, '   ')$$, 'ck_scl_damage_note');
SELECT pg_temp.expect_fail('BR-36 hư hao số lượng 2',
  $$INSERT INTO service_charge_lines(reservation_id, created_by_user_id, service_type, quantity, unit_price_snapshot, damage_note)
    VALUES (pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'DAMAGE', 2, 100000, 'Vỡ ly')$$, 'ck_scl_damage_quantity');
SELECT pg_temp.expect_fail('BR-36 hư hao có mã mục danh mục',
  $$INSERT INTO service_charge_lines(reservation_id, created_by_user_id, service_type, item_code, quantity, unit_price_snapshot, damage_note)
    VALUES (pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'DAMAGE', 'MB01', 1, 100000, 'Vỡ ly')$$, 'ck_scl_damage_no_item');
SELECT pg_temp.expect_ok  ('BR-110 danh mục đơn giá 1',
  $$INSERT INTO service_catalog_items(code, name, category, unit_price) VALUES ('MB90','X','MINIBAR',1)$$);
SELECT pg_temp.expect_ok  ('BR-110 danh mục đơn giá 5.000.000',
  $$INSERT INTO service_catalog_items(code, name, category, unit_price) VALUES ('MB91','X','MINIBAR',5000000)$$);
SELECT pg_temp.expect_fail('BR-110 danh mục đơn giá 0',
  $$INSERT INTO service_catalog_items(code, name, category, unit_price) VALUES ('MB92','X','MINIBAR',0)$$, 'ck_catalog_price');
SELECT pg_temp.expect_fail('BR-110 danh mục đơn giá 5.000.001',
  $$INSERT INTO service_catalog_items(code, name, category, unit_price) VALUES ('MB99','X','MINIBAR',5000001)$$, 'ck_catalog_price');
SELECT pg_temp.expect_fail('BR-110 mã danh mục 1 ký tự',
  $$INSERT INTO service_catalog_items(code, name, category, unit_price) VALUES ('M','X','MINIBAR',1000)$$, 'ck_catalog_code');
SELECT pg_temp.expect_fail('BR-110 mã danh mục trùng khác hoa thường',
  $$INSERT INTO service_catalog_items(code, name, category, unit_price) VALUES ('mb01','X','MINIBAR',1000)$$, 'ux_catalog_code_ci');

-- ======================= F05 hóa đơn – ví dụ A, C, D của BR v1.2 =======================
SELECT pg_temp.expect_ok('BR-50 ví dụ A (amountDue 3.247.000)',
  $$INSERT INTO invoices(reservation_id, issued_by_user_id, room_charge, late_check_out_surcharge, extra_child_surcharge,
     discount, service_fee_base, service_fee, extra_services_total, taxable_amount, vat_amount, total_amount, deposit_paid, amount_due)
    VALUES (pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 3000000, 300000, 300000,
     200000, 3400000, 170000, 200000, 3770000, 377000, 4147000, 900000, 3247000)$$);
SELECT pg_temp.expect_fail('BR-54 sửa hóa đơn ISSUED',  $$UPDATE invoices SET total_amount = total_amount + 1$$, 'trg_invoice_immutable');
SELECT pg_temp.expect_fail('BR-54 xóa hóa đơn ISSUED',  $$DELETE FROM invoices$$, 'trg_invoice_immutable');
SELECT pg_temp.expect_fail('BR-54 hóa đơn thứ hai cho cùng đơn',
  $$INSERT INTO invoices(reservation_id, issued_by_user_id, room_charge, service_fee_base, service_fee, taxable_amount,
     vat_amount, total_amount, deposit_paid, amount_due)
    VALUES (pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 1, 1, 0, 1, 0, 1, 0, 1)$$, 'uq_inv_reservation');
SELECT pg_temp.expect_fail('BR-53 ví dụ D làm tròn ở cuối (total 1.425.928 sai)',
  $$INSERT INTO invoices(reservation_id, issued_by_user_id, room_charge, service_fee_base, service_fee, taxable_amount,
     vat_amount, total_amount, deposit_paid, amount_due)
    VALUES (pg_temp.res('2027-01-01'), pg_temp.uid('letan01'), 1234570, 1234570, 61729, 1296299, 129630, 1425928, 370371, 1055557)$$,
  'ck_inv_step10');
SELECT pg_temp.expect_ok('BR-53 ví dụ D làm tròn từng dòng (total 1.425.929)',
  $$INSERT INTO invoices(reservation_id, issued_by_user_id, room_charge, service_fee_base, service_fee, taxable_amount,
     vat_amount, total_amount, deposit_paid, amount_due)
    VALUES (pg_temp.res('2027-01-01'), pg_temp.uid('letan01'), 1234570, 1234570, 61729, 1296299, 129630, 1425929, 370371, 1055558)$$);
SELECT pg_temp.expect_fail('BR-43 discount lớn hơn roomCharge',
  $$INSERT INTO invoices(reservation_id, issued_by_user_id, room_charge, discount, service_fee_base, service_fee, taxable_amount,
     vat_amount, total_amount, deposit_paid, amount_due)
    VALUES (pg_temp.res('2026-12-12'), pg_temp.uid('letan01'), 770000, 800000, -30000, 0, -30000, 0, -30000, 0, -30000)$$,
  'ck_inv_discount');
SELECT pg_temp.expect_fail('BR-50 bước 5 sai (thiếu phụ thu)',
  $$INSERT INTO invoices(reservation_id, issued_by_user_id, room_charge, late_check_out_surcharge, service_fee_base, service_fee,
     taxable_amount, vat_amount, total_amount, deposit_paid, amount_due)
    VALUES (pg_temp.res('2026-12-12'), pg_temp.uid('letan01'), 1000000, 100000, 1000000, 50000, 1050000, 105000, 1155000, 0, 1155000)$$,
  'ck_inv_step5');
SELECT pg_temp.expect_fail('BR-50 bước 11 sai (amountDue)',
  $$INSERT INTO invoices(reservation_id, issued_by_user_id, room_charge, service_fee_base, service_fee,
     taxable_amount, vat_amount, total_amount, deposit_paid, amount_due)
    VALUES (pg_temp.res('2026-12-12'), pg_temp.uid('letan01'), 1000000, 1000000, 50000, 1050000, 105000, 1155000, 300000, 1155000)$$,
  'ck_inv_step11');
SELECT pg_temp.expect_fail('BR-50 bước 8 sai (thiếu tiền dịch vụ)',
  $$INSERT INTO invoices(reservation_id, issued_by_user_id, room_charge, service_fee_base, service_fee, extra_services_total,
     taxable_amount, vat_amount, total_amount, deposit_paid, amount_due)
    VALUES (pg_temp.res('2026-12-12'), pg_temp.uid('letan01'), 1000000, 1000000, 50000, 200000, 1050000, 105000, 1155000, 0, 1155000)$$,
  'ck_inv_step8');
SELECT pg_temp.expect_ok('BR-84 ví dụ C (amountDue −300.000, hoàn)',
  $$INSERT INTO invoices(reservation_id, issued_by_user_id, room_charge, discount, service_fee_base, service_fee, taxable_amount,
     vat_amount, total_amount, deposit_paid, amount_due)
    VALUES (pg_temp.res('2026-12-12'), pg_temp.uid('letan01'), 1000000, 1000000, 0, 0, 0, 0, 0, 300000, -300000)$$);

-- ======================= Giao dịch thanh toán (BR-26, BR-86, BR-90, BR-91) =======================
SELECT pg_temp.expect_ok  ('BR-86 thu check-out lần 1',
  $$INSERT INTO payment_transactions(transaction_id, reservation_id, created_by_user_id, type, amount, status, idempotency_key)
    VALUES ('gw-k1', pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'CHECKOUT_CHARGE', 3247000, 'SUCCEEDED', 'k1')$$);
SELECT pg_temp.expect_fail('BR-86 thu check-out SUCCEEDED lần 2 (khác key)',
  $$INSERT INTO payment_transactions(transaction_id, reservation_id, created_by_user_id, type, amount, status, idempotency_key)
    VALUES ('gw-k2', pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'CHECKOUT_CHARGE', 3247000, 'SUCCEEDED', 'k2')$$,
  'ux_txn_one_checkout_charge');
SELECT pg_temp.expect_ok  ('BR-84 lần thu FAILED vẫn được ghi',
  $$INSERT INTO payment_transactions(transaction_id, reservation_id, created_by_user_id, type, amount, status, idempotency_key)
    VALUES ('gw-k3', pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'CHECKOUT_CHARGE', 3247000, 'FAILED', 'k3')$$);
SELECT pg_temp.expect_fail('BR-90 trùng transaction_id',
  $$INSERT INTO payment_transactions(transaction_id, reservation_id, created_by_user_id, type, amount, status, idempotency_key)
    VALUES ('gw-k1', pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'DEPOSIT_CHARGE', 1, 'SUCCEEDED', 'k4')$$,
  'pk_payment_transactions');
SELECT pg_temp.expect_fail('BR-90 trùng Idempotency-Key',
  $$INSERT INTO payment_transactions(transaction_id, reservation_id, created_by_user_id, type, amount, status, idempotency_key)
    VALUES ('gw-k5', pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'DEPOSIT_CHARGE', 1, 'SUCCEEDED', 'k1')$$,
  'uq_txn_idempotency_key');
SELECT pg_temp.expect_fail('Số tiền giao dịch bằng 0',
  $$INSERT INTO payment_transactions(transaction_id, reservation_id, created_by_user_id, type, amount, status, idempotency_key)
    VALUES ('gw-k9', pg_temp.res('2026-12-01'), pg_temp.uid('letan01'), 'DEPOSIT_CHARGE', 0, 'SUCCEEDED', 'k9')$$, 'ck_txn_amount');
-- DB-F05, DB-F04
SELECT pg_temp.expect_ok  ('BR-26/BR-91 thu cọc ghi trước khi có đơn',
  $$INSERT INTO payment_transactions(transaction_id, reservation_id, created_by_user_id, type, amount, status, idempotency_key)
    VALUES ('gw-d1', NULL, pg_temp.uid('letan01'), 'DEPOSIT_CHARGE', 540000, 'SUCCEEDED', 'd1')$$);
SELECT pg_temp.expect_fail('BR-26 hoàn cọc không gắn đơn',
  $$INSERT INTO payment_transactions(transaction_id, reservation_id, created_by_user_id, type, amount, status, idempotency_key)
    VALUES ('gw-d2', NULL, pg_temp.uid('letan01'), 'DEPOSIT_REFUND', 540000, 'SUCCEEDED', 'd2')$$, 'ck_txn_reservation_required');
SELECT pg_temp.expect_fail('BR-91 giao dịch cọc gắn hóa đơn',
  $$INSERT INTO payment_transactions(transaction_id, reservation_id, invoice_id, created_by_user_id, type, amount, status, idempotency_key)
    VALUES ('gw-d3', pg_temp.res('2026-12-01'), pg_temp.inv('2026-12-01'), pg_temp.uid('letan01'), 'DEPOSIT_CHARGE', 1, 'SUCCEEDED', 'd3')$$,
  'ck_txn_invoice_checkout_only');
SELECT pg_temp.expect_ok  ('BR-91 thu check-out SUCCEEDED ghi ở bước 3, chưa có hóa đơn',
  $$INSERT INTO payment_transactions(transaction_id, reservation_id, created_by_user_id, type, amount, status, idempotency_key)
    VALUES ('gw-c1', pg_temp.res('2027-01-01'), pg_temp.uid('letan01'), 'CHECKOUT_CHARGE', 1055558, 'SUCCEEDED', 'c1')$$);
SELECT pg_temp.expect_ok  ('BR-91 gán hóa đơn cho giao dịch ở bước 4',
  $$UPDATE payment_transactions SET invoice_id = pg_temp.inv('2027-01-01') WHERE transaction_id = 'gw-c1'$$);
-- DB-F16
SELECT pg_temp.expect_ok  ('BR-84 hoàn check-out lần 1 (ví dụ C)',
  $$INSERT INTO payment_transactions(transaction_id, reservation_id, invoice_id, created_by_user_id, type, amount, status, idempotency_key)
    VALUES ('gw-r1', pg_temp.res('2026-12-12'), pg_temp.inv('2026-12-12'), pg_temp.uid('letan01'), 'CHECKOUT_REFUND', 300000, 'SUCCEEDED', 'r1')$$);
SELECT pg_temp.expect_fail('BR-86 hoàn check-out SUCCEEDED lần 2',
  $$INSERT INTO payment_transactions(transaction_id, reservation_id, created_by_user_id, type, amount, status, idempotency_key)
    VALUES ('gw-r2', pg_temp.res('2026-12-12'), pg_temp.uid('letan01'), 'CHECKOUT_REFUND', 300000, 'SUCCEEDED', 'r2')$$,
  'ux_txn_one_checkout_refund');
SELECT pg_temp.expect_ok  ('BR-84 hoàn check-out FAILED vẫn được ghi',
  $$INSERT INTO payment_transactions(transaction_id, reservation_id, created_by_user_id, type, amount, status, idempotency_key)
    VALUES ('gw-r3', pg_temp.res('2026-12-12'), pg_temp.uid('letan01'), 'CHECKOUT_REFUND', 300000, 'FAILED', 'r3')$$);

-- ======================= Nhiệm vụ dọn phòng (BR-111 đến BR-114) =======================
SELECT pg_temp.expect_ok  ('BR-111 tạo nhiệm vụ PENDING cho phòng 101',
  $$INSERT INTO cleaning_tasks(room_id, reservation_id) VALUES (pg_temp.rid('101'), pg_temp.res('2026-12-01'))$$);
SELECT pg_temp.expect_fail('BR-111 retry cùng đơn tạo nhiệm vụ thứ hai',
  $$INSERT INTO cleaning_tasks(room_id, reservation_id) VALUES (pg_temp.rid('102'), pg_temp.res('2026-12-01'))$$,
  'uq_task_reservation');
SELECT pg_temp.expect_fail('BR-111 hai nhiệm vụ mở cho một phòng',
  $$INSERT INTO cleaning_tasks(room_id, reservation_id) VALUES (pg_temp.rid('101'), pg_temp.res('2027-01-01'))$$,
  'ux_task_one_open_per_room');
SELECT pg_temp.expect_fail('BR-112 IN_PROGRESS không có người nhận',
  $$UPDATE cleaning_tasks SET status = 'IN_PROGRESS'$$, 'ck_task_assignee');
SELECT pg_temp.expect_fail('BR-112 completed_at khi chưa DONE',
  $$UPDATE cleaning_tasks SET completed_at = now()$$, 'ck_task_completed_at');
SELECT pg_temp.expect_ok  ('BR-112 nhận nhiệm vụ (IN_PROGRESS có người nhận)',
  $$UPDATE cleaning_tasks SET status = 'IN_PROGRESS', assigned_housekeeper_id = pg_temp.uid('donphong01')$$);
SELECT pg_temp.expect_fail('BR-112 DONE thiếu completed_at',
  $$UPDATE cleaning_tasks SET status = 'DONE'$$, 'ck_task_completed_at');
SELECT pg_temp.expect_ok  ('BR-112 DONE có completed_at',
  $$UPDATE cleaning_tasks SET status = 'DONE', completed_at = now()$$);
SELECT pg_temp.expect_ok  ('BR-111 nhiệm vụ mới cho phòng 101 sau khi nhiệm vụ cũ DONE',
  $$INSERT INTO cleaning_tasks(room_id, reservation_id) VALUES (pg_temp.rid('101'), pg_temp.res('2027-01-01'))$$);

-- ======================= BR-102 xóa phòng (DB-F01, DB-F07) =======================
SELECT pg_temp.expect_ok  ('BR-102 tạo phòng mới Z1',
  $$INSERT INTO rooms(room_number, room_type_id) VALUES ('Z1', pg_temp.rtid('STANDARD'))$$);
SELECT pg_temp.expect_ok  ('BR-102 xóa mềm phòng mới chưa dùng',
  $$UPDATE rooms SET deleted = TRUE WHERE room_number = 'Z1'$$);
SELECT pg_temp.expect_fail('BR-102 gán đơn vào phòng đã xóa',
  pg_temp.nightly('Z1','2027-05-01','2027-05-02'), 'ck_room_delete_never_used');
SELECT pg_temp.expect_ok  ('BR-100 tạo lại số phòng của phòng đã xóa (z1)',
  $$INSERT INTO rooms(room_number, room_type_id) VALUES ('z1', pg_temp.rtid('STANDARD'))$$);
SELECT pg_temp.expect_ok  ('BR-102 gán trước phòng 201 cho đơn',
  pg_temp.nightly('201','2027-03-01','2027-03-02'));
SELECT pg_temp.expect_ok  ('BR-102 bỏ gán phòng 201 (như no-show, đổi lịch)',
  $$UPDATE reservations SET assigned_room_id = NULL WHERE check_in_date = '2027-03-01'$$);
SELECT pg_temp.expect_eq  ('BR-102 phòng 201 vẫn ghi nhận đã từng dùng',
  $$SELECT ever_used::text FROM rooms WHERE room_number = '201'$$, 'true');
SELECT pg_temp.expect_fail('BR-102 xóa mềm phòng đã từng gắn đơn',
  $$UPDATE rooms SET deleted = TRUE WHERE room_number = '201'$$, 'ck_room_delete_never_used');
SELECT pg_temp.expect_fail('BR-102 xóa cứng phòng đã từng gắn đơn',
  $$DELETE FROM rooms WHERE room_number = '201'$$, 'trg_room_delete_guard');
SELECT pg_temp.expect_ok  ('BR-102 tạo phòng mới Z2',
  $$INSERT INTO rooms(room_number, room_type_id) VALUES ('Z2', pg_temp.rtid('STANDARD'))$$);
SELECT pg_temp.expect_fail('BR-102 xóa phòng RESERVED',
  $$UPDATE rooms SET status = 'RESERVED', deleted = TRUE WHERE room_number = 'Z2'$$, 'ck_room_delete_available');
SELECT pg_temp.expect_ok  ('BR-102 xóa cứng phòng AVAILABLE chưa từng dùng',
  $$DELETE FROM rooms WHERE room_number = 'Z2'$$);

-- ======================= Chặn trùng phòng theo khoảng chiếm (BR-60, BR-64) =======================
SELECT pg_temp.expect_ok  ('BR-60 HOURLY 09:00–12:00 phòng 202',  pg_temp.hourly('202','2027-02-01','09:00',3));
SELECT pg_temp.expect_fail('BR-64 HOURLY 11:00–13:00 cùng phòng chồng giờ',
  pg_temp.hourly('202','2027-02-01','11:00',2), 'ex_res_room_no_overlap');
SELECT pg_temp.expect_ok  ('BR-60 HOURLY 12:00–14:00 nối tiếp (nửa mở)', pg_temp.hourly('202','2027-02-01','12:00',2));
SELECT pg_temp.expect_ok  ('BR-60 HOURLY 06:00–12:00 phòng 202',  pg_temp.hourly('202','2027-02-05','06:00',6));
SELECT pg_temp.expect_ok  ('BR-60 NIGHTLY nhận 14:00 cùng ngày sau HOURLY', pg_temp.nightly('202','2027-02-05','2027-02-06'));
SELECT pg_temp.expect_ok  ('BR-60 NIGHTLY 10–11/02 phòng 202',  pg_temp.nightly('202','2027-02-10','2027-02-11'));
SELECT pg_temp.expect_fail('BR-64 HOURLY 13:00–15:00 trùng NIGHTLY nhận 14:00',
  pg_temp.hourly('202','2027-02-10','13:00',2), 'ex_res_room_no_overlap');
SELECT pg_temp.expect_fail('BR-64 HOURLY sáng ngày trả phòng trước 12:00',
  pg_temp.hourly('202','2027-02-11','10:00',2), 'ex_res_room_no_overlap');
SELECT pg_temp.expect_ok  ('BR-60 HOURLY từ 12:00 ngày trả phòng',
  pg_temp.hourly('202','2027-02-11','12:00',2));
SELECT pg_temp.expect_ok  ('BR-24 NO_SHOW mất cọc',
  $$UPDATE reservations SET status = 'NO_SHOW', no_show_at = now(), deposit_forfeited = TRUE, assigned_room_id = NULL
    WHERE check_in_date = '2027-02-05' AND booking_type = 'NIGHTLY'$$);
-- DB2-F03: đúng kịch bản trong cột test của BR-60, cùng phòng 301 cùng ngày 01/06/2027
SELECT pg_temp.expect_ok  ('BR-60 NIGHTLY trả phòng 12:00 ngày 01/06', pg_temp.nightly('301','2027-05-31','2027-06-01'));
SELECT pg_temp.expect_ok  ('BR-60 HOURLY 12:00–14:00 giữa hai đơn kề nhau', pg_temp.hourly('301','2027-06-01','12:00',2));
SELECT pg_temp.expect_ok  ('BR-60 NIGHTLY nhận phòng 14:00 cùng ngày', pg_temp.nightly('301','2027-06-01','2027-06-02'));

-- ======================= Idempotency (BR-90) =======================
-- DB2-F01: BR-91 bước (2) lưu thời điểm t cùng key trước khi gọi gateway
SELECT pg_temp.expect_ok  ('BR-91 lưu bản ghi đang xử lý (chưa có mã phản hồi) kèm thời điểm t',
  $$INSERT INTO idempotency_records(idempotency_key, request_hash, locked_timestamp)
    VALUES ('idem-0', repeat('d', 64), '2026-12-02 07:30Z')$$);
SELECT pg_temp.expect_ok  ('BR-91 ghi kết quả sau khi hoàn tất, giữ nguyên t',
  $$UPDATE idempotency_records SET response_status = 200, response_body_json = '{"ok": true}'
    WHERE idempotency_key = 'idem-0' AND locked_timestamp = '2026-12-02 07:30Z'$$);
SELECT pg_temp.expect_ok  ('BR-90 lưu kết quả lần đầu',
  $$INSERT INTO idempotency_records(idempotency_key, request_hash, response_status, response_body_json)
    VALUES ('idem-1', repeat('a', 64), 201, '{"ok": true}')$$);
SELECT pg_temp.expect_fail('BR-90 trùng Idempotency-Key',
  $$INSERT INTO idempotency_records(idempotency_key, request_hash, response_status)
    VALUES ('idem-1', repeat('b', 64), 201)$$, 'pk_idempotency_records');
SELECT pg_temp.expect_fail('BR-90 request_hash không phải SHA-256 hex',
  $$INSERT INTO idempotency_records(idempotency_key, request_hash, response_status)
    VALUES ('idem-2', 'xyz', 201)$$, 'ck_idem_hash');
SELECT pg_temp.expect_fail('BR-90 mã HTTP 600',
  $$INSERT INTO idempotency_records(idempotency_key, request_hash, response_status)
    VALUES ('idem-3', repeat('c', 64), 600)$$, 'ck_idem_status');

-- ---------------- Kết quả ----------------
SELECT no, CASE WHEN expected = actual THEN 'PASS' ELSE '**FAIL**' END AS verdict,
       label, expected, actual, coalesce(detail, '') AS db_message
FROM _result ORDER BY no;

SELECT count(*) FILTER (WHERE expected = actual)  AS passed,
       count(*) FILTER (WHERE expected <> actual) AS failed,
       count(*) AS total
FROM _result;

DO $$
DECLARE n INT;
BEGIN
    SELECT count(*) INTO n FROM _result WHERE expected <> actual;
    IF n > 0 THEN
        RAISE EXCEPTION '% case kiểm thử ràng buộc thất bại', n;
    END IF;
END $$;

ROLLBACK;
