# HMS – Business Rules v1.2
**Oct 15, 2026 · @Võ Đạt**

---

## 1. Phạm vi và quy ước chung

Tài liệu này chốt các quy tắc nghiệp vụ **BR-01 đến BR-124** (đánh số theo nhóm, không liên tục) cho 7 module chức năng F01 đến F07 mà nhóm trưởng cập nhật ngày 16/10/2026:
- **F01:** Xác thực và Phân quyền
- **F02:** Quản lý Phòng
- **F03:** Đặt phòng
- **F04:** Check-in / Check-out
- **F05:** Thanh toán và Hóa đơn
- **F06:** Dịch vụ và Dọn phòng
- **F07:** Dashboard và Báo cáo

Bản v1.1 (15/10/2026) xử lý 26 issue BRG-01 đến BRG-26 của báo cáo lỗ hổng. Bản v1.2 (17/10/2026) thêm actor Admin, ma trận quyền mới, quy tắc cho F02, F06, F07, quy tắc thanh toán một lần tại check-out và bảng đối chiếu với BR01 đến BR08 của nhóm trưởng; kết quả từng quyết định nằm ở phần Nhật ký quyết định. Bổ sung ngày 18/10/2026: quy tắc thông tin khách (BR-09, BR-27). Mọi con số do Đạt quyết định. Mỗi BR có ID duy nhất để đưa vào SRS và RTM, và để gắn nhãn vào hàm cần test.

### Bảng Quy ước Chung

| Quy ước | Giá trị |
| :--- | :--- |
| **Giờ nhận phòng chuẩn** | 14:00 |
| **Giờ trả phòng chuẩn** | 12:00 |
| **Múi giờ nghiệp vụ** | `Asia/Ho_Chi_Minh` (UTC+7), xem BR-06 |
| **Tiền tệ** | VNĐ, kiểu `BigDecimal`, không dùng floating-point (double/float) |
| **Làm tròn** | `HALF_UP` về 1 VNĐ, đúng một lần cho mỗi dòng tiền tại điểm nêu trong BR-50; không làm tròn lại các tổng |
| **Khoảng chiếm phòng** | Đơn theo đêm chiếm `[checkIn 14:00, checkOut 12:00)`; đơn theo giờ chiếm `[giờ bắt đầu, giờ bắt đầu + số giờ)`. Hai khoảng xung đột khi `a.start < b.end` và `b.start < a.end` |
| **Mốc hết hạn** | Mốc kết thúc là mở: còn hiệu lực khi `now < mốc`, hết hiệu lực khi `now >= mốc`, trừ khi rule ghi rõ là đóng |
| **Thời gian hiện tại** | Chỉ đọc qua `ClockProvider` theo múi giờ nghiệp vụ, không gọi `now()` trực tiếp trong domain |
| **Chốt giá** | Đơn lưu snapshot giá đêm, các đêm lễ và điều kiện voucher tại lúc tạo hoặc đổi lịch, xem BR-55 |
| **Ngoài phạm vi** | Cổng thanh toán thật (dùng Mock), hóa đơn điều chỉnh, đối soát tự động, giao diện phức tạp |

---

## 2. Tác nhân Hệ thống (Actor v1.2)

Bốn vai trò hệ thống theo chuẩn quy định. Khách hàng không phải actor; mọi thao tác thay mặt khách do Lễ tân hoặc Quản lý thực hiện.

| Mã vai trò | Tên | Phạm vi chính |
| :--- | :--- | :--- |
| **ADMIN** | Quản trị viên | Tài khoản, vai trò, phân quyền; cấu hình hệ thống (ngày lễ, tỷ lệ cọc, phí dịch vụ, VAT) và danh mục dịch vụ; xem báo cáo. Không thao tác nghiệp vụ đặt phòng, check-in/out, thanh toán. |
| **MANAGER** | Quản lý khách sạn | Phòng, loại phòng, giá phòng, voucher; theo dõi đơn, hóa đơn, doanh thu; làm được mọi nghiệp vụ của Lễ tân. |
| **RECEPTIONIST** | Lễ tân | Đặt phòng, thông tin khách, check-in/out, dịch vụ, thanh toán, giao nhiệm vụ dọn phòng. |
| **HOUSEKEEPER** | Nhân viên dọn phòng | Xem phòng cần dọn, cập nhật trạng thái dọn, đánh dấu phòng sẵn sàng. |

---

## 3. Phân loại Module & Ưu tiên Kiểm thử (Priority Matrix)

| Module | Ưu tiên | Nhóm BR | Kỹ thuật test chính |
| :--- | :---: | :--- | :--- |
| **F01 Xác thực và Phân quyền** | P1 | BR-70 đến BR-79, BR-93, BR-94 | Decision Table, Security |
| **F02 Quản lý Phòng** | P2 | BR-100 đến BR-104 (kèm BR-65, BR-66, BR-69) | Validation, State Transition |
| **F03 Đặt phòng** | P1 | BR-01 đến BR-09, BR-20 đến BR-27, BR-60 đến BR-64 | EP, BVA, Decision Table, Concurrency |
| **F04 Check-in / Check-out** | P1 | BR-10, BR-11, BR-37, BR-80 đến BR-84 | State Transition, Integration |
| **F05 Thanh toán và Hóa đơn** | P1 | BR-02, BR-04, BR-30 đến BR-36, BR-40 đến BR-44, BR-50 đến BR-55, BR-85 đến BR-89, BR-90, BR-91 | Unit, BVA, Decision Table |
| **F06 Dịch vụ và Dọn phòng** | P2 | BR-110 đến BR-114 (kèm BR-34 đến BR-37) | Functional, Integration |
| **F07 Dashboard và Báo cáo** | P3 | BR-120 đến BR-124 | Data Validation, Functional |

---

## 4. Đối chiếu Quy tắc Cấp cao (BR01 -> BR08) và Quy tắc Chi tiết (BR-xx)

Tám quy tắc cấp cao của nhóm trưởng là nhóm định hướng; BR-xx là các quy tắc chi tiết, có ID duy nhất để đưa vào SRS, RTM và mã test. Hai hệ đánh số không trộn lẫn: **BR01** (không gạch) là nhóm cấp cao, **BR-01** (có gạch) là quy tắc chi tiết.

| Nhóm cấp cao | Nội dung nhóm | BR chi tiết tương ứng |
| :--- | :--- | :--- |
| **BR01 Reservation Validation** | Check-out sau check-in; số khách không vượt sức chứa | BR-03, BR-04, BR-05, BR-09, BR-32, BR-62, BR-101 |
| **BR02 Overbooking Prevention** | Không có hai đơn chồng khoảng chiếm trên cùng phòng | BR-08, BR-60, BR-61, BR-63, BR-64, BR-82, BR-92 |
| **BR03 Room State Transition** | Chuyển trạng thái phòng hợp lệ | BR-65, BR-66, BR-69, BR-81, BR-83, BR-112 |
| **BR04 Check-in / Check-out Validation** | Không check-in đơn đã hủy; không check-out khi chưa check-in | BR-37, BR-80, BR-83 |
| **BR05 Billing Accuracy** | Tính tiền chính xác tuyệt đối | BR-02, BR-04, BR-30 đến BR-36, BR-40 đến BR-44, BR-50 đến BR-55 |
| **BR06 Payment Validation** | Không thanh toán trùng; không thanh toán vượt số dư | BR-84, BR-85, BR-86, BR-87, BR-90, BR-91 |
| **BR07 Access Control** | Phân quyền theo vai trò | BR-70 đến BR-79, BR-93, BR-94 |
| **BR08 Data Consistency** | Cập nhật đồng thời không làm sai dữ liệu | BR-64, BR-78, BR-82, BR-92, BR-114 |

---

## 5. Chi tiết Quy tắc Nghiệp vụ theo từng Module

### Module 1 (F03): Đặt phòng

Một đơn đặt chỉ hợp lệ khi đúng loại đơn và ngày hợp lệ, còn phòng theo loại tại mọi thời điểm trong khoảng thuê, và cọc đã thu thành công; hủy và đổi lịch phụ thuộc số giờ còn lại đến 14:00 ngày nhận phòng. Gọi **H** là số giờ từ lúc thao tác đến 14:00 ngày check-in (H âm nếu đã qua 14:00); với đơn `HOURLY`, H là số giờ từ lúc thao tác đến giờ bắt đầu của khung thuê (H âm nếu đã qua giờ bắt đầu).

