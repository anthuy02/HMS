# Hotel Management System (HMS)

Hệ thống Quản lý Khách sạn Chuẩn hóa Kiến trúc Doanh nghiệp (Enterprise Hotel Management System) xây dựng theo mô hình SPA (Single Page Application) hiện đại với **React 18 + Vite + TypeScript**.

Dự án được thiết kế chuẩn mực theo mô hình tách biệt Front-End & Back-End, tuân thủ nghiêm ngặt **7 Module chức năng SRS (F01 - F07)**, **8 Quy tắc nghiệp vụ cốt lõi (BR01 - BR08)**, hợp đồng giao tiếp **OpenAPI 3.0** và kế hoạch kiểm thử theo chuẩn **IEEE 29119**.

---

## 🏛 Cấu trúc Thư mục Tổng thể

```text
hotel-management-system/
├── .github/
│   └── workflows/
│       └── frontend-ci.yml                  # Kiểm tra TypeScript, ESLint và build thử Vite
│
├── docs/                                    # Tài liệu đặc tả & hợp đồng API chờ BE chốt stack
│   ├── SRS_Hotel_Management_System.md       # Đặc tả yêu cầu phần mềm (F01 -> F07)
│   ├── Business_Rules_v1.2.md               # Đặc tả quy tắc nghiệp vụ (BR01 -> BR08)
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
│   │   │   └── services/                    # 7 file service tương ứng đúng 7 module SRS
│   │   │       ├── auth.service.ts          # [F01]
│   │   │       ├── room.service.ts          # [F02]
│   │   │       ├── reservation.service.ts   # [F03]
│   │   │       ├── stay.service.ts          # [F04]
│   │   │       ├── billing.service.ts       # [F05]
│   │   │       ├── serviceHk.service.ts     # [F06]
│   │   │       └── report.service.ts        # [F07]
│   │   │
│   │   ├── mocks/                           # Dữ liệu giả lập để chạy full luồng khi chưa có BE & DB
│   │   │   ├── mockDb.ts                    # Lưu trạng thái phòng, đơn đặt, hóa đơn vào localStorage
│   │   │   ├── seedData.ts                  # Dữ liệu mẫu: 4 tài khoản Roles, 11 phòng (101-303), dịch vụ
│   │   │   └── mockHandlers.ts              # Giả lập logic BR01 -> BR08 (chống trùng lịch, đổi trạng thái)
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
│   │   │   │   └── RoleGate.tsx             # Ẩn/hiện nút thao tác theo RBAC (VD: Lễ tân chỉ VIEW ở F02)
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.tsx           # Khung giao diện chính
│   │   │   │   ├── Sidebar.tsx              # Menu điều hướng chỉ gồm các mục thuộc F01 -> F07
│   │   │   │   └── Navbar.tsx
│   │   │   └── common/
│   │   │       ├── StatusBadge.tsx          # Nhãn màu: AVAILABLE, RESERVED, OCCUPIED, DIRTY
│   │   │       ├── CurrencyDisplay.tsx      # Định dạng tiền VNĐ chuẩn xác
│   │   │       ├── DataTable.tsx            # Bảng dữ liệu dùng chung (tìm kiếm, lọc, phân trang)
│   │   │       └── ConfirmModal.tsx         # Hộp thoại xác nhận thao tác (Hủy đơn, Check-out, Dọn xong)
│   │   │
│   │   ├── features/                        # ĐÚNG 7 MODULE CHỨC NĂNG BÁM SÁT SRS (F01 -> F07)
│   │   │   ├── f01-auth/                    # [F01] Authentication & Authorization
│   │   │   │   ├── pages/
│   │   │   │   │   ├── LoginPage.tsx
│   │   │   │   │   ├── UserManagementPage.tsx      # Chỉ mở cho ADMIN (AUTH_01)
│   │   │   │   │   └── Forbidden403Page.tsx        # Báo lỗi khi truy cập URL trái quyền (TC_AUTH_04)
│   │   │   │   └── components/
│   │   │   │       └── UserFormModal.tsx
│   │   │   │
│   │   │   ├── f02-rooms/                   # [F02] Room Management
│   │   │   │   ├── pages/
│   │   │   │   │   └── RoomCatalogPage.tsx         # Danh sách phòng, loại phòng & sơ đồ trạng thái
│   │   │   │   └── components/
│   │   │   │       ├── RoomFormModal.tsx           # Thêm/Sửa phòng & giá (Chỉ ADMIN & MANAGER - ROOM_01)
│   │   │   │       └── RoomDiagramGrid.tsx         # Sơ đồ trực quan theo tầng & trạng thái phòng
│   │   │   │
│   │   │   ├── f03-reservations/            # [F03] Reservation Management
│   │   │   │   ├── pages/
│   │   │   │   │   └── ReservationListPage.tsx     # Danh sách đơn đặt phòng (Chỉ MANAGER & RECEPTIONIST)
│   │   │   │   └── components/
│   │   │   │       ├── BookingForm.tsx             # Form đặt phòng: nhập thông tin khách đặt + ngày + số khách (BR01)
│   │   │   │       └── RoomAvailabilityPicker.tsx  # Bộ lọc phòng trống theo khoảng ngày (BR02)
│   │   │   │
│   │   │   ├── f04-check-in-out/            # [F04] Check-in / Check-out
│   │   │   │   ├── pages/
│   │   │   │   │   └── FrontDeskOperationPage.tsx  # Bàn làm việc Lễ tân (Nhận/Trả phòng trong ngày)
│   │   │   │   └── components/
│   │   │   │       ├── CheckInModal.tsx            # Xác nhận/bổ sung thông tin khách nhận phòng -> OCCUPIED (BR03)
│   │   │   │       └── CheckOutModal.tsx           # Tính phụ thu trả muộn & chuyển phòng -> DIRTY (BR04)
│   │   │   │
│   │   │   ├── f05-billing/                 # [F05] Billing & Payment
│   │   │   │   ├── pages/
│   │   │   │   │   └── InvoiceDetailPage.tsx       # Bảng kê tiền phòng, dịch vụ, VAT, chiết khấu (BR05)
│   │   │   │   └── components/
│   │   │   │       ├── PaymentModal.tsx            # Chặn trả thừa & chống nhấn đúp thanh toán (BR06)
│   │   │   │       └── InvoicePrintView.tsx        # Giao diện in / xuất hóa đơn cho khách
│   │   │   │
│   │   │   ├── f06-service-housekeeping/    # [F06] Service & Housekeeping Management
│   │   │   │   ├── pages/
│   │   │   │   │   ├── HousekeepingBoardPage.tsx   # Danh sách phòng DIRTY cho Housekeeping (TC_HK_01)
│   │   │   │   │   └── RoomServiceOrderPage.tsx    # Gắn Minibar/Giặt ủi vào phòng OCCUPIED (TC_SVC_01)
│   │   │   │   └── components/
│   │   │   │       └── CleanConfirmButton.tsx      # Xác nhận dọn xong: DIRTY -> AVAILABLE (TC_HK_02)
│   │   │   │
│   │   │   └── f07-reports/                 # [F07] Dashboard & Reports
│   │   │       ├── pages/
│   │   │       │   ├── ExecutiveDashboardPage.tsx  # Báo cáo doanh thu kỳ T cho Admin/Manager (REP_01)
│   │   │       │   └── ShiftAllocationBoard.tsx    # Bảng phân bổ phòng ca trực giới hạn cho Lễ tân
│   │   │       └── components/
│   │   │           └── RevenueChart.tsx
│   │   │
│   │   ├── utils/                           # Hàm xử lý logic thuần (Pure Functions - dễ viết Unit Test)
│   │   │   ├── invoiceCalculator.ts         # Công thức: Phòng + Dịch vụ + Phụ thu + VAT - Chiết khấu (BR05)
│   │   │   ├── dateValidation.ts            # Kiểm tra biên ngày Check-out > Check-in (BR01)
│   │   │   └── formatters.ts                # Định dạng tiền VNĐ (HALF_UP) & ngày giờ Việt Nam
│   │   │
│   │   ├── types/                           # Định nghĩa TypeScript Interfaces & Enums khớp SRS
│   │   │   ├── rbac.types.ts                # 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'HOUSEKEEPING'
│   │   │   ├── room.types.ts                # 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'DIRTY'
│   │   │   ├── reservation.types.ts         # Gồm thông tin khách đặt/lưu trú nhúng trực tiếp trong đơn
│   │   │   └── billing.types.ts
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
│       ├── ts01-auth-rbac.spec.ts           # Test ma trận phân quyền UI & URL 403 của 4 Roles
│       ├── ts02-booking-flow.spec.ts        # Test luồng: Đặt phòng -> Check-in -> Dịch vụ -> Trả phòng -> Dọn phòng
│       └── ts04-billing-bva.spec.ts         # Test giá trị biên chiết khấu, số khách và thanh toán
│
└── README.md
```

