# Báo cáo lược đồ CSDL v2

Người thiết kế: Võ Thành Đạt · Cập nhật: 28/11/2026
Căn cứ: TEAM12_SRS.docx mục 4.3 (Table 2–16) cho bảng và cột; HMS – Business Rules v1.2 cho ràng buộc (BR thắng SRS khi mâu thuẫn).

## 1. File

| File | Nội dung |
| --- | --- |
| `db/migration/V1__init_schema.sql` | 15 bảng theo SRS 4.3, PK UUID, 133 ràng buộc có tên (PK, FK, CHECK, UNIQUE, EXCLUDE), cùng unique index, trigger và hàm `reservation_occupancy` |
| `db/migration/V2__seed_data.sql` | Dữ liệu mẫu theo Phụ lục BR v1.2 |
| `db/test/test_constraints.sql` | 219 case kiểm ràng buộc; mỗi case bị chặn phải bị chặn **đúng tên ràng buộc** mong đợi |
| `db/HMS_DB_Schema.md` | Tài liệu lược đồ: quyết định thiết kế, ERD, chống overbooking, truy vết BR → ràng buộc, những gì CSDL không kiểm |
| `db/DB_REPORT.md` | File này |
| `db/original_v1/` | Bản v1 (18/11/2026) giữ để đối chiếu, không dùng để chạy |

## 2. Đối chiếu SRS 4.3 ↔ cột vật lý

Quy tắc: tên vật lý = snake_case của tên SRS. Không có cột ngoài SRS. Không thiếu cột nào của SRS.

