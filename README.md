# Hotel Management System (HMS)

Hệ thống Quản lý Khách sạn Chuẩn hóa Kiến trúc Doanh nghiệp (Enterprise Hotel Management System) xây dựng theo mô hình SPA (Single Page Application) hiện đại với **React 18 + Vite + TypeScript**.

Dự án được thiết kế chuẩn mực theo mô hình tách biệt Front-End & Back-End, tuân thủ nghiêm ngặt **7 Module chức năng SRS (F01 - F07)**, **Đặc tả Quy tắc nghiệp vụ Business Rules v1.2**, hợp đồng giao tiếp **OpenAPI 3.0** và kế hoạch kiểm thử theo chuẩn **IEEE 29119**.

---

## 🏛 Cấu trúc Thư mục Tổng thể (Full-Stack HMS)

```text
HMS/
├── .github/
│   └── workflows/
│       ├── db-constraints-ci.yml                    # Chạy V1 + V2 + db/test/test_constraints.sql (219 case, ON_ERROR_STOP) trên PostgreSQL 17
│       ├── backend-ci.yml                           # Maven verify (backend/), PITest mutation (≥90% branch), Testcontainers, br_coverage.py
│       ├── frontend-ci.yml                          # TypeScript typecheck, ESLint, Vitest và build Vite (frontend/)
│       └── e2e-ci.yml                               # Dựng Docker Compose full-stack và chạy Playwright E2E
│
├── docker-compose.yml                               # Khởi chạy đồng bộ PostgreSQL 17 + Backend Spring Boot + Frontend
├── AGENTS.md                                        # Quy ước làm việc và phân quyền sửa thư mục trong nhóm
├── .gitignore
├── README.md
│
├── docs/                                            # TÀI LIỆU ĐẶC TẢ & HỢP ĐỒNG API
│   ├── TEAM12_SRS.docx                              # Đặc tả yêu cầu phần mềm (UC-01 -> UC-13, Data Dictionary 15 bảng)
│   ├── BR_v1.2.md                                   # Đặc tả quy tắc nghiệp vụ (BR-01 -> BR-124) & Phụ lục Seed Data
│   ├── OPEN_ITEMS.md                                # Nhật ký chốt các điểm mở (OPEN-01 -> OPEN-18)
│   ├── Test_Plan_HMS.md                             # Kế hoạch kiểm thử theo chuẩn IEEE 29119 & RTM
│   └── api-contract/
│       └── openapi.yaml                             # Hợp đồng REST JSON, header Idempotency-Key & mã lỗi 400/401/403/409/422/502
│
├── db/                                              # TẦNG CSDL POSTGRESQL V2 (15 bảng theo SRS 4.3, PK UUID)
│   ├── HMS_DB_Schema.md                             # Tài liệu ERD v2 & bảng truy vết BR -> Constraint
│   ├── DB_REPORT.md                                 # Đối chiếu SRS 4.3 ↔ cột vật lý, kết quả 219/219 case trên Neon (PostgreSQL 17)
│   ├── migration/
│   │   ├── V1__init_schema.sql                      # 15 bảng snake_case, PK UUID, 133 ràng buộc có tên (btree_gist, EXCLUDE)
│   └── test/
│       └── test_constraints.sql                     # 219 case, mỗi case bị chặn phải đúng tên ràng buộc / SQLSTATE
│   └── original_v1/                                 # Bản schema v1 gốc lưu đối chiếu
│
├── tools/                                           # CÔNG CỤ ĐO LƯỜNG V&V
│   └── br_coverage.py                               # Script quét backend/src/ kiểm tra độ phủ BR-01 -> BR-124
│
├── backend/                                         # TẦNG MÁY CHỦ (JAVA 17 + SPRING BOOT 3 + MAVEN - CHỈNH THEO DB V2)
│   ├── pom.xml                                      # Spring Web, Data JPA, Flyway, PostgreSQL, BCrypt, JUnit 5, PITest, Testcontainers
│   ├── Dockerfile
│   └── src/
│       ├── main/
│       │   ├── java/com/team12/hms/
│       │   │   ├── HmsApplication.java
│       │   │   │
│       │   │   ├── domain/                          # LỚP DOMAIN THUẦN (Không phụ thuộc Spring/JPA -> Unit & Mutation Test)
│       │   │   │   ├── common/
│       │   │   │   │   ├── ClockProvider.java       # Giờ nghiệp vụ Asia/Ho_Chi_Minh (BR-06), cắt microsecond khớp TIMESTAMPTZ
│       │   │   │   │   ├── MoneyUtils.java          # BigDecimal HALF_UP về 1 VNĐ đúng 1 lần/dòng (BR-50, BR-53)
│       │   │   │   │   └── DomainExceptions.java    # RoomNotAvailableException, IllegalStateTransitionException, InvalidVoucherException
│       │   │   │   ├── auth/                        # [F01]
│       │   │   │   │   ├── Role.java                # ADMIN, MANAGER, RECEPTIONIST, HOUSEKEEPER
│       │   │   │   │   ├── User.java                # Khóa 15 phút sau 5 lần sai (BR-71), quản lý tài khoản (BR-93, BR-94)
│       │   │   │   │   ├── AuthToken.java           # TTL chính xác 30 phút từ issued_at khớp ck_token_ttl (BR-72, BR-73)
│       │   │   │   │   ├── PasswordValidator.java   # 8..64 code point Unicode NFC, không trim (BR-70)
│       │   │   │   │   └── AuthorizationPolicy.java # Hàm thuần Decision Table ma trận 4 vai trò (BR-75, BR-79, BR-124)
│       │   │   │   ├── room/                        # [F02]
│       │   │   │   │   ├── RoomStatus.java          # AVAILABLE, RESERVED, OCCUPIED, CLEANING, OUT_OF_SERVICE
│       │   │   │   │   ├── RoomType.java            # maxCapacity 1..6, baseNightlyRate 1..100M (BR-101, BR-103)
│       │   │   │   │   └── Room.java                # Ma trận BR-65; trim maintenance_reason & gán NULL khi về AVAILABLE (BR-104)
│       │   │   │   ├── reservation/                 # [F03]
│       │   │   │   │   ├── BookingType.java         # NIGHTLY, HOURLY (BR-05)
│       │   │   │   │   ├── ReservationStatus.java   # CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED, NO_SHOW (BR-66)
│       │   │   │   │   ├── GuestInfo.java           # Trim & validate tên 1..100, SĐT 9..11 số, email (BR-09, BR-27)
│       │   │   │   │   ├── PricingSnapshot.java     # Chốt giá đêm, đêm lễ, voucher, tỷ lệ cọc/phí/VAT (BR-55)
│       │   │   │   │   ├── Reservation.java         # Vòng đời, cập nhật deposit_paid & deposit_forfeited theo OPEN-17 (BR-21..27)
│       │   │   │   │   ├── DateRangeValidator.java  # validateNightly (BR-03, BR-62), validateHourly (BR-04, BR-07)
│       │   │   │   │   ├── RoomAvailabilityChecker.java # Quét nhu cầu từng đêm/khung giờ theo loại phòng (BR-60, BR-61, BR-63)
│       │   │   │   │   └── CancellationPolicy.java  # Tính H & mức hoàn cọc 100% / 50% / 0% (BR-21, BR-22)
│       │   │   │   ├── billing/                     # [F05]
│       │   │   │   │   ├── Voucher.java             # PERCENT/FIXED + kiểm scale <= 2 (BR-40, BR-44)
│       │   │   │   │   ├── DiscountSelector.java    # Max(Voucher, VIP), hòa lấy VIP, trần tại roomCharge (BR-41..43)
│       │   │   │   │   ├── SurchargeCalculator.java # Early BR-10, Late BR-11, ExtraPerson BR-30..32, Holiday BR-33
│       │   │   │   │   ├── BillingService.java      # calculateInvoice 11 bước BR-50, calcDeposit BR-20
│       │   │   │   │   ├── Invoice.java             # Bất biến sau ISSUED khớp trg_invoice_immutable (BR-54)
│       │   │   │   │   └── PaymentTransaction.java  # DEPOSIT_CHARGE/REFUND, CHECKOUT_CHARGE/REFUND (BR-26, BR-84..86)
│       │   │   │   ├── servicehk/                   # [F06]
│       │   │   │   │   ├── ServiceCatalogItem.java  # MINIBAR/LAUNDRY, active/inactive (BR-110)
│       │   │   │   │   ├── ServiceChargeLine.java   # MINIBAR/LAUNDRY/DAMAGE (trim damage_note 1..200) (BR-34..37)
│       │   │   │   │   ├── CleaningTaskStatus.java  # PENDING, IN_PROGRESS, DONE, CANCELLED
│       │   │   │   │   └── CleaningTask.java        # Cấm nhảy cóc PENDING -> DONE & kiểm quyền sở hữu (BR-111..114)
│       │   │   │   └── config/                      # [UC-03] Cấu hình toàn cục
│       │   │   │       ├── SystemConfig.java        # Kiểm scale <= 2 cho tỷ lệ cọc/phí/VAT (BR-88)
│       │   │   │       └── HolidayCalendar.java     # Ngày lễ dương lịch cố định, chặn 02-29 (BR-89)
│       │   │   │
│       │   │   ├── application/                     # TẦNG ĐIỀU PHỐI USE CASE, LOCK & GIAO DỊCH
│       │   │   │   ├── port/                        # Interfaces Port-Adapter (khớp Class Diagram SRS 4.2)
│       │   │   │   │   ├── PaymentGatewayPort.java  # charge / refund (Mockable)
│       │   │   │   │   ├── IdempotencyStorePort.java# Ghi tạm status=102 ở bước 2 -> 200/201 ở bước 4 khớp DB v2 (BR-90, BR-91)
│       │   │   │   │   └── RepositoryPorts...       # Ports cho 15 bảng dữ liệu
│       │   │   │   └── service/
│       │   │   │       ├── AuthAppService.java      # [F01] Login atomic counter (BR-78), logout, CRUD user & bảo vệ Admin cuối (BR-93, BR-94)
│       │   │   │       ├── SystemConfigAppService.java # [UC-03] Tham số, ngày lễ, danh mục dịch vụ (BR-88, BR-89, BR-110)
│       │   │   │       ├── RoomAppService.java      # [F02] Xóa mềm phòng; dọn cứng phòng deleted=TRUE trước khi xóa loại phòng (BR-102, OPEN-18)
│       │   │   │       ├── VoucherAppService.java   # [UC-05] Quản lý voucher (BR-44)
│       │   │   │       ├── ReservationAppService.java # [F03] SELECT FOR UPDATE room_types (BR-64/92), gán trước 1-1 (BR-08), đổi lịch, hủy, no-show
│       │   │   │       ├── CheckInOutAppService.java# [F04/F05] Check-in (optimistic lock BR-82), số dư tạm tính BR-87, check-out 4 bước BR-91
│       │   │   │       ├── ServiceChargeAppService.java # [F06] Ghi minibar, giặt ủi, hư hao vào đơn CHECKED_IN (BR-34..37)
│       │   │   │       ├── CleaningTaskAppService.java  # [F06] Giao việc cho HOUSEKEEPER active, nhận & hoàn thành nguyên tử (BR-111..114)
│       │   │   │       └── ReportAppService.java    # [F07] Doanh thu (actual_check_out_time), tiền hoàn (OPEN-16), cọc mất (OPEN-17), chặn Lễ tân (BR-120..124)
│       │   │   │
│       │   │   ├── infrastructure/                  # TẦNG HẠ TẦNG (JPA, POSTGRES, MOCK GATEWAY, AUDIT LOG)
│       │   │   │   ├── persistence/
│       │   │   │   │   ├── entity/                  # 15 JPA Entity ánh xạ 1-1 cột snake_case của V1__init_schema.sql
│       │   │   │   │   └── repository/              # Spring Data JPA + Native query FOR UPDATE & hàm GiST reservation_occupancy()
│       │   │   │   ├── gateway/
│       │   │   │   │   └── MockPaymentGatewayAdapter.java # Giả lập thu/hoàn & chế độ lỗi để test BR-26, BR-84, BR-91
│       │   │   │   ├── security/
│       │   │   │   │   ├── TokenAuthFilter.java     # Đúng thứ tự BR-77: (1) 401 -> (2) 403 -> (3) 400/409/422; tra bảng auth_tokens
│       │   │   │   │   ├── RbacInterceptor.java     # Áp AuthorizationPolicy cho mọi endpoint
│       │   │   │   │   └── PasswordEncoderAdapter.java # BCrypt khớp pgcrypto $2a$10$ của V2__seed_data.sql (BR-76)
│       │   │   │   ├── idempotency/
│       │   │   │   │   └── IdempotencyService.java  # SHA-256 hex (64 ký tự thường), chốt locked_timestamp, kiểm 24h (BR-90, BR-91)
│       │   │   │   ├── time/
│       │   │   │   │   └── SystemClockProvider.java # ZoneId Asia/Ho_Chi_Minh (BR-06)
│       │   │   │   ├── audit/
│       │   │   │   │   └── AuditLogger.java         # Structured JSON Audit Log cho admin/role/maintenance (SRS 5.4, không thêm bảng DB)
│       │   │   │   └── scheduler/
│       │   │   │       └── NoShowBatchScheduler.java# Quét đơn quá mốc 12:00 hôm sau / +1h HOURLY (BR-24)
│       │   │   │
│       │   │   └── web/                             # TẦNG REST API (CONTROLLERS + DTO + ERROR HANDLER)
│       │   │       ├── advice/
│       │   │       │   └── GlobalExceptionHandler.java # Chuẩn hóa JSON lỗi 400/401/403/409/422/502
│       │   │       ├── dto/                         # Request/Response Java Records cho 7 module
│       │   │       └── controller/
│       │   │           ├── AuthController.java      # [F01] /api/auth/**, /api/users/**
│       │   │           ├── SystemConfigController.java # [UC-03] /api/config/**, /api/holidays/**, /api/service-catalog/**
│       │   │           ├── RoomController.java      # [F02] /api/room-types/**, /api/rooms/**
│       │   │           ├── VoucherController.java   # [UC-05] /api/vouchers/**
│       │   │           ├── ReservationController.java # [F03] /api/reservations/**
│       │   │           ├── CheckInOutController.java# [F04/F05] /api/reservations/{id}/check-in|check-out|balance, /api/invoices/**
│       │   │           ├── ServiceHkController.java # [F06] /api/reservations/{id}/services, /api/cleaning-tasks/**
│       │   │           └── ReportController.java    # [F07] /api/dashboard/**, /api/reports/**
│       │   │
│       │   └── resources/
│       │       ├── application.yml                  # Cấu hình chung, timezone Asia/Ho_Chi_Minh, bật Flyway
│       │       ├── application-dev.yml              # Kết nối DB dev + seed
│       │       ├── application-test.yml             # Cấu hình Testcontainers
│       │       └── db/migration/                    # Copy nguyên trạng từ db/migration/ cho Flyway
│       │           ├── V1__init_schema.sql
│       │           └── V2__seed_data.sql
│       │
│       └── test/
│           └── java/com/team12/hms/
│               ├── domain/                          # Unit Test thuần (EP, BVA, Decision Table, State Transition, 5 ví dụ A..E)
│               ├── integration/                     # Testcontainers Postgres 17: API RBAC (BR-77), Fault Injection 4 bước (BR-91)
│               └── concurrency/                     # CyclicBarrier/CountDownLatch N+1 luồng × 100 lần (BR-64, BR-78, BR-82, BR-92, BR-114)
│
├── frontend/                                        # TẦNG GIAO DIỆN (REACT 18 + VITE + TYPESCRIPT)
│   ├── Dockerfile
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/                                     # Tầng giao tiếp REST API (Chuyển đổi linh hoạt Mock <-> BE thật)
│   │   │   ├── axiosClient.ts                       # Base URL, opaque Bearer Token, bắt lỗi chuẩn 401/403/409/422
│   │   │   ├── idempotencyHelper.ts                 # Sinh UUID v4 gắn 'Idempotency-Key' & giữ nguyên key khi retry (BR-90, BR-91)
│   │   │   └── services/                            # 9 service tương ứng Controllers BE
│   │   │       ├── auth.service.ts                  # [F01] Login/Logout & Quản lý tài khoản
│   │   │       ├── config.service.ts                # [UC-03] SystemConfig, Holidays, ServiceCatalog
│   │   │       ├── room.service.ts                  # [F02] RoomTypes, Rooms, Maintenance (OUT_OF_SERVICE)
│   │   │       ├── voucher.service.ts               # [UC-05] Quản lý Voucher PERCENT/FIXED
│   │   │       ├── reservation.service.ts           # [F03] Search, Create (NIGHTLY/HOURLY), UpdateGuest, Reschedule, Cancel, PreAssign
│   │   │       ├── stay.service.ts                  # [F04] Check-in, Interim Balance (BR-87), Check-out
│   │   │       ├── billing.service.ts               # [F05] Invoice List/Detail & Payment Transactions
│   │   │       ├── serviceHk.service.ts             # [F06] Incidental Charges (Minibar/Laundry/Damage) & Cleaning Tasks
│   │   │       └── report.service.ts                # [F07] Executive Reports & Operational Today Dashboard
│   │   │
│   │   ├── mocks/                                   # Giả lập full luồng khi chưa nối BE
│   │   │   ├── mockDb.ts                            # Lưu 15 tập dữ liệu khớp lược đồ DB v2 vào localStorage
│   │   │   ├── seedData.ts                          # Đúng Phụ lục BR v1.2: 5 users, 6 phòng (101-301), 4 ngày lễ, 6 dịch vụ, 2 voucher
│   │   │   └── mockHandlers.ts                      # Giả lập BR-01 -> BR-124, kiểm Idempotency-Key & bật/tắt lỗi Mock Gateway
│   │   │
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── router.tsx                           # Routes cho 7 module + phân quyền 4 Roles (ADMIN, MANAGER, RECEPTIONIST, HOUSEKEEPER)
│   │   │   └── providers/
│   │   │       ├── AuthProvider.tsx                 # Quản lý phiên 30 phút (BR-72), tự đăng xuất khi nhận 401
│   │   │       └── QueryProvider.tsx                # TanStack Query đồng bộ trạng thái phòng & nhiệm vụ dọn
│   │   │
│   │   ├── components/                              # Thành phần giao diện dùng chung
│   │   │   ├── guards/
│   │   │   │   ├── ProtectedRoute.tsx               # Chặn chưa đăng nhập -> /login
│   │   │   │   └── RoleGate.tsx                     # Phân quyền 4 mức: Có / Xem (chỉ đọc) / Hạn chế / Không (BR-79, BR-124)
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   ├── Sidebar.tsx                      # Menu điều hướng tự lọc theo 4 vai trò
│   │   │   │   └── Navbar.tsx
│   │   │   └── common/
│   │   │       ├── StatusBadge.tsx                  # Đủ nhãn: Room (5), Reservation (5), CleaningTask (4)
│   │   │       ├── CurrencyDisplay.tsx              # Định dạng tiền VNĐ nguyên chuẩn
│   │   │       ├── DataTable.tsx                    # Bảng tìm kiếm, lọc, phân trang
│   │   │       ├── ConfirmModal.tsx                 # Hộp thoại xác nhận thao tác
│   │   │       └── ErrorBanner.tsx                  # Hiển thị rõ lỗi nghiệp vụ 409 / 422 từ BE
│   │   │
│   │   ├── features/                                # 7 MODULE CHỨC NĂNG BÁM SÁT SRS (F01 -> F07)
│   │   │   ├── f01-auth/                            # [F01] Authentication, Accounts & System Settings
│   │   │   │   ├── pages/
│   │   │   │   │   ├── LoginPage.tsx                # Cảnh báo khóa 15 phút sau 5 lần sai (BR-71) & tài khoản vô hiệu hóa
│   │   │   │   │   ├── UserManagementPage.tsx       # Chỉ ADMIN: tạo, đổi role, reset pass, vô hiệu hóa/kích hoạt (BR-93, BR-94)
│   │   │   │   │   ├── SystemSettingsPage.tsx       # [UC-03] Tham số 30/5/10, Ngày lễ, Danh mục dịch vụ (ADMIN sửa; MANAGER/Lễ tân xem)
│   │   │   │   │   └── Forbidden403Page.tsx         # Báo lỗi khi truy cập URL trái quyền
│   │   │   │   └── components/
│   │   │   │       ├── UserFormModal.tsx
│   │   │   │       ├── HolidayModal.tsx
│   │   │   │       └── ServiceCatalogModal.tsx
│   │   │   │
│   │   │   ├── f02-rooms/                           # [F02] Room & RoomType Management
│   │   │   │   ├── pages/
│   │   │   │   │   └── RoomCatalogPage.tsx          # Tab Phòng (sơ đồ + danh sách) & Tab Loại phòng/Giá
│   │   │   │   └── components/
│   │   │   │       ├── RoomDiagramGrid.tsx          # Sơ đồ 5 trạng thái: AVAILABLE, RESERVED, OCCUPIED, CLEANING, OUT_OF_SERVICE
│   │   │   │       ├── RoomFormModal.tsx            # Thêm/Đổi loại/Xóa mềm phòng, không gửi trường status (BR-100, BR-102)
│   │   │   │       ├── RoomTypeFormModal.tsx        # Disable giá đêm với ADMIN (BR-101); kiểm giảm maxCapacity (BR-103)
│   │   │   │       └── MaintenanceModal.tsx         # Đặt OUT_OF_SERVICE (lý do 1..200 ký tự) & Trả về AVAILABLE (BR-69, BR-104)
│   │   │   │
│   │   │   ├── f03-reservations/                    # [F03] Reservation Management (MANAGER & RECEPTIONIST)
│   │   │   │   ├── pages/
│   │   │   │   │   └── ReservationListPage.tsx      # Tra cứu, lọc 5 trạng thái & thao tác vòng đời đơn
│   │   │   │   └── components/
│   │   │   │       ├── BookingForm.tsx              # Tách chế độ NIGHTLY (1-30 đêm) & HOURLY (06:00-22:00, 1-10h, ≤24:00), khách, VIP, voucher, cọc
│   │   │   │       ├── RoomAvailabilityPicker.tsx   # Kiểm nguồn cung theo loại phòng & khoảng [start, end) (BR-60, BR-61)
│   │   │   │       ├── UpdateGuestModal.tsx         # Sửa tên/SĐT/email cho CONFIRMED hoặc CHECKED_IN (BR-09, BR-27)
│   │   │   │       ├── RescheduleModal.tsx          # Đổi lịch nguyên tử NIGHTLY khi H ≥ 24, chênh lệch cọc & kiểm lại voucher (BR-25)
│   │   │   │       ├── CancelBookingModal.tsx       # Tính trước mức hoàn cọc theo H (100% / 50% / 0%) (BR-21, BR-22)
│   │   │   │       └── PreAssignRoomModal.tsx       # Gán trước / Bỏ gán phòng cho đơn CONFIRMED (BR-08)
│   │   │   │
│   │   │   ├── f04-check-in-out/                    # [F04] Check-in / Check-out (MANAGER & RECEPTIONIST)
│   │   │   │   ├── pages/
│   │   │   │   │   └── FrontDeskOperationPage.tsx   # Bàn làm việc Lễ tân (Nhận/Trả phòng trong ngày)
│   │   │   │   └── components/
│   │   │   │       ├── CheckInModal.tsx             # Chọn phòng cùng loại, cảnh báo phụ thu check-in sớm (BR-10, BR-80, BR-81)
│   │   │   │       └── CheckOutModal.tsx            # Bảng kê 11 bước, phụ thu trễ (BR-11), 3 nhánh amountDue (>0, =0, <0), phòng -> CLEANING (BR-83..85)
│   │   │   │
│   │   │   ├── f05-billing/                         # [F05] Billing, Payment & Vouchers
│   │   │   │   ├── pages/
│   │   │   │   │   ├── InvoiceListPage.tsx          # Danh sách hóa đơn ISSUED
│   │   │   │   │   ├── InvoiceDetailPage.tsx        # Chi tiết 11 dòng tính tiền bất biến (BR-50, BR-54)
│   │   │   │   │   └── VoucherManagementPage.tsx    # [UC-05] Chỉ MANAGER tạo/sửa; ADMIN & RECEPTIONIST xem (BR-44, BR-79)
│   │   │   │   └── components/
│   │   │   │       ├── InterimBalanceDrawer.tsx     # Xem số dư tạm tính của đơn CHECKED_IN (BR-87)
│   │   │   │       ├── PaymentModal.tsx             # Thanh toán 1 lần đúng bằng amountDue, xử lý hoàn tiền, gắn Idempotency-Key (BR-84..86, BR-90)
│   │   │   │       ├── VoucherFormModal.tsx         # Validate PERCENT/FIXED & maxDiscount (BR-44)
│   │   │   │       └── InvoicePrintView.tsx         # Giao diện in / xuất hóa đơn cho khách
│   │   │   │
│   │   │   ├── f06-service-housekeeping/            # [F06] Service & Housekeeping Management
│   │   │   │   ├── pages/
│   │   │   │   │   ├── HousekeepingBoardPage.tsx    # Quản lý theo CleaningTask: Lễ tân/Quản lý giao việc (UC-11); HOUSEKEEPER thực thi (UC-13)
│   │   │   │   │   └── RoomServiceOrderPage.tsx     # Ghi Minibar/Laundry (1..99) & Hư hao DAMAGE (1..50M + ghi chú) vào đơn CHECKED_IN (BR-34..37)
│   │   │   │   └── components/
│   │   │   │       ├── AssignHousekeeperModal.tsx   # Giao/giao lại cho tài khoản HOUSEKEEPER đang active (BR-113)
│   │   │   │       └── CleanConfirmButton.tsx       # Chuyển 2 bước tuần tự: PENDING -> IN_PROGRESS -> DONE (phòng CLEANING -> AVAILABLE) (BR-112)
│   │   │   │
│   │   │   └── f07-reports/                         # [F07] Dashboard & Reports
│   │   │       ├── pages/
│   │   │       │   ├── ExecutiveDashboardPage.tsx   # ADMIN & MANAGER: 5 trạng thái phòng, kỳ ≤ 366 ngày, Doanh thu / Tiền hoàn / Cọc mất (BR-120..123)
│   │   │       │   └── ShiftAllocationBoard.tsx     # RECEPTIONIST: tình trạng phòng + vận hành HÔM NAY (đến/đi/hủy), chặn doanh thu (BR-124)
│   │   │       └── components/
│   │   │           └── RevenueChart.tsx
│   │   │
│   │   ├── utils/                                   # Hàm xử lý logic thuần (dễ viết Unit Test Vitest)
│   │   │   ├── invoiceCalculator.ts                 # Công thức 11 bước BR-50, làm tròn HALF_UP từng dòng 1 lần (BR-53)
│   │   │   ├── dateValidation.ts                    # Validate NIGHTLY, HOURLY, GuestInfo & sức chứa theo loại phòng
│   │   │   ├── timezone.ts                          # Chuẩn hóa múi giờ Asia/Ho_Chi_Minh UTC+7 (BR-06)
│   │   │   └── formatters.ts                        # Định dạng tiền VNĐ & ngày giờ Việt Nam
│   │   │
│   │   ├── types/                                   # TypeScript Interfaces & Enums khớp 1-1 với OpenAPI & DB v2
│   │   │   ├── rbac.types.ts                        # 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'HOUSEKEEPER'
│   │   │   ├── config.types.ts                      # SystemConfig, Holiday, ServiceCatalogItem
│   │   │   ├── room.types.ts                        # RoomType, Room, RoomStatus (5 trạng thái)
│   │   │   ├── reservation.types.ts                 # BookingType, ReservationStatus, PricingSnapshot, GuestInfo
│   │   │   ├── billing.types.ts                     # Voucher, Invoice (11 dòng), PaymentTransaction, InterimBalance
│   │   │   ├── serviceHk.types.ts                   # ServiceChargeLine (MINIBAR/LAUNDRY/DAMAGE), CleaningTask (4 trạng thái)
│   │   │   └── report.types.ts                      # RoomStatusCounts, PeriodReport, DailyOperationalSummary
│   │   │
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .env.example                                 # VITE_USE_MOCK=true | VITE_API_BASE_URL=http://localhost:8080/api
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── e2e-tests/                                       # KIỂM THỬ GIAO DIỆN & LUỒNG NGHIỆP VỤ (PLAYWRIGHT)
    └── playwright/
        ├── ts01-auth-rbac.spec.ts                   # Ma trận phân quyền 4 Roles, khóa 5 lần sai, 401/403
        ├── ts02-room-config.spec.ts                 # Cấu hình hệ thống, Admin bị chặn sửa giá phòng, bảo trì OUT_OF_SERVICE
        ├── ts03-booking-flow.spec.ts                # Đặt NIGHTLY/HOURLY -> Đổi lịch -> Check-in -> Dịch vụ/Hư hao -> Check-out -> Dọn phòng
        ├── ts04-billing-bva.spec.ts                 # 5 ví dụ tính tiền A..E, 3 nhánh amountDue, chặn double-payment
        └── ts05-reports-scope.spec.ts               # Báo cáo kỳ ≤ 366 ngày, tách tiền hoàn/cọc mất, giới hạn Lễ tân
```
│   │   │   │   └── components/
│   │   │   │       ├── PaymentModal.tsx     # Idempotency-Key UUID v4, chống nhấn đúp, 3 nhánh
│   │   │   │       └── InvoicePrintView.tsx # Bản in hóa đơn VAT hợp chuẩn
│   │   │   │
│   │   │   ├── f06-service-housekeeping/    # [F06] Service & Housekeeping Management
│   │   │   │   ├── pages/
│   │   │   │   │   ├── HousekeepingBoardPage.tsx # Điều phối 2 bước: PENDING -> IN_PROGRESS -> DONE (BR-112)
│   │   │   │   │   └── RoomServiceOrderPage.tsx  # Minibar, Giặt ủi & Bồi thường Hư hao DAMAGE (BR-36)
│   │   │   │   └── components/
│   │   │   │       └── CleanConfirmButton.tsx
│   │   │   │
│   │   │   └── f07-reports/                 # [F07] Dashboard & Reports
│   │   │       ├── pages/
│   │   │       │   ├── ExecutiveDashboardPage.tsx # Báo cáo doanh thu kỳ T (ADMIN & MANAGER)
│   │   │       │   └── ShiftAllocationBoard.tsx   # Phân bổ phòng ca trực cho Lễ tân
│   │   │       └── components/
│   │   │           └── RevenueChart.tsx
│   │   │
│   │   ├── utils/                           # Hàm xử lý logic thuần (Pure Functions)
│   │   │   ├── invoiceCalculator.ts         # Công thức chuẩn 11 bước BR-50
│   │   │   ├── dateValidation.ts            # Kiểm tra biên Nightly, Hourly (BR-04), phụ thu, hoàn cọc
│   │   │   └── formatters.ts                # Định dạng tiền VNĐ & ngày giờ Việt Nam
│   │   │
│   │   ├── types/                           # TypeScript Interfaces & Enums chuẩn BR v1.2
│   │   │   ├── rbac.types.ts                # 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'HOUSEKEEPER'
│   │   │   ├── room.types.ts                # 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'CLEANING' | 'OUT_OF_SERVICE'
│   │   │   ├── reservation.types.ts         # Nightly / Hourly, thông tin khách, hoàn cọc, lịch
│   │   │   ├── billing.types.ts             # 11-step Invoice, Payment 3 nhánh, Voucher
│   │   │   └── systemConfig.types.ts        # Cấu hình VAT, cọc, ngày lễ, phụ thu
│   │   │
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .env.example                         # VITE_USE_MOCK=true | VITE_API_BASE_URL=http://localhost:8080
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── e2e-tests/                               # KIỂM THỬ GIAO DIỆN & LUỒNG NGHIỆP VỤ (PLAYWRIGHT)
│   └── playwright/
│       ├── ts01-auth-rbac.spec.ts           # Test ma trận phân quyền UI & URL 403 của 4 Roles (5 users)
│       ├── ts02-booking-flow.spec.ts        # Test luồng Đặt phòng (Nightly/Hourly) -> Check-in -> Dịch vụ/Hư hao -> Check-out -> Dọn phòng 2 bước
│       └── ts04-billing-bva.spec.ts         # Test giá trị biên chiết khấu, Idempotency-Key và thanh toán 3 nhánh
│
└── README.md
```

---

## 👥 Ma trận 5 Tài khoản Test Oracle & Phân quyền (RBAC)

| Username | Vai trò (Role) | Mật khẩu | Quyền hạn chính (Khớp Test Oracle BE & DB) |
| :--- | :--- | :--- | :--- |
| `admin01` | **ADMIN** | `Hotel@2026` | Toàn quyền quản trị, Quản lý Người dùng ([F01]), Cấu hình Tham số Hệ thống (`/system-settings`), xem Báo cáo. *Chỉ xem giá/voucher, không trực tiếp sửa giá phòng*. |
| `quanly01` | **MANAGER** | `Hotel@2026` | Duy nhất có quyền sửa đơn giá phòng ([F02] - BR-75) & quản lý Voucher ([F05]); duyệt đơn đặt, hủy đơn đặc biệt, xem báo cáo doanh thu kỳ T ([F07]). |
| `letan01` | **RECEPTIONIST** | `Hotel@2026` | Đặt phòng Nightly & Hourly ([F03]), Đổi lịch / Hủy đơn hoàn cọc / Sửa thông tin khách / Gán phòng trước, Check-in, Tra cứu số dư tạm tính, Check-out 3 nhánh (>0, =0, <0) ([F04]), lập hóa đơn & thu tiền ([F05]), phân bổ ca trực ([F07]). |
| `donphong01` | **HOUSEKEEPER** | `Hotel@2026` | Tiếp nhận nhiệm vụ dọn phòng (`PENDING` -> `IN_PROGRESS`), ghi chú vật tư, xác nhận dọn xong (`DONE`) đưa phòng `CLEANING` về `AVAILABLE` ([F06] - BR-112). |
| `donphong02` | **HOUSEKEEPER** | `Hotel@2026` | Nhân viên buồng phòng ca phối hợp, thực hiện nhiệm vụ dọn phòng và phối hợp ghi nhận bồi thường hư hại đồ dùng ([F06]). |

---

## 🏨 Danh mục 6 Phòng Chuẩn Hóa Khớp Test Oracle

| Mã phòng | Tầng | Loại phòng | Sức chứa tối đa | Đơn vị tính | Đơn giá niêm yết (VNĐ) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **101** | Tầng 1 | `STANDARD` | 2 người | Đêm / Giờ | **600.000** |
| **102** | Tầng 1 | `STANDARD` | 2 người | Đêm / Giờ | **600.000** |
| **103** | Tầng 1 | `STANDARD` | 2 người | Đêm / Giờ | **600.000** |
| **201** | Tầng 2 | `DELUXE` | 3 người | Đêm / Giờ | **1.000.000** |
| **202** | Tầng 2 | `DELUXE` | 3 người | Đêm / Giờ | **1.000.000** |
| **301** | Tầng 3 | `SUITE` | 4 người | Đêm / Giờ | **1.800.000** |

---

## ⚡ Hướng dẫn Khởi chạy Nhanh (Quick Start)

### 1. Cài đặt Dependencies
```bash
cd frontend
pnpm install
```

### 2. Thiết lập Biến môi trường
Mặc định hệ thống đã kích hoạt chế độ **Mock Database** lưu trữ trên `localStorage`, chạy độc lập hoàn chỉnh mọi quy tắc nghiệp vụ mà không cần chờ Backend:
```bash
cp .env.example .env
```
*(Nội dung file: `VITE_USE_MOCK=true`)*

### 3. Khởi chạy Ứng dụng
```bash
pnpm run dev
```
Truy cập: `http://localhost:5173` (Nhấp chọn nhanh 1 trong 5 tài khoản mẫu tại màn hình đăng nhập).