---

## 👥 Ma trận Tài khoản Mẫu & Phân quyền (RBAC - BR08)

| Vai trò (Role) | Tài khoản (Email) | Mật khẩu | Quyền hạn chính |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@hotel.com` | `admin123` | Toàn quyền hệ thống, quản lý người dùng (AUTH_01), xem tất cả báo cáo. |
| **MANAGER** | `manager@hotel.com` | `manager123` | Quản lý giá/loại phòng (ROOM_01), duyệt đặt phòng, thanh toán, xem báo cáo doanh thu. |
| **RECEPTIONIST** | `reception@hotel.com` | `reception123` | Đặt phòng, nhận/trả phòng (F04), xuất hóa đơn, đặt dịch vụ minibar/giặt ủi, bảng ca trực. |
| **HOUSEKEEPING** | `hk@hotel.com` | `hk123` | Xem danh sách phòng bẩn (DIRTY), xác nhận đã hoàn tất dọn phòng -> AVAILABLE (TC_HK_02). |

---

## ⚡ Hướng dẫn Chạy Nhanh (Quick Start)

### 1. Cài đặt Dependencies
```bash
cd frontend
pnpm install
```

### 2. Thiết lập Biến môi trường
Mặc định hệ thống đã kích hoạt chế độ **Mock Database** lưu trữ trên `localStorage`, không cần khởi động Backend:
```bash
cp .env.example .env
```
*(Nội dung: `VITE_USE_MOCK=true`)*

### 3. Khởi chạy Ứng dụng
```bash
pnpm run dev
```
Truy cập: `http://localhost:5173`

### 4. Kiểm thử Tự động E2E (Playwright)
```bash
pnpm run test:e2e
```