| SRS | Bảng vật lý | Cột SRS → cột vật lý (kiểu) |
| --- | --- | --- |
| Table 2 USERS | `users` | UserID → user_id (UUID PK) · Username → username (VARCHAR 30) · PasswordHash → password_hash (VARCHAR 255) · Role → role (VARCHAR 20) · Active → active (BOOLEAN) · FailedLoginAttempts → failed_login_attempts (SMALLINT) · LockedUntil → locked_until (TIMESTAMPTZ) · Version → version (BIGINT) |
| Table 3 AUTH_TOKENS | `auth_tokens` | TokenValue → token_value (VARCHAR 128 PK) · UserID → user_id (UUID FK) · RoleSnapshot → role_snapshot (VARCHAR 20) · IssuedAt → issued_at · ExpiresAt → expires_at (TIMESTAMPTZ) · Revoked → revoked (BOOLEAN) |
| Table 4 ROOM_TYPES | `room_types` | RoomTypeID → room_type_id (UUID PK) · RoomTypeName → room_type_name (VARCHAR 50) · BaseNightlyRate → base_nightly_rate (NUMERIC 15,0) · MaxCapacity → max_capacity (SMALLINT) |
| Table 5 ROOMS | `rooms` | RoomID → room_id · RoomNumber → room_number (VARCHAR 10) · RoomTypeID → room_type_id (FK) · Status → status · MaintenanceReason → maintenance_reason (VARCHAR 200) · EverUsed → ever_used · Deleted → deleted · Version → version |
| Table 6 RESERVATIONS | `reservations` | ReservationID → reservation_id · BookingType → booking_type · RoomTypeID → room_type_id · AssignedRoomID → assigned_room_id · CreatedByUserID → created_by_user_id · Status → status · GuestName → guest_name · GuestPhone → guest_phone · GuestEmail → guest_email · VIPGuest → vip_guest · AdultCount → adult_count · Child6to11Count → child_6to11_count · ChildUnder6Count → child_under6_count · CheckInDate → check_in_date · CheckOutDate → check_out_date (DATE) · HourlyStartTime → hourly_start_time (TIME) · HourlyDurationHours → hourly_duration_hours · DepositRequired → deposit_required · DepositPaid → deposit_paid · DepositForfeited → deposit_forfeited (BOOLEAN) · SnapNightlyRate → snap_nightly_rate · SnapVoucherCode/Type/Value/MaxDiscount → snap_voucher_code/type/value (NUMERIC 10,2)/max_discount · SnapDepositRatePercent → snap_deposit_rate_percent · SnapServiceFeeRatePercent → snap_service_fee_rate_percent · SnapVATRatePercent → snap_vat_rate_percent · CreatedAt → created_at · CancelledAt → cancelled_at · NoShowAt → no_show_at · ActualCheckInTime → actual_check_in_time · ActualCheckOutTime → actual_check_out_time · Version → version |
| Table 7 RESERVATION_HOLIDAY_NIGHTS | `reservation_holiday_nights` | ReservationID → reservation_id · MonthDay → month_day (VARCHAR 5); PK kép |
| Table 8 VOUCHERS | `vouchers` | Code → code (VARCHAR 30 PK) · Type → type · Value → value (NUMERIC 10,2) · MaxDiscount → max_discount · MinNights → min_nights · ValidFrom → valid_from · ValidTo → valid_to |
| Table 9 SYSTEM_CONFIG | `system_config` | ID → id (SMALLINT = 1) · DepositRatePercent → deposit_rate_percent · ServiceFeeRatePercent → service_fee_rate_percent · VATRatePercent → vat_rate_percent · UpdatedAt → updated_at |
| Table 10 HOLIDAYS | `holidays` | MonthDay → month_day (PK) · HolidayName → holiday_name |
| Table 11 SERVICE_CATALOG_ITEMS | `service_catalog_items` | Code → code (PK) · Name → name · Category → category · UnitPrice → unit_price · Active → active |
| Table 12 SERVICE_CHARGE_LINES | `service_charge_lines` | ChargeLineID → charge_line_id · ReservationID → reservation_id · CreatedByUserID → created_by_user_id · ServiceType → service_type · ItemCode → item_code (FK) · Quantity → quantity · UnitPriceSnapshot → unit_price_snapshot · DamageNote → damage_note |
| Table 13 CLEANING_TASKS | `cleaning_tasks` | TaskID → task_id · RoomID → room_id · ReservationID → reservation_id (UNIQUE) · AssignedHousekeeperID → assigned_housekeeper_id · Status → status · CreatedAt → created_at · CompletedAt → completed_at · Version → version |
| Table 14 INVOICES | `invoices` | InvoiceID → invoice_id · ReservationID → reservation_id (UNIQUE) · IssuedByUserID → issued_by_user_id · Status → status · RoomCharge → room_charge · HolidaySurcharge → holiday_surcharge · EarlyCheckInSurcharge → early_check_in_surcharge · LateCheckOutSurcharge → late_check_out_surcharge · ExtraAdultSurcharge → extra_adult_surcharge · ExtraChildSurcharge → extra_child_surcharge · Discount → discount · ServiceFeeBase → service_fee_base · ServiceFee → service_fee · ExtraServicesTotal → extra_services_total · TaxableAmount → taxable_amount · VATAmount → vat_amount · TotalAmount → total_amount · DepositPaid → deposit_paid · AmountDue → amount_due · IssuedAt → issued_at |
| Table 15 PAYMENT_TRANSACTIONS | `payment_transactions` | TransactionID → transaction_id (VARCHAR 64 PK) · ReservationID → reservation_id (nullable) · InvoiceID → invoice_id (nullable) · CreatedByUserID → created_by_user_id · Type → type · Amount → amount · Status → status · IdempotencyKey → idempotency_key (UNIQUE) · CreatedAt → created_at |
| Table 16 IDEMPOTENCY_RECORDS | `idempotency_records` | IdempotencyKey → idempotency_key (PK) · RequestHash → request_hash (CHAR 64) · ResponseStatus → response_status (nullable = đang xử lý) · ResponseBodyJSON → response_body_json (JSONB) · LockedTimestamp → locked_timestamp · CreatedAt → created_at |

### So với bản v1 (`db/original_v1/`)

