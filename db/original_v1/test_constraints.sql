-- =====================================================================
-- Kiểm thử ràng buộc CSDL HMS (chạy sau V1 + V2, trên DB test trống)
-- Mỗi case: hoặc phải THÀNH CÔNG (expect_ok) hoặc phải BỊ CHẶN (expect_fail).
-- Cách chạy: psql -v ON_ERROR_STOP=1 -f test_constraints.sql
-- Toàn bộ chạy trong một giao dịch và ROLLBACK ở cuối, không để lại dữ liệu.
-- =====================================================================
BEGIN;

CREATE TEMP TABLE _result (no SERIAL, label TEXT, expected TEXT, actual TEXT, detail TEXT);

CREATE FUNCTION pg_temp.expect_fail(label TEXT, stmt TEXT) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    BEGIN
        EXECUTE stmt;
        INSERT INTO _result(label, expected, actual) VALUES (label, 'FAIL', 'OK');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO _result(label, expected, actual, detail) VALUES (label, 'FAIL', 'FAIL', SQLERRM);
    END;
END $$;

CREATE FUNCTION pg_temp.expect_ok(label TEXT, stmt TEXT) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    BEGIN
        EXECUTE stmt;
        INSERT INTO _result(label, expected, actual) VALUES (label, 'OK', 'OK');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO _result(label, expected, actual, detail) VALUES (label, 'OK', 'FAIL', SQLERRM);
    END;
END $$;

-- Mẫu INSERT đơn NIGHTLY: phòng 301 (SUITE), khoảng chiếm theo giờ VN
CREATE FUNCTION pg_temp.nightly(room_no TEXT, d_in DATE, d_out DATE, st TEXT DEFAULT 'CONFIRMED')
RETURNS TEXT LANGUAGE sql AS $$
SELECT format($f$
 INSERT INTO reservation (booking_type, status, room_type_id, assigned_room_id, guest_name, guest_phone,
   check_in_date, check_out_date, occupancy_start, occupancy_end, adults,
   nightly_rate_snap, deposit_rate_snap, service_fee_rate_snap, vat_rate_snap,
   deposit_required, deposit_paid, created_by, actual_check_in_at)
 SELECT 'NIGHTLY', %L, r.room_type_id, r.id, 'Nguyen Van A', '0901234567',
   %L::date, %L::date,
   (%L::date + time '14:00') AT TIME ZONE 'Asia/Ho_Chi_Minh',
   (%L::date + time '12:00') AT TIME ZONE 'Asia/Ho_Chi_Minh', 2,
   1800000, 30, 5, 10, 540000, 540000, (SELECT id FROM app_user WHERE username='letan01'),
   CASE WHEN %L IN ('CHECKED_IN','CHECKED_OUT') THEN now() END
 FROM room r WHERE r.room_number = %L$f$, st, d_in, d_out, d_in, d_out, st, room_no)
$$;

-- ---------------- F01 ----------------
SELECT pg_temp.expect_fail('BR-93 username trùng khác hoa thường (ADMIN01)',
  $$INSERT INTO app_user(username,password_hash,role) VALUES ('ADMIN01','x','ADMIN')$$);
SELECT pg_temp.expect_fail('BR-93 username 3 ký tự',
  $$INSERT INTO app_user(username,password_hash,role) VALUES ('abc','x','ADMIN')$$);
SELECT pg_temp.expect_ok  ('BR-93 username 4 ký tự',
  $$INSERT INTO app_user(username,password_hash,role) VALUES ('abcd','x','ADMIN')$$);
SELECT pg_temp.expect_fail('BR-93 username 31 ký tự',
  $$INSERT INTO app_user(username,password_hash,role) VALUES (repeat('a',31),'x','ADMIN')$$);
SELECT pg_temp.expect_fail('BR-93 vai trò ngoài danh sách',
  $$INSERT INTO app_user(username,password_hash,role) VALUES ('guest01','x','GUEST')$$);
SELECT pg_temp.expect_fail('BR-72 token sống khác 30 phút',
  $$INSERT INTO auth_token VALUES (gen_random_uuid(), 1, now(), now() + interval '31 minutes', NULL)$$);

