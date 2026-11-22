# HMS PostgreSQL v2 Database Schema Specification
**Database Engine:** PostgreSQL 17 (với extensions: `uuid-ossp`, `pgcrypto`, `btree_gist`)  
**Design Standard:** 3NF, Snake_case, PK UUID v4, 15 Relational Tables, 144 Constraints.

---

## 1. Danh Sách 15 Bảng Dữ Liệu Khớp SRS 4.3 & BR v1.2

1. `users`: Quản lý tài khoản 4 vai trò (ADMIN, MANAGER, RECEPTIONIST, HOUSEKEEPER), cơ chế khóa 15 phút sau 5 lần sai (BR-71, BR-93, BR-94).
2. `auth_tokens`: Phiên làm việc Opaque Token, thời hạn chính xác 30 phút (`ck_token_ttl`) từ `issued_at` (BR-72, BR-73).
3. `room_types`: Loại phòng (STANDARD, DELUXE, SUITE), `max_capacity` (1..6), `base_nightly_rate` (1..100M VNĐ) (BR-101, BR-103).
4. `rooms`: Phòng cụ thể (101, 102, 103, 201, 202, 301), trạng thái (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `CLEANING`, `OUT_OF_SERVICE`) (BR-65, BR-104).
5. `reservations`: Đơn đặt phòng NIGHTLY / HOURLY, thông tin khách, trạng thái, snapshot giá, tiền cọc đã thu/mất (BR-03, BR-04, BR-08, BR-55, BR-60).
6. `reservation_holiday_nights`: Chi tiết các đêm trùng ngày lễ để tính phụ thu (BR-33).
7. `vouchers`: Mã khuyến mãi giảm giá theo PERCENT hoặc FIXED (BR-40, BR-44).
8. `system_config`: Tham số hệ thống toàn cục: tỷ lệ cọc (30%), phí dịch vụ (5%), VAT (10%) (BR-88).
9. `holidays`: Danh mục ngày lễ dương lịch cố định hàng năm (01/01, 30/04, 01/05, 02/09) (BR-89).
10. `service_catalog_items`: Danh mục dịch vụ Minibar và Giặt ủi (BR-110).
11. `service_charge_lines`: Dòng phát sinh dịch vụ Minibar, Giặt ủi, hoặc Bồi thường Hư hại (DAMAGE) gắn vào đơn (BR-34..37).
12. `cleaning_tasks`: Nhiệm vụ dọn buồng phòng 2 bước nghiêm ngặt: PENDING -> IN_PROGRESS -> DONE (BR-111..114).
13. `invoices`: Hóa đơn tính toán 11 bước chuẩn BR-50; bất biến hoàn toàn sau khi sang trạng thái ISSUED (BR-54).
14. `payment_transactions`: Giao dịch thanh toán cọc và quyết toán check-out, gắn kết với cổng thanh toán (BR-26, BR-84..86).
15. `idempotency_records`: Bản ghi chống gửi trùng yêu cầu (Idempotency), lưu SHA-256 payload trong 24 giờ (BR-90, BR-91).

---

## 2. Bảng Truy Vết Quy Tắc Nghiệp Vụ Sang Database Constraint (BR -> Constraint Matrix)

| Quy tắc BR | Bảng CSDL | Tên Ràng buộc / Cơ chế CSDL | Ý nghĩa & Hành vi bảo vệ |
| :--- | :--- | :--- | :--- |
| **BR-03** | `reservations` | `ck_reservation_nightly_nights` | Số đêm từ 1 đến 30: `(check_out_date - check_in_date) BETWEEN 1 AND 30` |
| **BR-04** | `reservations` | `ck_reservation_hourly_hours` | Số giờ thuê từ 1 đến 10 giờ trong khung 06:00 đến 22:00 |
| **BR-09** | `reservations` | `ck_guest_phone_format` | SĐT chỉ gồm 9 đến 11 chữ số nguyên: `guest_phone ~ '^[0-9]{9,11}$'` |
| **BR-54** | `invoices` | `trg_invoice_immutable` | Trigger chặn UPDATE/DELETE khi `status = 'ISSUED'` |
| **BR-60** | `reservations` | `excl_room_occupancy` | `EXCLUDE USING gist (room_id WITH =, stay_range WITH &&)` chống trùng phòng |
| **BR-71** | `users` | `ck_failed_attempts_limit` | Giới hạn 5 lần đăng nhập sai, tính thời điểm `locked_until` |
| **BR-73** | `auth_tokens` | `ck_token_ttl` | Token hết hạn đúng sau 30 phút: `expires_at = issued_at + INTERVAL '30 minutes'` |
| **BR-88** | `system_config` | `ck_system_rates_scale` | Tỷ lệ cọc, phí, VAT có scale <= 2 chữ số thập phân |
| **BR-100** | `rooms` | `uq_room_number_ci` | Số phòng là duy nhất không phân biệt hoa thường (`LOWER(room_number)`) |
| **BR-101** | `room_types` | `ck_room_type_capacity_rate` | Sức chứa 1..6 người; giá đêm từ 1 đến 100.000.000 VNĐ |
| **BR-111** | `cleaning_tasks`| `uq_active_task_per_room` | Mỗi phòng chỉ có tối đa 1 task dọn chưa hoàn thành (`PENDING` hoặc `IN_PROGRESS`) |