| v1 | v2 | Lý do |
| --- | --- | --- |
| PK `BIGINT IDENTITY` | PK `UUID` | SRS dùng UUIDv4; domain nhận id truyền vào trước khi lưu |
| 16 bảng, có `reservation_child` | 15 bảng theo SRS | Số trẻ được đếm và chốt lúc đặt (BR-31) |
| `hourly_start` (timestamptz), `occupancy_start/end` | `check_in_date`, `hourly_start_time` (giờ địa phương) | Theo SRS; khoảng chiếm tính bằng hàm `reservation_occupancy` |
| `voucher_id` (FK), `voucher_min_nights_snap` | Snapshot voucher theo giá trị, không FK | SRS Table 6, BR-55 |
| `deposit_forfeited` NUMERIC | BOOLEAN | SRS; số tiền cọc mất = `deposit_paid` của đơn có cờ (mục 5) |
| `purpose` + `direction`, `gateway_txn_id` | `type` 4 giá trị, `transaction_id` sinh từ key | SRS Table 15 |
| `invoice.discount_source`, `check_out_at` | Không có | Không có trong SRS; doanh thu BR-122 theo `reservations.actual_check_out_time` |
| `cleaning_task.started_at`, `done_at`, `cancelled_at` | `completed_at` | SRS Table 13; thứ tự bước BR-112 giữ ở domain |
| Không có `ever_used`, `deleted`, `issued_by`, `created_by` trên giao dịch | Có | SRS Table 5, 14, 15; BR-93, BR-102 |

## 3. Kết quả chạy

Môi trường: Neon, PostgreSQL 17.12; client psql 17.12; `psql -X -v ON_ERROR_STOP=1`.

| Lần chạy (28/11/2026) | V1 | V2 | Test |
| --- | --- | --- | --- |
| Schema tạm, lần 1 | exit 0 (4,0 s) | exit 0 (1,4 s) | exit 0 (17,9 s), **219 passed / 0 failed** |
| Schema tạm, lần 2 | exit 0 (3,8 s) | exit 0 (1,3 s) | exit 0 (18,8 s), **219 / 0**, kết quả giống hệt lần 1 |
| Dựng lại `public` | exit 0 (4,3 s) | exit 0 (1,4 s) | exit 0 (16,6 s), **219 / 0** |

- Chỉ có NOTICE "extension already exists", không có ERROR, WARNING.
- Thời gian gồm độ trễ mạng tới Neon (Singapore).
- Sau khi dựng `public`: 15 bảng, 133 ràng buộc có tên, seed 5 user / 3 loại phòng / 6 phòng / 4 ngày lễ / 6 mục dịch vụ / 2 voucher / 1 cấu hình, 0 đơn (bộ test tự ROLLBACK).

**Kiểm chứng bộ test bắt được lỗi** (đột biến trên bản 21/11, chạy trong giao dịch rồi ROLLBACK):
- Đổi tên ràng buộc mong đợi của một case: 1 case FAIL, exit 3. Như vậy `expect_fail` không nhận "mọi lỗi".
- Bỏ CHECK giờ kết thúc ≤ 24:00 và trigger `ever_used`: 6 case FAIL, exit 3.

**Ràng buộc chưa có case chặn trực tiếp:** chủ yếu là PK, FK và CHECK giá trị enum (`ck_room_status`, `ck_task_status`, `ck_txn_status`, `ck_txn_type`, `ck_scl_type`, `ck_voucher_type`, `ck_catalog_category`). Trigger `trg_room_mark_ever_used` được kiểm gián tiếp qua case `expect_eq` "phòng 201 vẫn ghi nhận đã từng dùng".

### Tự chạy lại

Trên một DB PostgreSQL ≥ 14 **trống** (bộ test giả định chỉ có dữ liệu seed):
```bash
psql "$DB_URL" -X -v ON_ERROR_STOP=1 -f db/migration/V1__init_schema.sql
psql "$DB_URL" -X -v ON_ERROR_STOP=1 -f db/migration/V2__seed_data.sql
psql "$DB_URL" -X -v ON_ERROR_STOP=1 -f db/test/test_constraints.sql
```
Bước 3 in bảng kết quả từng case và dòng `passed | failed | total`. Có case sai thì lệnh trả mã thoát khác 0. **Bắt buộc có `ON_ERROR_STOP=1`**: thiếu cờ này thì psql vẫn trả 0 dù có case sai.

