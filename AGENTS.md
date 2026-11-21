# AGENTS.md – Quy Ước Phân Quyền & Hợp Tác Kỹ Thuật (HMS Team 12)

Tài liệu này xác định ranh giới trách nhiệm, quy ước phân quyền sửa đổi thư mục và quy chuẩn phối hợp kỹ thuật trong dự án **Hotel Management System (HMS)** theo chuẩn SE113.

---

## 1. Bản Đồ Phân Quyền Thư Mục (Code Ownership)

| Thư mục / Thành phần | Nhóm phụ trách chính | Quyền hạn & Ranh giới trách nhiệm |
| :--- | :--- | :--- |
| `docs/` | **Tech Lead / Architect** | Quản lý hợp đồng đặc tả SRS (`docs/TEAM12_SRS.docx`), BR v1.2 (`docs/BR_v1.2.md`), OpenAPI (`docs/api-contract/openapi.yaml`). Mọi sửa đổi phải được Lead phê duyệt qua PR. |
| `db/` | **Database Engineer** | Tầng CSDL PostgreSQL v2 nguyên bản. **Cấm sửa trực tiếp SQL cũ**; mọi thay đổi phải tạo file migration kế tiếp (`V3__...`). |
| `backend/` | **Backend Engineer (BE)** | Tầng máy chủ Spring Boot 3 + Java 17. Tuân thủ Clean/Hexagonal Architecture: `domain/` thuần túy, `application/`, `infrastructure/`, `web/`. |
| `frontend/` | **Frontend Engineer (FE)** | Tầng giao diện React 18 + Vite + TypeScript. Tuân thủ Feature-Sliced / Module structure (`f01` -> `f07`). Không import chéo giữa các feature. |
| `tools/` | **DevOps / QA** | Bộ công cụ đo lường độ phủ BR (`br_coverage.py`), script kiểm tra tự động. |
| `e2e-tests/` | **QA / Test Engineer** | Bộ kiểm thử Playwright full-stack (TS01 -> TS05). |
| `.github/workflows/` | **DevOps Engineer** | Quản lý pipeline CI/CD (DB, BE, FE, E2E). |
| `docker-compose.yml` | **DevOps / Lead** | Cấu hình môi trường chạy đồng bộ Postgres 17 + Backend + Frontend. |

---

## 2. Quy Tắc Bất Biến Về Kiến Trúc (Architectural Invariants)

1. **CSDL (DB v2 Invariants):**
   - 15 bảng theo chuẩn `snake_case`, khóa chính UUID v4.
   - Toàn vẹn dữ liệu được đảm bảo ở tầng DB qua 144 constraints, exclusion constraint (`btree_gist`) và trigger bảo vệ (ví dụ: `trg_invoice_immutable`).
2. **Backend (Clean Architecture):**
   - Lớp `domain/` KHÔNG ĐƯỢC phụ thuộc vào Spring Framework, Hibernate hay JPA annotations.
   - Toàn bộ tính toán tiền tệ dùng `BigDecimal`, làm tròn `HALF_UP` về 1 VNĐ (BR-50, BR-53).
   - Múi giờ nghiệp vụ bắt buộc là `Asia/Ho_Chi_Minh` (UTC+7), inject qua `ClockProvider` (BR-06).
   - Đảm bảo idempotency với header `Idempotency-Key` (BR-90, BR-91).
3. **Frontend (Design System & Contract):**
   - Bám sát hợp đồng `api-contract/openapi.yaml`.
   - Chế độ Mock (`VITE_USE_MOCK=true`) và API thật (`VITE_API_BASE_URL`) chuyển đổi mượt mà qua `axiosClient`.
   - Typography chuẩn nhận diện thương hiệu Royal Luxury: `Playfair Display` cho tiêu đề, `Plus Jakarta Sans` / `Nimbus Sans` cho nội dung.

---

## 3. Quy Ước Git & Đóng Góp (Git Workflow)

- **Quy tắc đặt tên nhánh (Branch Naming):**
  - `feat/f0x-<feature-name>`: Tính năng mới theo module SRS.
  - `fix/<issue-description>`: Vá lỗi hoặc sửa kiểm thử.
  - `test/<test-suite-name>`: Bổ sung ca kiểm thử tự động.
- **Quy tắc Commit (Conventional Commits):**
  - `feat(module): description`
  - `fix(module): description`
  - `test(module): description`
  - `docs(module): description`
  - `refactor(module): description`
- **Quy tắc Pull Request:**
  - Bắt buộc vượt qua 100% các GitHub Actions CI checks tương ứng với module sửa đổi trước khi merge.