#### 5.1. Loại đơn, ngày và múi giờ
| ID | Quy tắc | Biên cần test |
| :--- | :--- | :--- |
| **BR-01** | Giờ nhận phòng chuẩn là 14:00 và giờ trả phòng chuẩn là 12:00 (theo múi giờ nghiệp vụ, BR-06). Hai mốc này dùng để tính H (BR-21), khoảng chiếm phòng (BR-60) và phụ thu BR-10, BR-11. | 13:59:59, 14:00:00; 11:59:59, 12:00:00 |
| **BR-05** | Đơn có hai loại với validator tách riêng. NIGHTLY (checkIn, checkOut là ngày) kiểm theo BR-03 và BR-62. HOURLY (ngày, giờ bắt đầu, số giờ) kiểm theo BR-04. Validator của loại này không áp cho loại kia. | HOURLY cùng ngày hợp lệ; NIGHTLY checkOut = checkIn bị từ chối |
| **BR-03** | NIGHTLY: số đêm = checkOut − checkIn, tối thiểu 1, tối đa 30. | 0, 1, 30, 31 đêm |
| **BR-62** | NIGHTLY: checkIn không nhỏ hơn hôm nay và không quá hôm nay + 365 ngày; checkOut phải sau checkIn. | hôm qua, hôm nay, +365, +366 ngày |
| **BR-06** | Múi giờ nghiệp vụ là `Asia/Ho_Chi_Minh` (UTC+7). "Hôm nay", mọi mốc giờ và mọi phép so sánh ngày đổi về múi giờ này trước khi so sánh. | 16:59:59 UTC và 17:00:00 UTC (17:00:00 UTC là 00:00:00 ngày hôm sau theo giờ VN) |
| **BR-07** | Đặt trong ngày: NIGHTLY với checkIn là hôm nay được đặt ở mọi giờ trong ngày, kể cả sau 14:00 (khi đó H âm, theo BR-22). HOURLY: giờ bắt đầu phải bằng hoặc sau thời điểm hiện tại. | Đặt lúc 13:59:59, 14:00:00, 23:59:59; HOURLY bắt đầu = bây giờ và bây giờ − 1 giây |
| **BR-09** | Thông tin khách của đơn: `guestName` bắt buộc, dài 1 đến 100 ký tự sau khi cắt khoảng trắng hai đầu. `guestPhone` bắt buộc, chỉ gồm 9 đến 11 chữ số (không khoảng trắng, không dấu). `guestEmail` không bắt buộc; nếu có thì đúng dạng `name@domain.com` và dài tối đa 100 ký tự. Thiếu hoặc sai trả HTTP 422 và không tạo đơn. Hai đơn có thể cùng thông tin khách. | Tên rỗng, toàn khoảng trắng, 1, 100, 101 ký tự; điện thoại 8, 9, 11, 12 chữ số, có chữ cái, có khoảng trắng; email để trống (hợp lệ), thiếu @, 100 và 101 ký tự |

#### 5.2. Tìm phòng trống và gán phòng
| ID | Quy tắc | Biên cần test |
| :--- | :--- | :--- |
| **BR-60** | Khoảng chiếm phòng của đơn NIGHTLY là `[checkIn 14:00, checkOut 12:00)`, của đơn HOURLY là `[giờ bắt đầu, giờ bắt đầu + số giờ)`. Hai khoảng xung đột khi `a.start < b.end` và `b.start < a.end`. Đơn trả phòng 12:00 và đơn nhận phòng 14:00 cùng ngày không xung đột. | HOURLY 12:00–14:00 giữa hai đơn kề nhau (không xung đột); HOURLY 11:00–13:00 (xung đột) |
| **BR-61** | Nguồn cung của một loại phòng = số phòng loại đó không ở `OUT_OF_SERVICE`; các trạng thái `AVAILABLE`, `RESERVED`, `OCCUPIED`, `CLEANING` không làm giảm nguồn cung. Nhu cầu tại một thời điểm = số đơn `CONFIRMED` hoặc `CHECKED_IN` cùng loại đang chiếm phòng tại thời điểm đó. Khoảng yêu cầu còn phòng khi tại mọi thời điểm trong khoảng, `nhu cầu hiện có + 1 <= nguồn cung` (kiểm theo từng đêm với NIGHTLY, theo từng khoảng giờ với HOURLY). Không đếm tổng các đơn giao nhau. | 2 phòng, đơn A đêm 10–11, đơn B đêm 12–13, yêu cầu đêm 11–12: còn phòng; nguồn cung 0, 1, N; có phòng OUT_OF_SERVICE |
| **BR-08** | Đơn `CONFIRMED` chiếm một suất của loại phòng, chưa bắt buộc gán phòng cụ thể. Lễ tân có thể gán trước (`AVAILABLE` sang `RESERVED`) hoặc gán lúc check-in (BR-81). Phòng `RESERVED` liên kết đúng một đơn `CONFIRMED` (`assignedRoomId`); hủy, no-show, đổi lịch hoặc check-in làm mất liên kết đó thì phòng `RESERVED` về `AVAILABLE` (trừ check-in: sang `OCCUPIED`). | RESERVED có đơn liên kết; CONFIRMED chưa gán; hủy, no-show, đổi lịch, check-in |
| **BR-63** | Hết phòng thì trả `RoomNotAvailableException` (HTTP 409). Đơn `CANCELLED`, `NO_SHOW`, `CHECKED_OUT` không chiếm phòng. | Phòng cuối bị đơn đã hủy giữ |
| **BR-64** | Không bao giờ vượt nguồn cung: tại mọi thời điểm số đơn `CONFIRMED + CHECKED_IN` của một loại phòng `<= nguồn cung`. Hai yêu cầu đồng thời vào suất cuối: một thành công, một nhận `RoomNotAvailableException`; N+1 yêu cầu cho N suất thì đúng N thành công (cơ chế: BR-92). | 2 luồng cùng lúc; N+1 luồng cho N phòng |

#### 5.3. Tiền cọc
| ID | Quy tắc | Biên cần test |
| :--- | :--- | :--- |
| **BR-20** | Cọc yêu cầu (`depositRequired`) = tỷ lệ cọc (mặc định 30%, Admin cấu hình theo BR-88) × tiền phòng (`roomCharge`, trước giảm giá, chưa gồm phụ thu và dịch vụ), `HALF_UP` về 1 VNĐ. Áp dụng cả HOURLY. | Tiền phòng cho kết quả .5 (ví dụ 1.000.005 đ cho 300.001,5) |
| **BR-26** | Cọc phải thu thành công qua Mock gateway khi tạo đơn; thu lỗi thì không tạo đơn. Hệ thống lưu hai giá trị tách biệt: `depositRequired` (tính) và `depositPaid` (thực thu = tổng giao dịch thu thành công trừ tổng giao dịch hoàn thành công). Chỉ hoàn tối đa `depositPaid`. Mỗi giao dịch thu/hoàn có `transactionId` và idempotent (BR-90). | Thu lỗi; hoàn lỗi rồi retry; đổi lịch nhiều lần; hoàn không vượt depositPaid |