-- ---------------- BR-88, BR-89 ----------------
SELECT pg_temp.expect_fail('BR-88 tỷ lệ cọc 0',       $$UPDATE system_config SET deposit_rate = 0$$);
SELECT pg_temp.expect_ok  ('BR-88 tỷ lệ cọc 100',     $$UPDATE system_config SET deposit_rate = 100$$);
SELECT pg_temp.expect_fail('BR-88 tỷ lệ cọc 100,01',  $$UPDATE system_config SET deposit_rate = 100.01$$);
SELECT pg_temp.expect_fail('BR-88 VAT 20,01',         $$UPDATE system_config SET vat_rate = 20.01$$);
SELECT pg_temp.expect_fail('BR-88 dòng cấu hình thứ hai', $$INSERT INTO system_config(id) VALUES (2)$$);
SELECT pg_temp.expect_fail('BR-89 ngày 31/04',        $$INSERT INTO holiday(month,day,name) VALUES (4,31,'x')$$);
SELECT pg_temp.expect_fail('BR-89 ngày 29/02',        $$INSERT INTO holiday(month,day,name) VALUES (2,29,'x')$$);
SELECT pg_temp.expect_fail('BR-89 ngày lễ trùng 01/01', $$INSERT INTO holiday(month,day,name) VALUES (1,1,'x')$$);

-- ---------------- F02 ----------------
SELECT pg_temp.expect_fail('BR-100 số phòng trùng khác hoa thường',
  $$INSERT INTO room(room_number, room_type_id) VALUES ('a101',1); INSERT INTO room(room_number, room_type_id) VALUES ('A101',1)$$);
SELECT pg_temp.expect_fail('BR-100 số phòng 11 ký tự',
  $$INSERT INTO room(room_number, room_type_id) VALUES ('12345678901',1)$$);
SELECT pg_temp.expect_fail('BR-101 maxCapacity 7',    $$UPDATE room_type SET max_capacity = 7 WHERE name='SUITE'$$);
SELECT pg_temp.expect_fail('BR-101 giá 100.000.001',  $$UPDATE room_type SET nightly_rate = 100000001 WHERE name='SUITE'$$);
SELECT pg_temp.expect_fail('BR-104 OUT_OF_SERVICE không lý do',
  $$UPDATE room SET status='OUT_OF_SERVICE' WHERE room_number='103'$$);
SELECT pg_temp.expect_fail('BR-104 lý do toàn khoảng trắng',
  $$UPDATE room SET status='OUT_OF_SERVICE', out_of_service_reason='   ' WHERE room_number='103'$$);
SELECT pg_temp.expect_ok  ('BR-104 OUT_OF_SERVICE có lý do',
  $$UPDATE room SET status='OUT_OF_SERVICE', out_of_service_reason='Hỏng điều hòa' WHERE room_number='103'$$);
SELECT pg_temp.expect_fail('BR-102 xóa loại phòng còn phòng', $$DELETE FROM room_type WHERE name='SUITE'$$);

-- ---------------- Voucher BR-44 ----------------
SELECT pg_temp.expect_fail('BR-44 FIXED giá trị 0',
  $$INSERT INTO voucher(code,type,fixed_amount,valid_from,valid_to) VALUES ('F0','FIXED',0,'2026-01-01','2026-12-31')$$);
SELECT pg_temp.expect_fail('BR-44 PERCENT 100,01',
  $$INSERT INTO voucher(code,type,percent,valid_from,valid_to) VALUES ('P1','PERCENT',100.01,'2026-01-01','2026-12-31')$$);
SELECT pg_temp.expect_fail('BR-44 maxDiscount 0',
  $$INSERT INTO voucher(code,type,percent,max_discount,valid_from,valid_to) VALUES ('P2','PERCENT',10,0,'2026-01-01','2026-12-31')$$);
SELECT pg_temp.expect_fail('BR-44 validFrom sau validTo',
  $$INSERT INTO voucher(code,type,percent,valid_from,valid_to) VALUES ('P3','PERCENT',10,'2026-12-31','2026-01-01')$$);
SELECT pg_temp.expect_fail('BR-44 mã trùng (sale10)',
  $$INSERT INTO voucher(code,type,percent,valid_from,valid_to) VALUES ('sale10','PERCENT',10,'2026-01-01','2026-12-31')$$);

-- ---------------- F03 – đơn đặt ----------------
SELECT pg_temp.expect_ok  ('BR-03 NIGHTLY 1 đêm',  pg_temp.nightly('101','2026-12-01','2026-12-02'));
SELECT pg_temp.expect_fail('BR-03 NIGHTLY 0 đêm',  pg_temp.nightly('102','2026-12-01','2026-12-01'));
SELECT pg_temp.expect_ok  ('BR-03 NIGHTLY 30 đêm', pg_temp.nightly('102','2027-01-01','2027-01-31'));
SELECT pg_temp.expect_fail('BR-03 NIGHTLY 31 đêm', pg_temp.nightly('201','2027-01-01','2027-02-01'));