## 4. Những điểm đã xử lý so với nhận xét lược đồ v1

| Vấn đề | Xử lý trong v2 |
| --- | --- |
| Chống xóa phòng đã dùng (BR-102) | `ever_used` bật khi gán phòng và không tắt khi bỏ gán; chỉ xóa mềm/xóa cứng phòng AVAILABLE chưa từng dùng |
| Email (BR-09) | Giữ dạng `tên@miền`, tối đa 100 ký tự, không bắt dấu chấm, khớp lớp domain |
| HOURLY (BR-04) | 5 CHECK riêng: đủ trường, cùng ngày, bắt đầu 06:00–22:00, 1–10 giờ, kết thúc ≤ 24:00 |
| `invoice_id` của giao dịch (BR-91) | Chỉ có với giao dịch check-out, **không** bắt NOT NULL: giao dịch ghi ở bước (3), trước khi tạo hóa đơn ở bước (4) |
| `reservation_id` của giao dịch (BR-26, BR-91) | Cho phép rỗng với lần thu cọc ghi trước khi có đơn |
| Người xuất hóa đơn, người tạo giao dịch | `issued_by_user_id`, `created_by_user_id` NOT NULL |
| Lưu thời điểm t trước khi gọi gateway (BR-91 bước 2) | `idempotency_records.response_status` cho phép NULL (đang xử lý) |
| Đơn hủy, no-show còn giữ phòng (BR-08, BR-24) | `ck_res_released_room` |
| Test chỉ kiểm "có lỗi" | `expect_fail` so đúng tên ràng buộc; thêm biên trong sát mốc và kịch bản BR-60 nguyên văn |

## 5. Quyết định thiết kế đã chốt (Đạt, 21/11/2026)

Các quyết định dưới đây ghi theo số OPEN của bảng điểm mở lớp domain. Số này **khác** với bảng `docs/OPEN_ITEMS.md` hiện có trên repo nhóm.

| Mã | BR | Quyết định |
| --- | --- | --- |
| OPEN-16 | BR-122, BR-25 | Dòng "tiền hoàn" của báo cáo kỳ = tổng `DEPOSIT_REFUND` và `CHECKOUT_REFUND` SUCCEEDED trong kỳ, gồm cả hoàn chênh lệch khi đổi lịch |
| OPEN-17 | BR-122, BR-21, BR-24 | Cọc mất của đơn = `deposit_paid` của đơn CANCELLED/NO_SHOW có `deposit_forfeited = TRUE`, tính theo `cancelled_at` / `no_show_at`; CSDL chặn cờ ở trạng thái khác |
| OPEN-18 | BR-102, BR-61, BR-120 | Xóa phòng là xóa mềm; phòng `deleted` không tính nguồn cung và báo cáo; số phòng được dùng lại; xóa cứng chỉ cho phòng AVAILABLE chưa từng dùng (để xóa được loại phòng) |

## 6. Hạn chế đã biết

- `NUMERIC(n,2)` làm tròn ngầm giá trị có hơn 2 chữ số thập phân (BR-44, BR-88). Việc từ chối thuộc domain.
- Khoảng chiếm so theo giờ địa phương, giả định mọi đơn cùng múi giờ Asia/Ho_Chi_Minh (BR-06); Việt Nam không có giờ mùa hè.
- CSDL không chứng minh được nhiệm vụ dọn phòng đã qua IN_PROGRESS trước DONE, vì SRS không có cột thời điểm bắt đầu.
- Hai voucher seed có hạn tới 31/12/2026 đúng theo Phụ lục BR; demo sau mốc này sẽ thấy voucher hết hạn.
- Chưa có bảng lịch sử Flyway trên DB đã dựng bằng psql: khi đưa Flyway vào, dựng lại schema hoặc dùng `baselineOnMigrate`.