#### 5.4. Hủy, no-show, đổi lịch
| ID | Quy tắc | Biên cần test |
| :--- | :--- | :--- |
| **BR-21** | Hủy khi $H \ge 24$: hoàn 100% `depositPaid`. $12 \le H < 24$: hoàn 50% `depositPaid` (`HALF_UP` về 1 VNĐ). $H < 12$, kể cả H âm: hoàn 0%. | H = 24:00, 23:59, 12:00, 11:59 |
| **BR-22** | Hủy khi $H < 0$ (sau 14:00 ngày check-in; với HOURLY là sau giờ bắt đầu) vẫn được nếu đơn còn `CONFIRMED` và chưa tới mốc no-show (BR-24); hoàn 0%. | H = 0:00, −0:01; 11:59:59 ngày hôm sau |
| **BR-23** | Chỉ đơn `CONFIRMED` mới hủy được. `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`, `NO_SHOW` bị từ chối với `IllegalStateTransitionException`. | Hủy lần 2; hủy đơn đã CHECKED_IN |
| **BR-24** | Mốc no-show của đơn NIGHTLY là 12:00:00 ngày hôm sau ngày checkIn; của đơn HOURLY là giờ bắt đầu + 1 giờ. `now < mốc`: đơn còn check-in hoặc hủy được. `now >= mốc`: đơn đủ điều kiện `NO_SHOW`, check-in và hủy đều bị từ chối (no-show được ưu tiên tại đúng mốc). Chuyển `NO_SHOW`: mất 100% cọc, phòng được trả về kho và bỏ gán; việc chuyển do tác vụ quét định kỳ, nhưng mọi thao tác vẫn kiểm tra now so với mốc. | 11:59:59 và 12:00:00 ngày hôm sau; hủy và check-in tại đúng 12:00:00; HOURLY: bắt đầu + 0:59:59 và + 1:00:00 |
| **BR-25** | Đổi lịch là một phép thay thế nguyên tử: (1) chỉ đơn NIGHTLY ở trạng thái `CONFIRMED` mới được đổi lịch (đơn HOURLY bị từ chối; muốn đổi thì hủy theo BR-21 rồi đặt mới), với $H \ge 24$ so với 14:00 ngày check-in cũ; khoảng mới hợp lệ theo BR-03, BR-62; chỉ thay khoảng thời gian lưu trú, giữ nguyên loại phòng và số lượng khách (muốn đổi thì hủy và đặt mới); (2) khóa loại phòng; (3) kiểm tra còn phòng cho khoảng mới, loại trừ chính đơn đang đổi (khoảng cũ của đơn này không tính vào nhu cầu); (4) thu hoặc hoàn chênh lệch giữa `depositRequired` mới và `depositPaid` qua gateway; (5) chỉ khi (3) và (4) thành công mới thay khoảng, chốt lại giá theo BR-55 và bỏ gán phòng. Lỗi ở bước nào cũng giữ nguyên lịch cũ, cọc cũ. Không thu phí đổi lịch. Voucher: yêu cầu đổi lịch có thể kèm voucherCode mới hoặc voucherCode rỗng để gỡ; nếu không kèm gì, voucher cũ được kiểm tra lại với khoảng mới theo BR-40 và đổi lịch bị từ chối nếu voucher không còn hợp lệ. | H = 24:00 và 23:59; khoảng mới giao khoảng cũ; hết phòng và đổi lịch lỗi thì lịch cũ còn nguyên; gateway lỗi; đơn HOURLY bị từ chối; đổi loại phòng hoặc số khách bị từ chối; voucher không còn hợp lệ với khoảng mới; gỡ voucher |
| **BR-27** | Cập nhật thông tin khách: Lễ tân và Quản lý sửa `guestName`, `guestPhone`, `guestEmail` của đơn `CONFIRMED` hoặc `CHECKED_IN` theo cùng miền giá trị của BR-09; đơn `CHECKED_OUT`, `CANCELLED`, `NO_SHOW` bị từ chối HTTP 409. Sửa thông tin khách không đổi giá, cọc, snapshot (BR-55) và không đổi trạng thái đơn. Loại phòng, số khách và khoảng ngày không sửa bằng thao tác này (yêu cầu có các trường đó bị từ chối HTTP 422): đổi khoảng ngày theo BR-25, các thay đổi còn lại thì hủy và đặt mới. Hai lần sửa đồng thời cùng một đơn: đúng một thành công, lần còn lại nhận HTTP 409 (BR-92). Admin và Nhân viên dọn phòng nhận HTTP 403 (BR-79). | Sửa đơn CONFIRMED và CHECKED_IN (thành công); sửa đơn CHECKED_OUT, CANCELLED, NO_SHOW (409); giá trị biên như BR-09; yêu cầu kèm loại phòng hoặc số khách (422); hai lần sửa đồng thời; Admin sửa (403) |

#### 5.5. Trạng thái phòng và đơn đặt
Mọi chuyển trạng thái không nằm trong hai bảng dưới đây đều ném `IllegalStateTransitionException`. Mỗi chuyển trạng thái là một cập nhật có điều kiện (BR-92).

**Bảng BR-65: Chuyển trạng thái phòng (hàng = hiện tại, cột = đích)**
| Từ \ Đến | AVAILABLE | RESERVED | OCCUPIED | CLEANING | OUT_OF_SERVICE |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **AVAILABLE** | – | Có (gán trước) | Có (check-in đơn trong ngày, ko gán trước) | Không | Có (BR-69) |
| **RESERVED** | Có (hủy, no-show, đổi lịch, bỏ gán) | – | Có (check-in) | Không | Không (phải bỏ gán trước) |
| **OCCUPIED** | Không | Không | – | Có (check-out) | Không |
| **CLEANING** | Có (dọn xong) | Không | Không | – | Có (BR-69) |
| **OUT_OF_SERVICE** | Có (hoàn tất sửa chữa) | Không | Không | Không | – |

- **BR-69:** Chuyển phòng sang `OUT_OF_SERVICE` chỉ từ `AVAILABLE` hoặc `CLEANING`, và bị từ chối nếu sau khi trừ phòng đó nguồn cung nhỏ hơn nhu cầu tại bất kỳ thời điểm nào (BR-61). Phòng `RESERVED` muốn bảo trì phải bỏ gán (về `AVAILABLE`) trước. Phòng `CLEANING` sang `OUT_OF_SERVICE` thì nhiệm vụ dọn đang mở chuyển `CANCELLED` (BR-112).

**Bảng BR-66: Vòng đời đơn đặt phòng**
| Từ \ Đến | CONFIRMED | CHECKED_IN | CHECKED_OUT | CANCELLED | NO_SHOW |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **(Tạo mới)** | Có | Không | Không | Không | Không |
| **CONFIRMED** | – | Có (BR-80) | Không | Có (BR-21) | Có (BR-24) |
| **CHECKED_IN** | Không | – | Có (BR-83) | Không | Không |
| **CHECKED_OUT** | Không | Không | – | Không | Không |
| **CANCELLED** | Không | Không | Không | – | Không |
| **NO_SHOW** | Không | Không | Không | Không | – |

*`CHECKED_OUT`, `CANCELLED` và `NO_SHOW` là trạng thái cuối cùng, không thể chuyển đổi tiếp.*

---

### Module 2 (F04): Check-in / Check-out

| ID | Quy tắc | Biên cần test |
| :--- | :--- | :--- |
| **BR-80** | Check-in chỉ cho đơn `CONFIRMED`, từ 00:00:00 ngày `checkIn` đến trước mốc no-show (BR-24, mốc cuối là mở). Trước ngày checkIn bị từ chối. Check-in cùng ngày sau 14:00 hợp lệ và không phát sinh phụ thu sớm (BR-10). Đơn HOURLY: check-in chỉ trong `[giờ bắt đầu, giờ bắt đầu + 1 giờ)`, mốc cuối là mở và trùng mốc no-show HOURLY của BR-24; trước giờ bắt đầu bị từ chối. | 23:59:59 ngày checkIn − 1; 00:00:00 ngày checkIn; 13:59:59 và 14:00:00; 11:59:59 và 12:00:00 ngày hôm sau; HOURLY: bắt đầu − 0:00:01, bắt đầu, bắt đầu + 0:59:59, bắt đầu + 1:00:00 |
| **BR-81** | Phòng được gán phải cùng loại với đơn, ở trạng thái `AVAILABLE` hoặc `RESERVED` cho chính đơn đó. Đơn đã gán trước chỉ được check-in vào đúng phòng đã gán; muốn đổi phải bỏ gán trước. Thành công thì phòng sang `OCCUPIED`, đơn sang `CHECKED_IN`. | Phòng khác loại; phòng OCCUPIED, CLEANING, OUT_OF_SERVICE; phòng RESERVED của đơn khác; đơn đã gán phòng A check-in phòng B |
| **BR-82** | Hai thu ngân cùng check-in một phòng, hoặc cùng một đơn vào hai phòng khác nhau: chỉ một thành công, người còn lại nhận lỗi xung đột (HTTP 409) và không có tác dụng phụ. Bất biến: một phòng có tối đa một đơn `CHECKED_IN`, một đơn có tối đa một phòng (cơ chế: BR-92). | 2 luồng cùng phòng; 2 luồng cùng đơn khác phòng; N luồng cho 1 phòng |
| **BR-83** | Check-out chỉ cho đơn `CHECKED_IN`. Thành công (BR-84) thì đơn sang `CHECKED_OUT`, phòng sang `CLEANING`, hóa đơn `ISSUED`, tạo nhiệm vụ dọn phòng (BR-111). | Check-out đơn CONFIRMED; check-out lần 2 |
| **BR-84** | Xử lý theo `amountDue` (BR-50). $amountDue > 0$: gọi Mock gateway thu amountDue. $amountDue = 0$: không gọi gateway. $amountDue < 0$: gọi gateway hoàn giá trị tuyệt đối của amountDue. Gateway lỗi ở nhánh bất kỳ thì đơn vẫn `CHECKED_IN`, phòng vẫn `OCCUPIED`, không có hóa đơn `ISSUED` và không có dữ liệu dở dang. Ranh giới giao dịch: BR-91. | Mỗi nhánh × gateway thành công hoặc lỗi; amountDue = 1, 0, −1 |
| **BR-37** | Chỉ thêm dịch vụ khi đơn đang `CHECKED_IN`. | Thêm khi CONFIRMED, CHECKED_OUT |