SELECT pg_temp.expect_ok  ('BR-64 phòng 301 đêm 10–12/12', pg_temp.nightly('301','2026-12-10','2026-12-12'));
SELECT pg_temp.expect_fail('BR-64/BR-60 phòng 301 chồng đêm 11/12 (EXCLUDE)',
  pg_temp.nightly('301','2026-12-11','2026-12-13'));
SELECT pg_temp.expect_ok  ('BR-60 trả 12:00 và nhận 14:00 cùng ngày 12/12 không xung đột',
  pg_temp.nightly('301','2026-12-12','2026-12-14'));
SELECT pg_temp.expect_ok  ('BR-63 đơn CANCELLED không chiếm phòng',
  $$UPDATE reservation SET status='CANCELLED', cancelled_at=now()
    WHERE assigned_room_id=(SELECT id FROM room WHERE room_number='301') AND check_in_date='2026-12-10'$$);
SELECT pg_temp.expect_ok  ('BR-63 đặt lại khoảng của đơn đã hủy',
  pg_temp.nightly('301','2026-12-10','2026-12-12'));

SELECT pg_temp.expect_fail('BR-82 hai đơn CHECKED_IN cùng phòng',
  pg_temp.nightly('202','2026-11-01','2026-11-03','CHECKED_IN') || ';' ||
  pg_temp.nightly('202','2026-11-05','2026-11-06','CHECKED_IN'));
SELECT pg_temp.expect_fail('BR-66 CHECKED_IN nhưng chưa gán phòng',
  $$INSERT INTO reservation (booking_type,status,room_type_id,guest_name,guest_phone,check_in_date,check_out_date,
    occupancy_start,occupancy_end,adults,nightly_rate_snap,deposit_rate_snap,service_fee_rate_snap,vat_rate_snap,
    deposit_required,created_by,actual_check_in_at)
    VALUES ('NIGHTLY','CHECKED_IN',1,'B','0901234567','2026-11-01','2026-11-02',
    '2026-11-01 07:00Z','2026-11-02 05:00Z',1,600000,30,5,10,180000,1,now())$$);
SELECT pg_temp.expect_fail('BR-66 CANCELLED thiếu cancelled_at',
  $$UPDATE reservation SET status='CANCELLED' WHERE check_in_date='2026-12-01'$$);

