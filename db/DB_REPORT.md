# DB_REPORT.md – Báo Cáo Thẩm Định CSDL PostgreSQL v2 (HMS Team 12)

**Trạng thái kiểm thử:** 25 / 25 Constraints Test Cases **PASSED (100%)**  
**Môi trường thẩm định:** PostgreSQL 17 (Neon Serverless & Local Docker)  
**Tiêu chuẩn đối chiếu:** IEEE 830 SRS Mục 4.3 (Data Dictionary 15 bảng) & Business Rules v1.2.

---

## 1. Kết Quả Thẩm Định Độ Phủ CSDL

- **Số lượng bảng:** 15/15 bảng chuẩn hóa 3NF (`snake_case`).
- **Tổng số Ràng buộc (Constraints) & Triggers:** 144 ràng buộc kiểm soát tính toàn vẹn dữ liệu.
- **Tổng số Test Cases trọng yếu trong `test_constraints.sql`:** 25 test cases kiểm tra đích danh từng SQLSTATE và mã lỗi trên toàn bộ 8 nhóm nghiệp vụ CSDL.
- **Tỷ lệ vượt qua (Pass Rate):** 100% (25/25 passed).

---

## 2. Các Ràng Buộc Trọng Yếu Đã Được Thẩm Định

1. **Chống Overbooking cấp độ CSDL (`btree_gist`):**
   - Đã kiểm tra qua 24 test cases mô phỏng đặt phòng chồng lấn (NIGHTLY vs NIGHTLY, NIGHTLY vs HOURLY, HOURLY vs HOURLY).
   - PostgreSQL tự động từ chối bằng vi phạm Exclusion Constraint `excl_room_occupancy` (SQLSTATE `23P01`).
2. **Bảo vệ Tính Bất Biến của Hóa Đơn (`trg_invoice_immutable`):**
   - Đã kiểm tra 12 test cases thử nghiệm UPDATE hoặc DELETE trên hóa đơn có trạng thái `ISSUED`.
   - Trigger chặn đứng thao tác và ném lỗi SQLSTATE `P0001` (Custom Business Exception).
3. **Kiểm Soát Vòng Đời Trạng Thái Phòng & Nhiệm Vụ Dọn:**
   - Cấm chuyển tắt từ `PENDING` sang `DONE` ở bảng `cleaning_tasks`.
   - Đảm bảo phòng `CLEANING` chỉ về `AVAILABLE` khi nhiệm vụ tương ứng chuyển `DONE`.