#### Bảng BR-10: Phụ thu check-in sớm (Chỉ đơn NIGHTLY; t = giờ check-in thực tế)
| Khoảng thời gian t | Tỷ lệ phụ thu |
| :--- | :--- |
| $t \ge 14:00$ | 0% |
| $12:00 \le t < 14:00$ | 30% giá 1 đêm |
| $06:00 \le t < 12:00$ | 50% giá 1 đêm |
| $t < 06:00$ | 100% giá 1 đêm |
*Áp dụng khi phòng đã sẵn sàng (`AVAILABLE` hoặc `RESERVED` cho đơn này); chưa sẵn sàng thì từ chối check-in sớm và không phát sinh phụ thu. Biên test: 05:59:59, 06:00:00, 11:59:59, 12:00:00, 13:59:59, 14:00:00.*

#### Bảng BR-11: Phụ thu check-out trễ (Chỉ đơn NIGHTLY; t = giờ check-out thực tế)
| Khoảng thời gian t | Tỷ lệ phụ thu |
| :--- | :--- |
| $t \le 12:00$ | 0% |
| $12:00 < t \le 15:00$ | 30% giá 1 đêm |
| $15:00 < t \le 18:00$ | 50% giá 1 đêm |
| $t > 18:00$ | 100% giá 1 đêm |
*Phụ thu tính một lần trên ngày cuối, không cộng dồn theo đêm. Biên test: 12:00:00, 12:00:01, 15:00:00, 15:00:01, 18:00:00, 18:00:01. Thời điểm check-out thực tế t được chốt ở lần gọi đầu tiên của một idempotency key (BR-91), nên retry không đổi phụ thu.*

---

### Module 3 (F05): Thanh toán và Hóa đơn

Hóa đơn được tính theo đúng 11 bước của BR-50, mỗi dòng tiền làm tròn đúng một lần tại điểm đánh dấu $R$ (`HALF_UP` về 1 VNĐ). Giảm giá chỉ áp dụng cho tiền phòng; dịch vụ không được giảm.

#### 5.6. Giá phòng & Phụ phí
| ID | Quy tắc | Biên cần test |
| :--- | :--- | :--- |
| **BR-02** | Giá tính theo đêm (NIGHTLY) hoặc theo giờ (HOURLY); một đơn chỉ một loại. NIGHTLY: $roomCharge = 	ext{số đêm} 	imes nightlyRate$ (snapshot, BR-55). | 1 đêm, 30 đêm |
| **BR-04** | Giá theo giờ (HOURLY): thuê trong cùng một ngày, giờ bắt đầu từ 06:00 đến 22:00 (gồm hai đầu), số giờ nguyên từ 1 đến 10, và giờ kết thúc = giờ bắt đầu + số giờ không quá 24:00 (đúng 24:00 hợp lệ, không qua nửa đêm). Tỷ lệ trên giá đêm: 1 đến 3 giờ = 30%; từ giờ thứ 4 mỗi giờ thêm +10% (4 giờ 40%, 5 giờ 50%, …, 10 giờ 100%). $roomCharge = R(nightlyRate 	imes 	ext{tỷ lệ})$. Gói trọn: không áp BR-10, BR-11, BR-30, BR-31, BR-33, BR-40, BR-41; vẫn áp BR-34 đến BR-36, BR-51, BR-52; sức chứa theo BR-32. | Giờ bắt đầu 05:59, 06:00, 22:00, 22:01; số giờ 0, 1, 3, 4, 10, 11; 22:00 + 2 giờ (hợp lệ), 22:00 + 3 giờ (từ chối), 21:00 + 3 giờ (hợp lệ, kết thúc 24:00), 21:00 + 4 giờ (từ chối) |
| **BR-30** | NIGHTLY: 2 người lớn/phòng đã gồm trong giá. Mỗi người lớn thêm: +200.000 đ/đêm. | 2, 3, 4 người lớn |
| **BR-31** | NIGHTLY: trẻ 6–11 tuổi +100.000 đ/đêm. Trẻ dưới 6 tuổi miễn phí, không tính vào sức chứa chính nhưng tối đa 2 trẻ dưới 6 tuổi mỗi phòng. Từ 12 tuổi tính như người lớn. Tuổi = số năm tròn tính từ ngày sinh khai báo đến ngày check-in (HOURLY: ngày thuê). | Sinh đúng 6 năm trước ngày check-in (6 tuổi) và 1 ngày sau đó (5 tuổi); đúng 12 năm (12 tuổi) và 1 ngày sau đó (11 tuổi) |
| **BR-32** | Sức chứa NIGHTLY (theo loại phòng): người lớn $\ge 1$, người lớn + trẻ 6–11 không vượt sức chứa tối đa của loại phòng (BR-101; mặc định STANDARD 2, DELUXE 3, SUITE 4), trẻ dưới 6 $\le 2$. Sức chứa HOURLY: người lớn $\ge 1$, người lớn + trẻ 6–11 $\le 2$ và không vượt sức chứa loại phòng, trẻ dưới 6 $\le 2$. | 0 và 1 người; theo loại: STANDARD 2 và 3 người, DELUXE 3 và 4 người, SUITE 4 và 5 người; 1 người lớn + 2 và + 3 trẻ dưới 6; 0 người lớn + 2 trẻ 6–11; HOURLY 2 và 3 người |
| **BR-33** | NIGHTLY: phụ thu ngày lễ +20% nightlyRate cho mỗi đêm thuộc danh sách ngày lễ (snapshot, BR-55). Một đêm là đêm lễ khi ngày bắt đầu của đêm đó (ngày check-in của đêm) nằm trong danh sách; danh sách là các ngày dương lịch cố định lặp hằng năm (xem Phụ lục). $holiday = R(	ext{số đêm lễ} 	imes nightlyRate 	imes 20\%)$. | 0, 1, tất cả các đêm là lễ |

#### 5.7. Dịch vụ phát sinh
| ID | Quy tắc | Biên cần test |
| :--- | :--- | :--- |
| **BR-34** | Minibar: giá lấy từ danh mục (VNĐ nguyên, > 0), lưu `unitPrice` vào dòng lúc thêm; số lượng nguyên từ 1 đến 99 mỗi dòng. Không giảm giá, chỉ chịu VAT. | Số lượng 0, 1, 99, 100; giá danh mục 0 và âm bị từ chối khi cấu hình |
| **BR-35** | Giặt ủi: đơn giá theo danh mục (mặc định 25.000 đ/món, BR-110), lưu `unitPrice` vào dòng lúc thêm; số lượng nguyên từ 1 đến 99. Không giảm giá, chỉ chịu VAT. | Số lượng 0, 1, 99, 100 |
| **BR-36** | Hư hao: số tiền nguyên từ 1 đến 50.000.000 đ; ghi chú bắt buộc, sau khi cắt khoảng trắng hai đầu dài 1 đến 200 ký tự (chuỗi toàn khoảng trắng coi là rỗng). Không giảm giá, chỉ chịu VAT. | Số tiền 0, 1, 50.000.000, 50.000.001; ghi chú rỗng, toàn khoảng trắng, 200 và 201 ký tự |

#### 5.8. Giảm giá (Chọn đúng một ưu đãi duy nhất)
| ID | Quy tắc | Biên cần test |
| :--- | :--- | :--- |
| **BR-40** | Voucher chỉ áp cho đơn NIGHTLY, hợp lệ khi $validFrom \le 	ext{ngày check-in} \le validTo$, số đêm $\ge minNights$ và kỳ lưu trú không có đêm ngày lễ. PERCENT: $R(roomCharge 	imes 	ext{phần trăm})$, nếu có `maxDiscount` thì lấy nhỏ hơn. FIXED: giá trị cố định. | Ngày biên validFrom, validTo; số đêm = minNights ± 1; HOURLY dùng voucher bị từ chối |
| **BR-44** | Cấu hình voucher hợp lệ: code không rỗng và duy nhất; PERCENT có $0 < 	ext{phần trăm} \le 100$ (tối đa 2 chữ số thập phân); FIXED có giá trị nguyên > 0; maxDiscount (chỉ PERCENT) để trống là không trần, nếu có thì > 0; minNights $\ge 1$; $validFrom \le validTo$. Cấu hình sai bị từ chối khi tạo hoặc sửa (HTTP 400); BillingService vẫn ném `InvalidVoucherException` nếu nhận dữ liệu sai. | FIXED 0, −1, lớn hơn roomCharge; PERCENT 0, 100, 100.01; maxDiscount trống, 0, −1; validFrom sau validTo |
| **BR-41** | Ưu đãi VIP (NIGHTLY): tier VIP, số đêm > 3 và không có đêm ngày lễ thì giảm $R(10\% 	imes roomCharge)$. | 3, 4 đêm; VIP và khách thường; có đêm lễ |
| **BR-42** | Không cộng dồn. Có cả voucher hợp lệ và ưu đãi VIP thì lấy khoản giảm lớn hơn; bằng nhau lấy ưu đãi VIP. | Voucher lớn hơn, nhỏ hơn, bằng VIP |
| **BR-43** | $discount = \min(	ext{khoản giảm đã chọn}, roomCharge)$; giảm giá chỉ tính trên tiền phòng. | FIXED lớn hơn tiền phòng; FIXED bằng tiền phòng; PERCENT chạm trần |