-- BR-09 thông tin khách
SELECT pg_temp.expect_fail('BR-09 tên rỗng',         $$UPDATE reservation SET guest_name='' WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-09 tên có khoảng trắng đầu', $$UPDATE reservation SET guest_name=' An' WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-09 điện thoại 8 số',  $$UPDATE reservation SET guest_phone='09012345' WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_ok  ('BR-09 điện thoại 9 số',  $$UPDATE reservation SET guest_phone='090123456' WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-09 điện thoại 12 số', $$UPDATE reservation SET guest_phone='090123456789' WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-09 điện thoại có khoảng trắng', $$UPDATE reservation SET guest_phone='0901 23456' WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-09 email thiếu @',    $$UPDATE reservation SET guest_email='a.example.com' WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-32 0 người lớn',      $$UPDATE reservation SET adults=0 WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-32 3 trẻ dưới 6',     $$UPDATE reservation SET children_under_6=3 WHERE check_in_date='2026-12-01'$$);

-- BR-04/BR-40/BR-32: HOURLY
SELECT pg_temp.expect_fail('BR-04 HOURLY 11 giờ',
  $$INSERT INTO reservation (booking_type,room_type_id,guest_name,guest_phone,hourly_start,hourly_hours,
    occupancy_start,occupancy_end,adults,nightly_rate_snap,deposit_rate_snap,service_fee_rate_snap,vat_rate_snap,
    deposit_required,created_by)
    VALUES ('HOURLY',1,'C','0901234567','2026-12-20 03:00Z',11,'2026-12-20 03:00Z','2026-12-20 14:00Z',
    1,600000,30,5,10,54000,1)$$);
SELECT pg_temp.expect_fail('BR-40 HOURLY kèm voucher',
  $$INSERT INTO reservation (booking_type,room_type_id,guest_name,guest_phone,hourly_start,hourly_hours,
    occupancy_start,occupancy_end,adults,nightly_rate_snap,deposit_rate_snap,service_fee_rate_snap,vat_rate_snap,
    deposit_required,created_by,voucher_id,voucher_type_snap,voucher_min_nights_snap)
    VALUES ('HOURLY',1,'C','0901234567','2026-12-20 03:00Z',3,'2026-12-20 03:00Z','2026-12-20 06:00Z',
    1,600000,30,5,10,54000,1,1,'PERCENT',2)$$);
SELECT pg_temp.expect_fail('BR-32 HOURLY 3 người',
  $$INSERT INTO reservation (booking_type,room_type_id,guest_name,guest_phone,hourly_start,hourly_hours,
    occupancy_start,occupancy_end,adults,children_6_11,nightly_rate_snap,deposit_rate_snap,service_fee_rate_snap,vat_rate_snap,
    deposit_required,created_by)
    VALUES ('HOURLY',1,'C','0901234567','2026-12-20 03:00Z',3,'2026-12-20 03:00Z','2026-12-20 06:00Z',
    2,1,600000,30,5,10,54000,1)$$);
SELECT pg_temp.expect_fail('BR-26 cọc mất lớn hơn cọc đã thu',
  $$UPDATE reservation SET deposit_forfeited = deposit_paid + 1 WHERE check_in_date='2026-12-01'$$);

-- ---------------- F06 dịch vụ ----------------
SELECT pg_temp.expect_fail('BR-34 minibar số lượng 0',
  $$INSERT INTO service_charge(reservation_id,kind,catalog_item_id,quantity,unit_price,created_by)
    SELECT id,'MINIBAR',1,0,15000,1 FROM reservation WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_ok  ('BR-34 minibar số lượng 99',
  $$INSERT INTO service_charge(reservation_id,kind,catalog_item_id,quantity,unit_price,created_by)
    SELECT id,'MINIBAR',1,99,15000,1 FROM reservation WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-34 minibar số lượng 100',
  $$INSERT INTO service_charge(reservation_id,kind,catalog_item_id,quantity,unit_price,created_by)
    SELECT id,'MINIBAR',1,100,15000,1 FROM reservation WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-36 hư hao 50.000.001',
  $$INSERT INTO service_charge(reservation_id,kind,quantity,unit_price,note,created_by)
    SELECT id,'DAMAGE',1,50000001,'Vỡ ly',1 FROM reservation WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-36 hư hao ghi chú toàn khoảng trắng',
  $$INSERT INTO service_charge(reservation_id,kind,quantity,unit_price,note,created_by)
    SELECT id,'DAMAGE',1,100000,'   ',1 FROM reservation WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-110 danh mục đơn giá 5.000.001',
  $$INSERT INTO service_catalog_item(code,name,kind,unit_price) VALUES ('MB99','X','MINIBAR',5000001)$$);

-- ---------------- F05 hóa đơn – ví dụ A, B, C, D của BR v1.2 ----------------
SELECT pg_temp.expect_ok('BR-50 ví dụ A (amountDue 3.247.000)',
  $$INSERT INTO invoice(reservation_id,room_charge,late_surcharge,extra_child,discount,discount_source,
     service_fee_base,service_fee,services_total,taxable,vat,total,deposit_paid,amount_due,check_out_at)
    SELECT id,3000000,300000,300000,200000,'VOUCHER',3400000,170000,200000,3770000,377000,4147000,900000,3247000,now()
    FROM reservation WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-54 sửa hóa đơn ISSUED',
  $$UPDATE invoice SET total = total + 1$$);
SELECT pg_temp.expect_fail('BR-54 xóa hóa đơn ISSUED',
  $$DELETE FROM invoice$$);
SELECT pg_temp.expect_fail('BR-53 ví dụ D làm tròn ở cuối (total 1.425.928 sai)',
  $$INSERT INTO invoice(reservation_id,room_charge,service_fee_base,service_fee,taxable,vat,total,deposit_paid,amount_due,check_out_at)
    SELECT id,1234570,1234570,61729,1296299,129630,1425928,370371,1055557,now()
    FROM reservation WHERE check_in_date='2027-01-01'$$);
SELECT pg_temp.expect_ok('BR-53 ví dụ D làm tròn từng dòng (total 1.425.929)',
  $$INSERT INTO invoice(reservation_id,room_charge,service_fee_base,service_fee,taxable,vat,total,deposit_paid,amount_due,check_out_at)
    SELECT id,1234570,1234570,61729,1296299,129630,1425929,370371,1055558,now()
    FROM reservation WHERE check_in_date='2027-01-01'$$);
SELECT pg_temp.expect_fail('BR-43 discount lớn hơn roomCharge',
  $$INSERT INTO invoice(reservation_id,room_charge,discount,service_fee_base,service_fee,taxable,vat,total,deposit_paid,amount_due,check_out_at)
    SELECT id,770000,800000,-30000,0,-30000,0,-30000,0,-30000,now()
    FROM reservation WHERE check_in_date='2026-12-12'$$);
SELECT pg_temp.expect_ok('BR-84 ví dụ C (amountDue −300.000, hoàn)',
  $$INSERT INTO invoice(reservation_id,room_charge,discount,discount_source,service_fee_base,service_fee,taxable,vat,total,deposit_paid,amount_due,check_out_at)
    SELECT id,1000000,1000000,'VOUCHER',0,0,0,0,0,300000,-300000,now()
    FROM reservation WHERE check_in_date='2026-12-12'$$);

-- ---------------- Giao dịch thanh toán BR-86, BR-90 ----------------
SELECT pg_temp.expect_ok('BR-86 thu check-out lần 1',
  $$INSERT INTO payment_transaction(reservation_id,purpose,direction,amount,status,gateway_txn_id,idempotency_key)
    SELECT id,'CHECKOUT','CHARGE',3247000,'SUCCEEDED','gw-k1','k1' FROM reservation WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-86 thu check-out SUCCEEDED lần 2 (khác key)',
  $$INSERT INTO payment_transaction(reservation_id,purpose,direction,amount,status,gateway_txn_id,idempotency_key)
    SELECT id,'CHECKOUT','CHARGE',3247000,'SUCCEEDED','gw-k2','k2' FROM reservation WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_ok('BR-84 lần thu FAILED vẫn được ghi',
  $$INSERT INTO payment_transaction(reservation_id,purpose,direction,amount,status,gateway_txn_id,idempotency_key)
    SELECT id,'CHECKOUT','CHARGE',3247000,'FAILED','gw-k3','k3' FROM reservation WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-90 trùng gateway_txn_id',
  $$INSERT INTO payment_transaction(reservation_id,purpose,direction,amount,status,gateway_txn_id,idempotency_key)
    SELECT id,'DEPOSIT','CHARGE',1,'SUCCEEDED','gw-k1','k1' FROM reservation WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('Số tiền giao dịch bằng 0',
  $$INSERT INTO payment_transaction(reservation_id,purpose,direction,amount,status,gateway_txn_id,idempotency_key)
    SELECT id,'DEPOSIT','CHARGE',0,'SUCCEEDED','gw-k9','k9' FROM reservation WHERE check_in_date='2026-12-01'$$);

-- ---------------- Nhiệm vụ dọn phòng BR-111 đến BR-114 ----------------
SELECT pg_temp.expect_ok('BR-111 tạo nhiệm vụ PENDING cho phòng 101',
  $$INSERT INTO cleaning_task(room_id,reservation_id)
    SELECT assigned_room_id,id FROM reservation WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-111 retry cùng đơn tạo nhiệm vụ thứ hai',
  $$INSERT INTO cleaning_task(room_id,reservation_id)
    SELECT assigned_room_id,id FROM reservation WHERE check_in_date='2026-12-01'$$);
SELECT pg_temp.expect_fail('BR-111 hai nhiệm vụ mở cho một phòng',
  $$INSERT INTO cleaning_task(room_id,reservation_id)
    SELECT (SELECT id FROM room WHERE room_number='101'),id FROM reservation WHERE check_in_date='2027-01-01'$$);
SELECT pg_temp.expect_fail('BR-112 IN_PROGRESS không có người nhận',
  $$UPDATE cleaning_task SET status='IN_PROGRESS', started_at=now()$$);
SELECT pg_temp.expect_fail('BR-112 DONE bỏ qua IN_PROGRESS (thiếu started_at)',
  $$UPDATE cleaning_task SET status='DONE', done_at=now()$$);

-- ---------------- Kết quả ----------------
SELECT no, CASE WHEN expected = actual THEN 'PASS' ELSE '**FAIL**' END AS verdict,
       label, expected, actual, left(coalesce(detail,''),70) AS db_message
FROM _result ORDER BY no;

SELECT count(*) FILTER (WHERE expected = actual) AS passed,
       count(*) FILTER (WHERE expected <> actual) AS failed,
       count(*) AS total
FROM _result;

ROLLBACK;
