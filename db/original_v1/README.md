# Lược đồ CSDL v1 (lưu đối chiếu)

Bản thiết kế v1 ngày 18/11/2026 (16 bảng, PK `BIGINT IDENTITY`), giữ nguyên trạng để đối chiếu với v2. **Không dùng để chạy**: Flyway và CI chỉ đọc `db/migration/`.

- `V1__init_schema.sql`, `V2__seed_data.sql`, `test_constraints.sql`: DDL, seed và 75 case kiểm ràng buộc của v1.
- `HMS_DB_Schema_v1.md`: tài liệu lược đồ v1.

Khác biệt v1 → v2 và lý do: xem `db/DB_REPORT.md`, mục 2.