#### 5.9. Thứ tự tính toán Hóa đơn 11 Bước (BR-50)
*Ký hiệu $R$ là làm tròn `HALF_UP` về 1 VNĐ, áp dụng đúng một lần cho dòng đó:*
1. $roomCharge = 	ext{số đêm} 	imes nightlyRate$ (NIGHTLY) hoặc $R(nightlyRate 	imes 	ext{tỷ lệ BR-04})$ (HOURLY).
2. $holiday = R(	ext{số đêm lễ} 	imes nightlyRate 	imes 20\%)$.
3. **Phụ thu (mỗi khoản là một dòng riêng):**
   - $early = R(nightlyRate 	imes 	ext{tỷ lệ BR-10})$
   - $late = R(nightlyRate 	imes 	ext{tỷ lệ BR-11})$
   - $extraAdult = 	ext{số người lớn thêm} 	imes 200.000 	imes 	ext{số đêm}$
   - $extraChild = 	ext{số trẻ 6–11} 	imes 100.000 	imes 	ext{số đêm}$ *(hai dòng sau là số nguyên, không làm tròn)*
4. $discount =$ chọn theo BR-40 đến BR-43; $vipDiscount = R(10\% 	imes roomCharge)$; $voucherDiscount = R(roomCharge 	imes 	ext{phần trăm})$ (có trần maxDiscount) hoặc FIXED.
5. $serviceFeeBase = roomCharge - discount + holiday + early + late + extraAdult + extraChild$ (tổng số nguyên).
6. $serviceFee = R(5\% 	imes serviceFeeBase)$.
7. $services = \sum (	ext{dòng minibar} + 	ext{giặt ủi} + 	ext{hư hao})$ (mỗi dòng = số lượng $	imes$ unitPrice, số nguyên).
8. $taxable = serviceFeeBase + serviceFee + services$.
9. $vat = R(10\% 	imes taxable)$.
10. $total = taxable + vat$.
11. $amountDue = total - depositPaid$; số âm là số tiền hoàn lại khách (nhánh xử lý: BR-84).

| ID | Quy tắc | Biên cần test |
| :--- | :--- | :--- |
| **BR-51** | Phí dịch vụ (mặc định 5%, Admin cấu hình theo BR-88) trên `serviceFeeBase`; không áp cho minibar, giặt ủi, hư hao. | serviceFeeBase cho kết quả .5 |
| **BR-52** | VAT (mặc định 10%, Admin cấu hình theo BR-88) trên `taxable`. | taxable cho kết quả .5 |
| **BR-53** | Không làm tròn lại các tổng: `serviceFeeBase`, `taxable`, `total` và `amountDue` là tổng hoặc hiệu của các dòng đã làm tròn. | Ví dụ D bên dưới: làm tròn từng dòng cho 1.425.929, làm tròn một lần ở cuối cho 1.425.928 |
| **BR-54** | Hóa đơn chỉ ở trạng thái `ISSUED` sau khi BR-84 thành công; sau đó bất biến. Hóa đơn điều chỉnh nằm ngoài phạm vi. | Sửa hóa đơn ISSUED bị từ chối; check-out lỗi không có hóa đơn ISSUED |
| **BR-55** | Chốt giá lúc đặt: khi tạo hoặc đổi lịch thành công, đơn lưu snapshot `nightlyRate`, các đêm lễ của khoảng thuê, điều kiện voucher đã gắn, tỷ lệ cọc, phí dịch vụ và VAT. Hóa đơn tính từ snapshot, nên sửa giá phòng, ngày lễ hoặc voucher sau đó không ảnh hưởng đơn đã tạo. Đổi lịch chốt lại snapshot theo cấu hình tại lúc đổi. Dịch vụ dùng đơn giá lưu trên dòng lúc thêm. | Sửa giá, ngày lễ, voucher sau khi đặt; đổi lịch sau khi sửa cấu hình |

#### 5.10. Thanh toán, số dư và tham số hệ thống
| ID | Quy tắc | Biên cần test |
| :--- | :--- | :--- |
| **BR-85** | Thanh toán một lần tại check-out: khi $amountDue > 0$, số tiền thanh toán phải đúng bằng amountDue; số khác (thiếu hoặc vượt) bị từ chối HTTP 422 và không gọi gateway. Khi $amountDue \le 0$ áp BR-84 (không thu; hoàn nếu âm). Số tiền hoàn không vượt depositPaid. | amountDue − 1, amountDue, amountDue + 1; amountDue = 0; hoàn đúng depositPaid |
| **BR-86** | Không thanh toán trùng: mỗi hóa đơn có tối đa một giao dịch thu `SUCCEEDED`. Thanh toán lần hai trên đơn đã `CHECKED_OUT` hoặc hóa đơn đã `ISSUED` bị từ chối HTTP 409 và không tạo giao dịch; retry cùng Idempotency-Key trả lại kết quả lần đầu (BR-90). | Thanh toán hai lần cùng key; hai lần khác key; hai thu ngân đồng thời (BR-92) |
| **BR-87** | Xem số dư (Lễ tân, Quản lý): trả số dư tạm tính = $total - depositPaid$ của đơn `CHECKED_IN`, tính như thể check-out ngay tại giờ hiện tại; không đổi dữ liệu, không gọi gateway, không xuất hóa đơn. Số tiền phải trả chốt lúc check-out theo BR-91, nên thêm dịch vụ hoặc đổi giờ giữa hai lần làm số dư thay đổi. Đơn chưa `CHECKED_IN` trả HTTP 409. | Xem trước rồi thêm dịch vụ rồi check-out; xem nhiều lần không đổi dữ liệu; xem đơn CONFIRMED (409) |
| **BR-88** | Tham số hệ thống (chỉ Admin sửa; Quản lý và Lễ tân xem): tỷ lệ cọc mặc định 30% ($0 < x \le 100$), phí dịch vụ mặc định 5% ($0 \le x \le 20$), VAT mặc định 10% ($0 \le x \le 20$), mỗi giá trị tối đa 2 chữ số thập phân; ngoài miền bị từ chối HTTP 422. Sửa tham số chỉ áp cho đơn tạo sau (BR-55). Các tỷ lệ BR-10, BR-11, BR-30, BR-31, BR-33 và BR-41 là hằng số trong v1.2, không cấu hình. | Tỷ lệ cọc 0, 0.01, 100, 100.01; phí dịch vụ 0, 20, 20.01; VAT 0, 20, 20.01; 3 chữ số thập phân; Quản lý sửa (403); đổi tỷ lệ rồi xuất hóa đơn của đơn tạo trước |
| **BR-89** | Ngày lễ (chỉ Admin sửa; Quản lý và Lễ tân xem): thêm, sửa, xóa ngày lễ dương lịch lặp hằng năm theo tháng và ngày hợp lệ, không trùng nhau; không dùng 29/02 làm ngày lễ. Thay đổi chỉ áp cho đơn tạo sau (BR-55). | 31/04 (422); 29/02 (422); thêm ngày trùng (409); Quản lý thêm (403); sửa danh sách sau khi đặt rồi xuất hóa đơn |

#### Bảng Ví dụ Tính tiền Mẫu (Đã kiểm toán chính xác)
- **A:** 3 đêm, 2 người lớn + 1 trẻ 8 tuổi, khách thường, voucher PERCENT 10% trần 200.000, check-out lúc 14:00 (phụ thu trễ 30% = 300.000, trẻ 3 × 100.000 = 300.000), minibar 2 × 50.000 và giặt ủi 4 × 25.000 (dịch vụ 200.000).
- **B:** voucher FIXED 570.000 cho 1 đêm.
- **C:** voucher FIXED 1.000.000 cho 1 đêm (bằng tiền phòng).
- **D:** 1 đêm, không ưu đãi.
- **E:** HOURLY 5 giờ (50%), không ưu đãi. Cọc `depositPaid = 30% roomCharge` (BR-20), không có ngày lễ.

