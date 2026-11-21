# OPEN_ITEMS.md – Nhật Ký Chốt Các Điểm Mở Kỹ Thuật (OPEN-01 -> OPEN-18)
**HMS Project · Nhóm 12 (SE113)**

---

## Danh Sách Chi Tiết 18 Điểm Mở Đã Chốt Quyết Định

| Mã | Nội dung vấn đề | Quyết định kỹ thuật đã chốt | Tác động tầng |
| :---: | :--- | :--- | :---: |
| **OPEN-01** | Xử lý khóa tài khoản sau nhiều lần đăng nhập sai | Khóa đúng 15 phút sau 5 lần sai liên tiếp (BR-71). Cột `failed_attempts` reset về 0 khi đăng nhập thành công. | DB (`users`) & BE Auth |
| **OPEN-02** | Cơ chế sinh và thời hạn của Auth Token | Opaque token UUID, TTL chính xác 30 phút từ thời điểm `issued_at` (BR-72, BR-73), bảo vệ bằng constraint `ck_token_ttl`. | DB (`auth_tokens`) |
| **OPEN-03** | Múi giờ nghiệp vụ và xử lý ngày | Múi giờ cố định `Asia/Ho_Chi_Minh` (UTC+7, BR-06). Cắt microsecond để khớp `TIMESTAMPTZ`. | BE (`ClockProvider`) |
| **OPEN-04** | Kiểm soát sức chứa phòng và trẻ em | Trẻ em 0–5 tuổi miễn phí không tính sức chứa; trẻ 6–11 tuổi tính vào sức chứa nhưng có phụ thu riêng (BR-30, BR-31, BR-32). | BE Reservation & Billing |
| **OPEN-05** | Chống Overbooking khi đặt phòng | Đơn theo đêm dùng khoảng `[checkIn 14:00, checkOut 12:00)`, đơn theo giờ `[start, start + hours)`. DB kiểm soát bằng PostgreSQL Exclusion Constraint (`btree_gist`). | DB (`reservations`) & BE |
| **OPEN-06** | Giới hạn đơn đặt phòng Nightly & Hourly | NIGHTLY từ 1 đến 30 đêm (BR-03); HOURLY từ 1 đến 10 giờ trong khung 06:00 đến 22:00 cùng ngày (BR-04, BR-07). | BE Validator & FE Form |
| **OPEN-07** | Chính sách hoàn cọc khi hủy phòng | Căn cứ $H$ (số giờ còn lại đến 14:00 ngày nhận): $H \ge 72 \to 100\%$, $24 \le H < 72 \to 50\%$, $H < 24 \to 0\%$ (BR-21, BR-22). | BE `CancellationPolicy` |
| **OPEN-08** | Cơ chế Đổi lịch phòng (Reschedule) | Chỉ áp dụng cho NIGHTLY khi $H \ge 24$. Giữ nguyên mã đơn, tính chênh lệch cọc nguyên tử trong 1 transaction (BR-25). | BE `ReservationAppService` |
| **OPEN-09** | Chọn voucher khuyến mãi | So sánh `Max(Voucher, VIP)`, nếu bằng nhau thì ưu tiên áp dụng hạng VIP. Giảm giá không vượt quá `roomCharge` (BR-41, BR-42, BR-43). | BE `DiscountSelector` |
| **OPEN-10** | Quy trình tính toán hóa đơn 11 bước | Tuân thủ tuyệt đối công thức 11 bước của BR-50. Làm tròn `HALF_UP` về 1 VNĐ đúng 1 lần cho từng dòng tiền (BR-53). | BE & FE `invoiceCalculator` |
| **OPEN-11** | Tính bất biến của Hóa đơn (Invoice Immutability) | Hóa đơn khi đã chuyển trạng thái `ISSUED` bị đóng băng hoàn toàn. DB kích hoạt trigger `trg_invoice_immutable` chặn mọi UPDATE/DELETE (BR-54). | DB (`invoices`) |
| **OPEN-12** | Cơ chế thanh toán 3 nhánh tại Check-out | - Nhánh 1: $amountDue > 0 \to$ Thu đủ tiền mới trả phòng.<br>- Nhánh 2: $amountDue = 0 \to$ Trả phòng ngay.<br>- Nhánh 3: $amountDue < 0 \to$ Hoàn lại cọc thừa cho khách (BR-84, BR-85, BR-86). | BE & FE Check-out Modal |
| **OPEN-13** | Cơ chế chống thanh toán lặp (Idempotency) | Bắt buộc header `Idempotency-Key` (UUID v4). Lưu trạng thái 102 (đang xử lý) $\to$ 200/201 (hoàn thành) trong 24h (BR-90, BR-91). | BE `IdempotencyService` |
| **OPEN-14** | Vòng đời nhiệm vụ dọn phòng (Housekeeping Lifecycle) | 2 bước nghiêm ngặt: `PENDING` $\to$ `IN_PROGRESS` $\to$ `DONE`. Khi `DONE`, phòng tự động chuyển từ `CLEANING` về `AVAILABLE` (BR-111, BR-112). | BE `CleaningTaskAppService` |
| **OPEN-15** | Ghi nhận bồi thường hư hao (Damage Incidentals) | Chỉ ghi nhận khi phòng đang `OCCUPIED`. Mức bồi thường từ 1 VNĐ đến 50.000.000 VNĐ kèm ghi chú bắt buộc 1..200 ký tự (BR-36). | BE & FE `RoomServiceOrder` |
| **OPEN-16** | Tách bạch số liệu tiền hoàn trong Báo cáo | Tiền hoàn cọc và tiền hoàn cọc thừa tại check-out hiển thị ở dòng riêng trong báo cáo, không cộng gộp và không trừ vào doanh thu thuần (BR-122). | BE Report & FE Dashboard |
| **OPEN-17** | Ghi nhận tiền cọc mất do hủy muộn hoặc No-show | Tiền cọc không hoàn được ghi vào trường `deposit_forfeited` trên đơn đặt, báo cáo ở dòng riêng biệt "Cọc mất" (BR-22, BR-24, BR-122). | DB (`reservations`) & BE |
| **OPEN-18** | Quy tắc xóa mềm phòng & xóa loại phòng | Phòng có lịch sử đơn chỉ được xóa mềm (`deleted = TRUE`) hoặc bảo trì `OUT_OF_SERVICE`. Chỉ xóa loại phòng khi đã dọn sạch các phòng thuộc loại đó (BR-102). | DB & BE Room Service |