### 4. Kiểm thử Tự động E2E (Playwright)
```bash
pnpm run test:e2e
```

---

## 🐳 Khởi Chạy Toàn Bộ Hệ Thống Với Docker Compose

Khởi chạy đồng bộ PostgreSQL 17 + Backend Spring Boot + Frontend:
```bash
docker compose up -d --build
```
- **PostgreSQL 17:** `localhost:5432` (database: `hms_db`, user: `hms_user`)
- **Backend API:** `http://localhost:8080/api`
- **Frontend SPA:** `http://localhost:5173`

---

## ☕ Khởi Chạy & Kiểm Thử Backend (Spring Boot 3 + Java 17)

```bash
cd backend

# 1. Biên dịch và kiểm tra chuẩn Clean Architecture
mvn clean compile

# 2. Chạy Unit Test miền nghiệp vụ thuần và đo Mutation Testing (PITest >= 90%)
mvn test-compile org.pitest:pitest-maven:mutationCoverage

# 3. Chạy Integration Test với Testcontainers (PostgreSQL 17)
mvn verify
```

---

## 🛠 Bộ Công Cụ Đo Lường V&V (Verification & Validation)

Quét toàn bộ mã nguồn kiểm tra độ phủ của 124 Quy tắc Nghiệp vụ (BR-01 -> BR-124):
```bash
python tools/br_coverage.py
```