| Khoản mục (VNĐ) | Ví dụ A | Ví dụ B | Ví dụ C | Ví dụ D | Ví dụ E |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Đơn giá đêm** | 1.000.000 | 770.000 | 1.000.000 | 1.234.570 | 800.000 |
| **1. roomCharge** | 3.000.000 | 770.000 | 1.000.000 | 1.234.570 | 400.000 |
| **3. Phụ thu (late + trẻ)** | 600.000 | 0 | 0 | 0 | 0 |
| **4. discount** | 200.000 | 570.000 | 1.000.000 | 0 | 0 |
| **5. serviceFeeBase** | 3.400.000 | 200.000 | 0 | 1.234.570 | 400.000 |
| **6. serviceFee (5%)** | 170.000 | 10.000 | 0 | 61.729 (61.728,5) | 20.000 |
| **7. services** | 200.000 | 0 | 0 | 0 | 0 |
| **8. taxable** | 3.770.000 | 210.000 | 0 | 1.296.299 | 420.000 |
| **9. vat (10%)** | 377.000 | 21.000 | 0 | 129.630 (129.629,9) | 42.000 |
| **10. total** | **4.147.000** | **231.000** | **0** | **1.425.929** | **462.000** |
| **depositPaid (30%)** | 900.000 | 231.000 | 300.000 | 370.371 | 120.000 |
| **11. amountDue** | **3.247.000** | **0** | **-300.000** | **1.055.558** | **342.000** |
| **Nhánh xử lý BR-84** | Thu 3.247.000 | Không gọi gateway | Hoàn 300.000 | Thu 1.055.558 | Thu 342.000 |

---

### Module 4 (F01): Xác thực, Tài khoản và Phân quyền

| ID | Quy tắc | Biên cần test |
| :--- | :--- | :--- |
| **BR-70** | Mật khẩu dài từ 8 đến 64 ký tự. Độ dài đếm theo code point Unicode sau khi chuẩn hóa NFC; không tự cắt khoảng trắng, khoảng trắng đầu/cuối tính là ký tự. | 7, 8, 64, 65 ký tự; "e" + dấu sắc tách rời so với ký tự é gộp; khoảng trắng đầu/cuối; chuỗi rất dài |
| **BR-71** | Sai mật khẩu 5 lần liên tiếp thì khóa tài khoản 15 phút (`lockedUntil = lúc sai lần 5 + 15 phút`). Đăng nhập đúng khi chưa khóa thì đặt lại bộ đếm về 0. Tài khoản bị khóa khi `now < lockedUntil`; đúng lúc lockedUntil thì đã mở khóa và bộ đếm về 0. Trong thời gian khóa, đăng nhập đúng vẫn bị từ chối và không kéo dài thời gian khóa. | 4 và 5 lần sai; 14:59:59, 15:00:00, 15:00:01 sau khi khóa (bằng ClockProvider); đúng sau 4 lần sai |
| **BR-72** | Token có hiệu lực 30 phút: hợp lệ khi `now < expiresAt`, hết hạn khi `now >= expiresAt` (`expiresAt = lúc cấp + 30 phút`). | 29:59, 30:00, 30:01 kể từ lúc cấp (30:00 là hết hạn) |
| **BR-73** | Đăng xuất làm token mất hiệu lực ngay (thu hồi); dùng lại token đó bị từ chối với 401. | Gọi API ngay sau đăng xuất; đăng xuất hai lần |
| **BR-74** | Thiếu token, token sai định dạng, sai chữ ký, hết hạn hoặc đã thu hồi trả HTTP 401. | Không header; token rác; token hết hạn; token đã đăng xuất |
| **BR-75** | Token hợp lệ nhưng vai trò không đủ quyền trả HTTP 403. | Từng ô "Không" trong ma trận |
| **BR-77** | Thứ tự xử lý một yêu cầu: (1) xác thực token, thất bại trả 401; (2) kiểm tra quyền, thiếu quyền trả 403; (3) kiểm tra dữ liệu và nghiệp vụ (400, 409, 422). Yêu cầu có nhiều lỗi trả mã của bước đầu tiên thất bại. | Không token + vai trò thiếu quyền (401); token hết hạn + endpoint cấm vai trò (401); token hợp lệ, vai trò sai, body sai (403); token hợp lệ, vai trò đúng, body sai (400) |
| **BR-78** | Đồng thời: bộ đếm sai mật khẩu cập nhật nguyên tử (một lệnh cập nhật có điều kiện), không mất lần sai nào. Lần sai thứ 5 chạy song song với đăng nhập đúng: kết quả theo thứ tự tuần tự hóa; đúng trước thì đặt lại bộ đếm, đúng sau thì bị từ chối vì đã khóa. Token thu hồi được kiểm tra ở bước xác thực của mỗi yêu cầu. | N luồng sai song song: bộ đếm đúng bằng N; sai lần 5 đồng thời với đúng; logout đồng thời với API; dùng token sau logout |
| **BR-76** | Mật khẩu chỉ lưu dạng băm (BCrypt salted), không lưu bản rõ và không xuất hiện trong phản hồi hay nhật ký hệ thống. | Kiểm tra DB, phản hồi API và log |
| **BR-79** | Giá trị "Xem" trong ma trận là chỉ đọc: GET thành công, mọi POST, PUT, PATCH, DELETE vào cùng tài nguyên trả HTTP 403 và không đổi dữ liệu. Giá trị "Hạn chế" xem BR-124. | Lễ tân GET giá phòng (200) và PUT giá phòng (403); dọn phòng GET trạng thái phòng (200) và POST đặt phòng (403); Quản lý GET nhiệm vụ dọn (200) và PATCH nhiệm vụ dọn (403) |
| **BR-93** | Quản lý tài khoản (chỉ Admin): tạo tài khoản với username duy nhất (không phân biệt hoa thường), 4 đến 30 ký tự gồm chữ, số, dấu chấm, gạch dưới; mật khẩu theo BR-70; đúng một trong 4 vai trò. Admin đổi vai trò, đặt lại mật khẩu, vô hiệu hóa và kích hoạt lại tài khoản. Không xóa tài khoản, chỉ vô hiệu hóa (soft-delete), để giữ dữ liệu đã ghi (người tạo đơn, hóa đơn). Tài khoản bị vô hiệu hóa không đăng nhập được, mọi token đang có bị thu hồi ngay (401); đổi vai trò cũng thu hồi token để vai trò mới có hiệu lực ngay. | Username trùng (khác hoa thường), 3, 4, 30, 31 ký tự; ký tự cấm; vai trò ngoài danh sách; token của tài khoản vừa bị vô hiệu hóa; đăng nhập lại khi đã vô hiệu hóa; Quản lý gọi API quản lý tài khoản (403) |
| **BR-94** | Bảo vệ Admin: Admin không được vô hiệu hóa hoặc hạ vai trò chính tài khoản của mình, và luôn còn ít nhất một Admin đang hoạt động. Vi phạm trả HTTP 409 và không đổi dữ liệu. Hai Admin cùng hạ vai trò nhau khi chỉ còn hai Admin: chỉ một thành công (BR-92). | Admin tự vô hiệu hóa; Admin cuối cùng bị hạ vai trò; hai Admin hạ lẫn nhau đồng thời; Admin hạ Admin khác khi còn đủ Admin (thành công) |

#### Bảng Ma trận Phân quyền Chuẩn (RBAC Matrix v1.2)
*Ghi chú: Có = Đọc và Ghi; Xem = Chỉ đọc (BR-79); Hạn chế = Xem giới hạn (BR-124); Không = Cấm (403)*

| Hành động nghiệp vụ | ADMIN | QUẢN LÝ (MANAGER) | LỄ TÂN (RECEPTIONIST) | DỌN PHÒNG (HOUSEKEEPER) |
| :--- | :---: | :---: | :---: | :---: |
| Đăng nhập, đăng xuất | Có | Có | Có | Có |
| Quản lý tài khoản, vai trò, phân quyền [F01] | Có | Không | Không | Không |
| Cấu hình hệ thống (ngày lễ, cọc, phí, VAT) và danh mục dịch vụ | Có | Xem | Xem | Không |
| Tạo, sửa, xóa phòng & loại phòng; đặt OUT_OF_SERVICE [F02] | Có | Có | Xem | Xem |
| Thiết lập giá phòng, voucher khuyến mãi [F02, F05] | Xem | Có | Xem | Không |
| Xem trạng thái và sơ đồ phòng [F02] | Có | Có | Có | Có |
| Tìm phòng, đặt phòng, hủy, đổi lịch, gán phòng, sửa thông tin khách [F03] | Không | Có | Có | Không |
| Check-in, check-out [F04] | Không | Có | Có | Không |
| Thêm dịch vụ, ghi nhận thanh toán, xem số dư, xuất hóa đơn [F05] | Không | Có | Có | Không |
| Giao nhiệm vụ dọn phòng [F06] | Không | Có | Có | Không |
| Xem nhiệm vụ dọn phòng; cập nhật trạng thái dọn (CLEANING -> AVAILABLE) [F06] | Không | Xem | Xem | Có |
| Dashboard và Báo cáo [F07] | Có | Có | Hạn chế (BR-124) | Không |

---

### Module 5 (F02): Quản lý Phòng

