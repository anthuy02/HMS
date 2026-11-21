# Hotel Management System (HMS)

Hệ thống Quản lý Khách sạn Chuẩn hóa Kiến trúc Doanh nghiệp (Enterprise Hotel Management System) xây dựng theo mô hình SPA (Single Page Application) hiện đại với **React 18 + Vite + TypeScript**.

Dự án được thiết kế chuẩn mực theo mô hình tách biệt Front-End & Back-End, tuân thủ nghiêm ngặt **7 Module chức năng SRS (F01 - F07)**, **Đặc tả Quy tắc nghiệp vụ Business Rules v1.2**, hợp đồng giao tiếp **OpenAPI 3.0** và kế hoạch kiểm thử theo chuẩn **IEEE 29119**.

---

## 🏛 Cấu trúc Thư mục Tổng thể

```text
HMS/
├── .github/
│   └── workflows/
│       └── frontend-ci.yml                  # Kiểm tra TypeScript, ESLint và build thử Vite
│
├── docs/                                    # Tài liệu đặc tả & hợp đồng API chờ BE chốt stack
│   ├── SRS_Hotel_Management_System.md       # Đặc tả yêu cầu phần mềm chuẩn IEEE 830 (F01 -> F07)
│   ├── Business_Rules_v1.2.md               # Đặc tả quy tắc nghiệp vụ v1.2 (BR-01 -> BR-124)
│   ├── Test_Plan_HMS.md                     # Kế hoạch kiểm thử theo chuẩn IEEE 29119
│   └── api-contract/
│       └── openapi.yaml                     # Đặc tả chuẩn Request/Response JSON cho 7 modules
│
├── frontend/                                # TẦNG GIAO DIỆN (REACT 18 + VITE + TYPESCRIPT)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/                             # Tầng giao tiếp REST API (Chuyển đổi linh hoạt Mock <-> API thật)
│   │   │   ├── axiosClient.ts               # Cấu hình Base URL, đính kèm JWT Token, bắt lỗi 401/403
│   │   │   ├── idempotencyHelper.ts         # Sinh UUID v4 gắn header 'Idempotency-Key' khi thanh toán (BR06)
│   │   │   └── services/                    # 8 file service tương ứng các module SRS & cấu hình
│   │   │       ├── auth.service.ts          # [F01] Quản lý xác thực & tài khoản
│   │   │       ├── room.service.ts          # [F02] Quản lý phòng & giá phòng (Chỉ MANAGER sửa giá)
│   │   │       ├── reservation.service.ts   # [F03] Đặt phòng Nightly/Hourly, đổi lịch, hủy, sửa khách, gán trước
│   │   │       ├── stay.service.ts          # [F04] Check-in, Check-out 3 nhánh, số dư tạm tính
│   │   │       ├── billing.service.ts       # [F05] Bảng kê 11 bước BR-50, voucher, VAT 8/10%
│   │   │       ├── serviceHk.service.ts     # [F06] Minibar, Laundry, Damage & CleaningTask 2 bước
│   │   │       ├── report.service.ts        # [F07] Dashboard doanh thu, phân bổ ca trực
│   │   │       └── systemConfig.service.ts  # Quản trị tham số hệ thống (Chỉ ADMIN)
│   │   │
│   │   ├── mocks/                           # Dữ liệu giả lập chạy full luồng khi chưa có BE & DB
│   │   │   ├── mockDb.ts                    # Lưu trữ localStorage: rooms, reservations, tasks, invoices
│   │   │   ├── seedData.ts                  # 5 tài khoản test oracle, 6 phòng chuẩn, vật tư & dịch vụ
│   │   │   └── mockHandlers.ts              # Giả lập toàn bộ logic BR v1.2 (3 nhánh checkout, damage, hourly...)
│   │   │
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── router.tsx                   # Khai báo Routes cho 7 module kèm phân quyền 4 Roles
│   │   │   └── providers/
│   │   │       ├── AuthProvider.tsx         # Quản lý phiên đăng nhập & Role hiện hành
│   │   │       └── QueryProvider.tsx        # TanStack Query đồng bộ trạng thái phòng thời gian thực
│   │   │
│   │   ├── components/                      # Các thành phần giao diện dùng chung
│   │   │   ├── guards/
│   │   │   │   ├── ProtectedRoute.tsx       # Chặn chưa đăng nhập, điều hướng về /login
│   │   │   │   └── RoleGate.tsx             # Ẩn/hiện nút thao tác theo RBAC
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.tsx           # Khung giao diện chính
│   │   │   │   ├── Sidebar.tsx              # Menu điều hướng bám sát F01 -> F07 & Phân quyền
│   │   │   │   └── Navbar.tsx
│   │   │   └── common/
│   │   │       ├── StatusBadge.tsx          # 5 trạng thái phòng: AVAILABLE, RESERVED, OCCUPIED, CLEANING, OUT_OF_SERVICE
│   │   │       ├── CurrencyDisplay.tsx      # Định dạng tiền VNĐ chuẩn xác
│   │   │       ├── DataTable.tsx            # Bảng dữ liệu dùng chung (tìm kiếm, lọc, phân trang)
│   │   │       └── ConfirmModal.tsx         # Hộp thoại xác nhận thao tác
│   │   │
│   │   ├── features/                        # ĐÚNG 7 MODULE CHỨC NĂNG BÁM SÁT SRS (F01 -> F07)
│   │   │   ├── f01-auth/                    # [F01] Authentication & Authorization
│   │   │   │   ├── pages/
│   │   │   │   │   ├── LoginPage.tsx        # Đăng nhập nhanh 5 tài khoản oracle
│   │   │   │   │   ├── UserManagementPage.tsx # Chỉ mở cho ADMIN (AUTH_01)
│   │   │   │   │   ├── SystemSettingsPage.tsx # Cấu hình tham số hệ thống (Chỉ ADMIN)
│   │   │   │   │   └── Forbidden403Page.tsx # Báo lỗi khi truy cập URL trái quyền
│   │   │   │   └── components/
│   │   │   │       └── UserFormModal.tsx
│   │   │   │
│   │   │   ├── f02-rooms/                   # [F02] Room Management
│   │   │   │   ├── pages/
│   │   │   │   │   └── RoomCatalogPage.tsx  # Danh mục 6 phòng chuẩn hóa, sơ đồ 5 trạng thái
│   │   │   │   └── components/
│   │   │   │       ├── RoomFormModal.tsx    # Sửa giá phòng (CHỈ MANAGER - BR-75; ADMIN chỉ xem)
│   │   │   │       └── RoomDiagramGrid.tsx  # Sơ đồ trực quan 5 trạng thái theo tầng
│   │   │   │
│   │   │   ├── f03-reservations/            # [F03] Reservation Management
│   │   │   │   ├── pages/
│   │   │   │   │   └── ReservationListPage.tsx # Danh sách đơn, đổi lịch, hủy hoàn cọc, sửa khách, gán trước
│   │   │   │   └── components/
│   │   │   │       ├── BookingForm.tsx      # Form đặt phòng Nightly & Hourly (BR-04)
│   │   │   │       └── RoomAvailabilityPicker.tsx
│   │   │   │
│   │   │   ├── f04-check-in-out/            # [F04] Check-in / Check-out
│   │   │   │   ├── pages/
│   │   │   │   │   └── FrontDeskOperationPage.tsx # Bàn lễ tân, số dư tạm tính, 3 nhánh Check-out (>0, =0, <0)
│   │   │   │   └── components/
│   │   │   │       ├── CheckInModal.tsx     # Check-in -> OCCUPIED (BR03)
│   │   │   │       └── CheckOutModal.tsx    # Check-out -> CLEANING (BR04, BR-65)
│   │   │   │
│   │   │   ├── f05-billing/                 # [F05] Billing & Payment
│   │   │   │   ├── pages/
│   │   │   │   │   └── InvoiceDetailPage.tsx # Bảng kê 11 bước BR-50, voucher, VAT 8/10%
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