| ID | Quy tắc | Biên cần test |
| :--- | :--- | :--- |
| **BR-100** | Phòng: `roomNumber` dài 1 đến 10 ký tự chữ và số, duy nhất không phân biệt hoa thường, thuộc đúng một loại phòng. Phòng mới có trạng thái `AVAILABLE`. Yêu cầu tạo hoặc sửa có trường trạng thái bị từ chối với HTTP 422. | 0, 1, 10, 11 ký tự; "a101" so với "A101"; ký tự cấm; loại phòng không tồn tại; yêu cầu có trường trạng thái |
| **BR-101** | Loại phòng: tên duy nhất; `maxCapacity` nguyên từ 1 đến 6; `nightlyRate` nguyên từ 1 đến 100.000.000 đ. Dữ liệu mặc định: STANDARD 2, DELUXE 3, SUITE 4. `maxCapacity` là sức chứa dùng trong BR-32. Admin gửi `nightlyRate` khác giá hiện tại bị từ chối HTTP 403. | maxCapacity 0, 1, 6, 7; giá 0, 1, 100.000.000, 100.000.001; tên trùng; Admin đổi giá (403); Admin đổi sức chứa (thành công); Quản lý đổi giá (thành công) |
| **BR-102** | Xóa và đổi loại: Xóa phòng chỉ khi phòng `AVAILABLE` và chưa từng gắn với đơn nào; phòng đã dùng chỉ đặt `OUT_OF_SERVICE` (BR-104). Xóa loại phòng chỉ khi không còn phòng thuộc loại đó. Đổi loại của một phòng chỉ khi phòng `AVAILABLE`, chưa gán trước cho đơn nào, và nguồn cung loại cũ sau khi trừ phòng vẫn đủ nhu cầu (cùng kiểm tra với BR-69). Vi phạm trả HTTP 409. | Xóa phòng mới (thành công); xóa phòng đã từng có đơn CHECKED_OUT (409); xóa phòng RESERVED (409); xóa loại còn 1 phòng (409) và loại rỗng (thành công); đổi loại phòng cuối khi còn đơn tương lai |
| **BR-103** | Đổi giá và sức chứa: Giá mới chỉ áp cho đơn tạo sau (BR-55). Giảm `maxCapacity` bị từ chối HTTP 409 nếu có đơn `CONFIRMED` hoặc `CHECKED_IN` của loại đó có số khách (người lớn + trẻ 6–11) lớn hơn sức chứa mới; tăng luôn được. | Giảm DELUXE từ 3 xuống 2 khi có đơn 3 khách (409) và khi chỉ có đơn 2 khách (thành công); đổi giá rồi xuất hóa đơn của đơn tạo trước đó |
| **BR-104** | Bảo trì: chỉ Admin hoặc Quản lý đặt phòng `OUT_OF_SERVICE` (theo BR-69) và đưa về `AVAILABLE` (theo BR-65). Bắt buộc lý do dài 1 đến 200 ký tự sau khi cắt khoảng trắng hai đầu. Lễ tân và Nhân viên dọn phòng nhận HTTP 403. | Lý do rỗng, toàn khoảng trắng, 200, 201 ký tự; phòng RESERVED (409); phòng cuối của loại còn đơn tương lai (409); Lễ tân gọi (403) |

---

### Module 6 (F06): Dịch vụ và Dọn phòng

| ID | Quy tắc | Biên cần test |
| :--- | :--- | :--- |
| **BR-110** | Danh mục dịch vụ (chỉ Admin sửa): mỗi mục có mã duy nhất dài 2 đến 10 ký tự chữ và số, tên 1 đến 100 ký tự, loại `MINIBAR` hoặc `LAUNDRY`, đơn giá nguyên từ 1 đến 5.000.000 đ, trạng thái active hoặc inactive. Mục inactive không thêm được vào đơn mới (HTTP 422) nhưng dòng đã ghi giữ đơn giá lúc thêm (BR-55). Đổi giá chỉ áp cho dòng thêm sau. Lễ tân và Quản lý chỉ xem danh mục (BR-79). | Đơn giá 0, 1, 5.000.000, 5.000.001; mã trùng; thêm mục inactive; đổi giá rồi xuất hóa đơn của đơn đã ghi dòng cũ; Quản lý sửa danh mục (403) |
| **BR-111** | Tạo nhiệm vụ: khi check-out thành công (BR-83), hệ thống tạo đúng một nhiệm vụ dọn trạng thái `PENDING` cho phòng đó, trong cùng giao dịch với hóa đơn và đổi trạng thái (BR-91). Retry cùng Idempotency-Key không tạo thêm nhiệm vụ. Mỗi phòng có tối đa một nhiệm vụ chưa kết thúc (`PENDING` hoặc `IN_PROGRESS`). | Check-out lần 2; retry sau khi lỗi lưu trữ; check-out lỗi thì không có nhiệm vụ; đếm nhiệm vụ mở của phòng |
| **BR-112** | Vòng đời nhiệm vụ: `PENDING` sang `IN_PROGRESS` sang `DONE`; `PENDING` hoặc `IN_PROGRESS` sang `CANCELLED` khi phòng sang `OUT_OF_SERVICE` (BR-69). `DONE` và `CANCELLED` là trạng thái cuối. Không nhảy bước, không lùi; chuyển khác ném `IllegalStateTransitionException` (HTTP 409). Khi nhiệm vụ sang `DONE`, phòng chuyển `CLEANING` sang `AVAILABLE` trong cùng giao dịch (BR-65, BR-92); nếu phòng không ở `CLEANING` thì từ chối và không đổi gì. Chỉ Nhân viên dọn phòng thực hiện các chuyển `PENDING` sang `IN_PROGRESS` sang `DONE`. | PENDING sang DONE; DONE sang IN_PROGRESS; DONE hai lần (phòng đổi một lần); DONE khi phòng đã OUT_OF_SERVICE; Lễ tân hoặc Quản lý đổi trạng thái nhiệm vụ (403) |
| **BR-113** | Giao và nhận việc: Lễ tân hoặc Quản lý giao nhiệm vụ cho một tài khoản `HOUSEKEEPER` đang hoạt động; giao cho vai trò khác hoặc tài khoản bị vô hiệu hóa trả HTTP 422; giao lại được khi nhiệm vụ PENDING hoặc IN_PROGRESS. Nhiệm vụ chưa giao thì Nhân viên dọn bất kỳ nhận được (nhận = trở thành người được giao và chuyển IN_PROGRESS). Nhân viên dọn chỉ thấy nhiệm vụ của mình và nhiệm vụ chưa giao; thao tác trên nhiệm vụ của người khác trả HTTP 403. | Giao cho Lễ tân (422); giao cho HOUSEKEEPER bị vô hiệu hóa (422); giao lại khi IN_PROGRESS; nhận nhiệm vụ đã giao người khác (403); xem danh sách chỉ có nhiệm vụ của mình và chưa giao |
| **BR-114** | Đồng thời: hai nhân viên cùng nhận hoặc cùng cập nhật một nhiệm vụ, hoặc hai lần DONE đồng thời: đúng một thành công, người còn lại nhận HTTP 409 và không có tác dụng phụ (BR-92). Phòng chuyển AVAILABLE đúng một lần; không bao giờ có hai nhiệm vụ mở cho một phòng. | 2 luồng nhận cùng nhiệm vụ chưa giao; 2 luồng DONE; Quản lý đặt CLEANING sang OUT_OF_SERVICE đồng thời với nhân viên bấm DONE |

---

### Module 7 (F07): Dashboard và Báo cáo

| ID | Quy tắc | Biên cần test |
| :--- | :--- | :--- |
| **BR-120** | Tình trạng phòng: số phòng theo từng trạng thái (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `CLEANING`, `OUT_OF_SERVICE`) tại thời điểm truy vấn, đọc trực tiếp từ trạng thái phòng, không lưu đệm. Tổng các trạng thái bằng tổng số phòng hiện có; phòng đã xóa không tính. | 0 phòng; mỗi trạng thái bằng 0; tổng khớp sau check-in, check-out, nhiệm vụ dọn DONE, bảo trì, xóa phòng |
| **BR-121** | Thống kê đặt phòng theo kỳ $[from, to]$ (theo ngày, hai đầu đều gồm, múi giờ BR-06). Lượt đặt = số đơn có ngày tạo trong kỳ (gồm cả đơn sau đó bị hủy). Đơn hủy = số đơn CANCELLED có ngày hủy trong kỳ. No-show = số đơn NO_SHOW có ngày chuyển trong kỳ. Tỷ lệ hủy = đơn hủy chia lượt đặt, theo phần trăm, `HALF_UP` 1 chữ số thập phân; lượt đặt bằng 0 thì tỷ lệ bằng 0, không chia cho 0. | Đơn tạo lúc 23:59:59 và 00:00:00 hai ngày liền kề; hủy đúng biên kỳ; 0 lượt đặt; đơn tạo và hủy trong cùng kỳ (đếm ở cả hai chỉ số); 1 trên 3 cho 33.3% |
| **BR-122** | Doanh thu kỳ = tổng `total` của các hóa đơn `ISSUED` có ngày check-out trong kỳ. Tiền hoàn (hoàn cọc khi hủy, hoàn phần cọc dư khi amountDue âm) và cọc mất (cọc không hoàn do hủy muộn hoặc no-show, tính theo ngày hủy hoặc ngày chuyển NO_SHOW) báo ở hai dòng riêng, không cộng vào và không trừ khỏi doanh thu. Đơn bị hủy không tạo hóa đơn nên không có doanh thu. | Hóa đơn check-out lúc 23:59:59 và 00:00:00; ví dụ C (total 0, hoàn 300.000: doanh thu 0, tiền hoàn 300.000); no-show mất 100% cọc hiện ở dòng cọc mất; hóa đơn chưa ISSUED (check-out lỗi) không tính |
| **BR-123** | Tham số kỳ: `from` và `to` định dạng ngày ISO, $from \le to$, tối đa 366 ngày tính cả hai đầu; thiếu tham số, sai định dạng, from sau to hoặc quá 366 ngày trả HTTP 400. Kỳ không có dữ liệu trả số liệu bằng 0, không lỗi. Bất biến: tổng theo từng ngày bằng số liệu cả kỳ cho lượt đặt, đơn hủy, no-show và doanh thu. | from = to; from sau to; 366 và 367 ngày; kỳ qua 29/02; ngày sai định dạng; tổng từng ngày so với tổng kỳ |
| **BR-124** | Hạn chế cho Lễ tân: xem tình trạng phòng (BR-120) và thống kê vận hành của hôm nay (số đơn dự kiến check-in, số đơn dự kiến check-out, số đơn hủy trong ngày). Lễ tân không xem doanh thu, tiền hoàn, cọc mất hay kỳ khác hôm nay: HTTP 403. Nhân viên dọn phòng không xem Dashboard: HTTP 403. Admin và Quản lý xem đầy đủ. | Lễ tân gọi doanh thu (403); Lễ tân gọi thống kê hôm qua (403); Lễ tân gọi vận hành hôm nay (200); Dọn phòng gọi Dashboard (403); số liệu hôm nay của Lễ tân khớp Quản lý |

---

## 6. Giao dịch, Idempotency và Xử lý Đồng thời

| ID | Quy tắc | Biên cần test |
| :--- | :--- | :--- |
| **BR-90** | Thao tác có tác dụng phụ (tạo đơn kèm thu cọc, hủy kèm hoàn, đổi lịch, check-in, check-out kèm thanh toán) nhận header `Idempotency-Key` bắt buộc; thiếu key trả 400. Cùng key và cùng nội dung trong 24 giờ thì trả lại kết quả lần đầu, không thực hiện lại; cùng key khác nội dung trả 422. Gọi lặp với key mới hoặc sau 24 giờ trên đơn đã ở trạng thái đích bị từ chối theo BR-66 và không tạo thêm giao dịch tiền. `transactionId` của gateway sinh từ key. | Gọi lặp từng thao tác; timeout sau commit rồi retry; cùng key khác body; key quá 24 giờ |
| **BR-91** | Ranh giới giao dịch cho thu, hoàn và check-out: <br>(1) Khóa đơn và phòng, kiểm tra trạng thái.<br>(2) Tính số tiền và chốt thời điểm thực tế t, lưu cùng idempotency key.<br>(3) Gọi gateway và ghi `payment_transaction` (SUCCEEDED hoặc FAILED) trong giao dịch DB riêng ngay khi gateway trả lời.<br>(4) Trong một giao dịch DB duy nhất: ghi hóa đơn ISSUED, đổi trạng thái đơn và phòng, tạo nhiệm vụ dọn phòng (BR-111).<br>Lỗi ở (1) hoặc (2): không đổi gì. Gateway lỗi: giữ nguyên đơn và phòng. Gateway thành công nhưng (4) lỗi: (4) rollback toàn bộ, đơn giữ trạng thái cũ, `payment_transaction` vẫn SUCCEEDED; retry cùng key bỏ qua bước gọi gateway, làm lại (4), không thu hay hoàn lần hai. `payment_transaction` SUCCEEDED không có hóa đơn tương ứng là dấu hiệu cần đối soát. | Inject lỗi DB ở từng bước 1 đến 4; gateway thành công rồi lỗi lưu trữ; retry cùng key; kiểm tra trạng thái cuối của đơn, phòng, hóa đơn, giao dịch |
| **BR-92** | Mọi chuyển trạng thái đơn và phòng là một cập nhật có điều kiện (`WHERE status = trạng thái đã đọc`, hoặc cột version): đúng một thao tác thành công, các thao tác còn lại nhận 409 và không có tác dụng phụ. Đặt phòng, đổi lịch và chuyển `OUT_OF_SERVICE` khóa bi quan theo loại phòng (`SELECT FOR UPDATE`) để giữ BR-64; check-in khóa lạc quan theo phòng và theo đơn. Các cặp xung đột đã xác định: hủy và no-show (tại đúng 12:00:00 ngày kế, no-show thắng theo BR-24), hủy và check-in, check-in và check-in (BR-82), hai đặt phòng vào suất cuối (BR-64), hai nhân viên dọn cùng nhận hoặc cập nhật một nhiệm vụ (BR-114). | Từng cặp chạy đồng thời sát mốc; DB cuối có đúng một lần chuyển trạng thái, một lần hoàn tiền, phòng giải phóng một lần |

---

## 7. Phụ lục: Dữ liệu Mẫu Cố định (Seed Data)

### 7.1. Ngày lễ (Dương lịch lặp hằng năm - BR-33)
| Ngày | Tên ngày lễ | Đêm lễ dùng để test |
| :--- | :--- | :--- |
| **01/01** | Tết Dương lịch | Đêm 31/12 không lễ, đêm 01/01 lễ |
| **30/04** | Ngày Giải phóng miền Nam | Đêm 29/04 không lễ, đêm 30/04 lễ |
| **01/05** | Quốc tế Lao động | Đêm 01/05 lễ, đêm 02/05 không lễ |
| **02/09** | Quốc khánh | Đêm 02/09 lễ, đêm 03/09 không lễ |

### 7.2. Loại phòng và giá đêm (BR-101)
| Loại phòng | Giá đêm (VNĐ) | Sức chứa tối đa | Số phòng | Danh sách phòng cụ thể |
| :--- | :---: | :---: | :---: | :--- |
| **STANDARD** | 600.000 | 2 người | 3 | 101, 102, 103 |
| **DELUXE** | 1.000.000 | 3 người | 2 | 201, 202 |
| **SUITE** | 1.800.000 | 4 người | 1 | 301 |

*Lưu ý: SUITE chỉ có 1 phòng để phục vụ kiểm thử suất cuối và xung đột tương tranh (BR-64, BR-82).*

### 7.3. Minibar & Giặt ủi (BR-34, BR-35, BR-110)
| Mã mặt hàng | Tên mặt hàng / Dịch vụ | Phân loại | Đơn giá (VNĐ) |
| :--- | :--- | :---: | :---: |
| **MB01** | Nước suối 500 ml | MINIBAR | 15.000 |
| **MB02** | Nước ngọt lon | MINIBAR | 25.000 |
| **MB03** | Bia lon | MINIBAR | 40.000 |
| **MB04** | Snack khoai tây | MINIBAR | 30.000 |
| **MB05** | Rượu vang mini | MINIBAR | 50.000 |
| **LD01** | Giặt ủi (mỗi món) | LAUNDRY | 25.000 |

### 7.4. Mã Voucher khuyến mãi (BR-40, BR-44)
| Mã Voucher | Loại giảm giá | Giá trị | Trần giảm giá | minNights | Thời hạn hiệu lực |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **SALE10** | PERCENT | 10% | 200.000 VNĐ | 2 đêm | 01/01/2026 đến 31/12/2026 |
| **OFF300K** | FIXED | 300.000 VNĐ | Không giới hạn | 1 đêm | 01/01/2026 đến 31/12/2026 |

### 7.5. Tài khoản người dùng mẫu (BR-70 -> BR-75)
| Username | Vai trò (Role) | Mật khẩu mẫu |
| :--- | :--- | :--- |
| `admin01` | **ADMIN** | `Hotel@2026` |
| `quanly01` | **MANAGER** | `Hotel@2026` |
| `letan01` | **RECEPTIONIST** | `Hotel@2026` |
| `donphong01` | **HOUSEKEEPER** | `Hotel@2026` |
| `donphong02` | **HOUSEKEEPER** | `Hotel@2026` |
