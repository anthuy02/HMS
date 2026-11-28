-- =====================================================================
-- HMS – Lược đồ cơ sở dữ liệu PostgreSQL v2 (bám SRS 4.3)
-- Đồ án SE113 – Nhóm 12
-- Migration Flyway: V1__init_schema.sql
-- Yêu cầu: PostgreSQL >= 14 (đã chạy trên Neon PostgreSQL 17).
--
-- Nguồn: TEAM12_SRS.docx mục 4.3 (Table 2–16) cho bảng và cột;
--        docs/BR_v1.2.md cho ràng buộc. BR thắng SRS khi mâu thuẫn.
--
-- Quy ước
--   * Tên bảng, cột: snake_case của tên trong SRS 4.3. Không có cột ngoài SRS.
--   * PK UUID (ứng dụng sinh, có DEFAULT gen_random_uuid() cho seed/test).
--   * Tiền NUMERIC(15,0) (VNĐ nguyên); tỷ lệ NUMERIC(5,2) (30.00 = 30 %).
--   * Thời điểm TIMESTAMPTZ lưu UTC; ngày, giờ nghiệp vụ (DATE, TIME) là giờ
--     địa phương Asia/Ho_Chi_Minh (BR-06).
--   * Enum: VARCHAR + CHECK. version: BIGINT, khóa lạc quan (BR-92).
--   * Mỗi điều kiện nguyên tử của BR là một ràng buộc có tên riêng, để test
--     chỉ ra đúng ràng buộc bị vi phạm.
--   * Ràng buộc CSDL là lưới an toàn thứ hai; logic chính ở domain.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;   -- EXCLUDE (uuid WITH =, range WITH &&)

-- ---------------------------------------------------------------------
-- Table 2 – USERS (F01)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    user_id                UUID         NOT NULL DEFAULT gen_random_uuid(),
    username               VARCHAR(30)  NOT NULL,
    password_hash          VARCHAR(255) NOT NULL,                     -- BR-76: chỉ lưu băm
    role                   VARCHAR(20)  NOT NULL,
    active                 BOOLEAN      NOT NULL DEFAULT TRUE,        -- BR-93: vô hiệu hóa, không xóa
    failed_login_attempts  SMALLINT     NOT NULL DEFAULT 0,           -- BR-71, BR-78
    locked_until           TIMESTAMPTZ,                               -- BR-71 (mốc mở)
    version                BIGINT       NOT NULL DEFAULT 0,           -- BR-94
    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT ck_user_username CHECK (username ~ '^[A-Za-z0-9._]{4,30}$'),          -- BR-93
    CONSTRAINT ck_user_role     CHECK (role IN ('ADMIN','MANAGER','RECEPTIONIST','HOUSEKEEPER')),  -- BR-75
    CONSTRAINT ck_user_failed   CHECK (failed_login_attempts BETWEEN 0 AND 5)     -- BR-71
);
-- BR-93: username duy nhất không phân biệt hoa thường
CREATE UNIQUE INDEX ux_user_username_ci ON users (lower(username));

-- ---------------------------------------------------------------------
-- Table 3 – AUTH_TOKENS (BR-72, BR-73, BR-93)
-- ---------------------------------------------------------------------
CREATE TABLE auth_tokens (
    token_value    VARCHAR(128) NOT NULL,
    user_id        UUID         NOT NULL,
    role_snapshot  VARCHAR(20)  NOT NULL,
    issued_at      TIMESTAMPTZ  NOT NULL,
    expires_at     TIMESTAMPTZ  NOT NULL,
    revoked        BOOLEAN      NOT NULL DEFAULT FALSE,   -- đăng xuất, vô hiệu hóa, đổi vai trò
    CONSTRAINT pk_auth_tokens PRIMARY KEY (token_value),
    CONSTRAINT fk_token_user  FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT ck_token_role  CHECK (role_snapshot IN ('ADMIN','MANAGER','RECEPTIONIST','HOUSEKEEPER')),
    CONSTRAINT ck_token_ttl   CHECK (expires_at = issued_at + INTERVAL '30 minutes')  -- BR-72
);
CREATE INDEX ix_token_user_active ON auth_tokens (user_id) WHERE NOT revoked;

-- ---------------------------------------------------------------------
-- Table 4 – ROOM_TYPES (F02)
-- Khóa theo loại phòng (BR-92) là SELECT ... FOR UPDATE, không cần cột version.
-- ---------------------------------------------------------------------
CREATE TABLE room_types (
    room_type_id       UUID          NOT NULL DEFAULT gen_random_uuid(),
    room_type_name     VARCHAR(50)   NOT NULL,
    base_nightly_rate  NUMERIC(15,0) NOT NULL,
    max_capacity       SMALLINT      NOT NULL,
    CONSTRAINT pk_room_types PRIMARY KEY (room_type_id),
    CONSTRAINT ck_room_type_name     CHECK (length(btrim(room_type_name)) > 0),          -- BR-101
    CONSTRAINT ck_room_type_rate     CHECK (base_nightly_rate BETWEEN 1 AND 100000000),  -- BR-101
    CONSTRAINT ck_room_type_capacity CHECK (max_capacity BETWEEN 1 AND 6)                -- BR-32, BR-101
);
-- BR-101, OPEN-11: tên duy nhất không phân biệt hoa thường sau khi trim
CREATE UNIQUE INDEX ux_room_type_name_ci ON room_types (lower(btrim(room_type_name)));

-- ---------------------------------------------------------------------
-- Table 5 – ROOMS (F02)
-- ---------------------------------------------------------------------
CREATE TABLE rooms (
    room_id             UUID         NOT NULL DEFAULT gen_random_uuid(),
    room_number         VARCHAR(10)  NOT NULL,
    room_type_id        UUID         NOT NULL,
    status              VARCHAR(20)  NOT NULL DEFAULT 'AVAILABLE',
    maintenance_reason  VARCHAR(200),
    ever_used           BOOLEAN      NOT NULL DEFAULT FALSE,   -- BR-102: đã từng gắn với đơn
    deleted             BOOLEAN      NOT NULL DEFAULT FALSE,   -- BR-102, BR-120: xóa mềm (OPEN-18)
    version             BIGINT       NOT NULL DEFAULT 0,       -- BR-92
    CONSTRAINT pk_rooms PRIMARY KEY (room_id),
    -- BR-102: không xóa loại phòng còn phòng
    CONSTRAINT fk_rooms_room_type FOREIGN KEY (room_type_id) REFERENCES room_types (room_type_id) ON DELETE RESTRICT,
    CONSTRAINT ck_room_number CHECK (room_number ~ '^[A-Za-z0-9]{1,10}$'),             -- BR-100
    CONSTRAINT ck_room_status CHECK (status IN
        ('AVAILABLE','RESERVED','OCCUPIED','CLEANING','OUT_OF_SERVICE')),              -- BR-65
    -- BR-104: OUT_OF_SERVICE bắt buộc lý do 1–200 ký tự sau trim
    CONSTRAINT ck_room_oos_reason_required CHECK (status <> 'OUT_OF_SERVICE' OR (
        maintenance_reason IS NOT NULL AND length(btrim(maintenance_reason)) BETWEEN 1 AND 200)),
    -- BR-104: lý do chỉ có khi đang OUT_OF_SERVICE
    CONSTRAINT ck_room_reason_only_oos CHECK (status = 'OUT_OF_SERVICE' OR maintenance_reason IS NULL),
    -- BR-102: chỉ xóa (mềm) phòng chưa từng gắn với đơn nào ...
    CONSTRAINT ck_room_delete_never_used CHECK (NOT deleted OR NOT ever_used),
    -- ... và đang AVAILABLE
    CONSTRAINT ck_room_delete_available  CHECK (NOT deleted OR status = 'AVAILABLE')
);
-- BR-100: số phòng duy nhất (không phân biệt hoa thường) trong các phòng chưa xóa
CREATE UNIQUE INDEX ux_room_number_ci ON rooms (lower(room_number)) WHERE NOT deleted;
CREATE INDEX ix_room_type_status ON rooms (room_type_id, status) WHERE NOT deleted;

-- BR-102: DELETE vật lý chỉ cho phòng AVAILABLE chưa từng gắn với đơn
-- (đường thường là xóa mềm; xóa cứng dùng khi dọn phòng trước khi xóa loại phòng).
CREATE FUNCTION fn_room_delete_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.ever_used OR OLD.status <> 'AVAILABLE' THEN
        RAISE EXCEPTION 'room % has been used or is not AVAILABLE and cannot be deleted (BR-102)', OLD.room_number
            USING ERRCODE = 'check_violation', CONSTRAINT = 'trg_room_delete_guard';
    END IF;
    RETURN OLD;
END $$;
CREATE TRIGGER trg_room_delete_guard
    BEFORE DELETE ON rooms
    FOR EACH ROW EXECUTE FUNCTION fn_room_delete_guard();

-- ---------------------------------------------------------------------
-- Table 6 – RESERVATIONS (F03)
-- ---------------------------------------------------------------------
CREATE TABLE reservations (
    reservation_id                 UUID          NOT NULL DEFAULT gen_random_uuid(),
    booking_type                   VARCHAR(10)   NOT NULL,
    room_type_id                   UUID          NOT NULL,
    assigned_room_id               UUID,                                  -- BR-08, BR-81
    created_by_user_id             UUID          NOT NULL,
    status                         VARCHAR(20)   NOT NULL DEFAULT 'CONFIRMED',

    -- Thông tin khách (BR-09, BR-27)
    guest_name                     VARCHAR(100)  NOT NULL,
    guest_phone                    VARCHAR(11)   NOT NULL,
    guest_email                    VARCHAR(100),
    vip_guest                      BOOLEAN       NOT NULL DEFAULT FALSE,  -- BR-41

    -- Số khách (BR-31, BR-32), đếm tại ngày check-in, chốt lúc đặt
    adult_count                    SMALLINT      NOT NULL,
    child_6to11_count              SMALLINT      NOT NULL DEFAULT 0,
    child_under6_count             SMALLINT      NOT NULL DEFAULT 0,

    -- Khoảng thuê (giờ địa phương, BR-06)
    check_in_date                  DATE          NOT NULL,
    check_out_date                 DATE          NOT NULL,
    hourly_start_time              TIME,                                  -- chỉ HOURLY
    hourly_duration_hours          SMALLINT,                              -- chỉ HOURLY

    -- Cọc (BR-20, BR-24, BR-26)
    deposit_required               NUMERIC(15,0) NOT NULL,
    deposit_paid                   NUMERIC(15,0) NOT NULL DEFAULT 0,
    deposit_forfeited              BOOLEAN       NOT NULL DEFAULT FALSE,  -- OPEN-17

    -- Snapshot giá (BR-55); voucher lưu theo giá trị, không FK
    snap_nightly_rate              NUMERIC(15,0) NOT NULL,
    snap_voucher_code              VARCHAR(30),
    snap_voucher_type              VARCHAR(10),
    snap_voucher_value             NUMERIC(10,2),
    snap_voucher_max_discount      NUMERIC(15,0),
    snap_deposit_rate_percent      NUMERIC(5,2)  NOT NULL,
    snap_service_fee_rate_percent  NUMERIC(5,2)  NOT NULL,
    snap_vat_rate_percent          NUMERIC(5,2)  NOT NULL,

    -- Mốc thời gian (BR-10, BR-11, BR-24, BR-121, BR-122)
    created_at                     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    cancelled_at                   TIMESTAMPTZ,
    no_show_at                     TIMESTAMPTZ,
    actual_check_in_time           TIMESTAMPTZ,
    actual_check_out_time          TIMESTAMPTZ,
    version                        BIGINT        NOT NULL DEFAULT 0,      -- BR-92

    CONSTRAINT pk_reservations PRIMARY KEY (reservation_id),
    CONSTRAINT fk_res_room_type     FOREIGN KEY (room_type_id)       REFERENCES room_types (room_type_id),
    CONSTRAINT fk_res_assigned_room FOREIGN KEY (assigned_room_id)   REFERENCES rooms (room_id),
    CONSTRAINT fk_res_created_by    FOREIGN KEY (created_by_user_id) REFERENCES users (user_id),

    CONSTRAINT ck_res_booking_type CHECK (booking_type IN ('NIGHTLY','HOURLY')),          -- BR-05
    CONSTRAINT ck_res_status CHECK (status IN
        ('CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED','NO_SHOW')),                  -- BR-66

    -- NIGHTLY (BR-03, BR-05)
    CONSTRAINT ck_res_nightly_no_hourly CHECK (booking_type <> 'NIGHTLY'
        OR (hourly_start_time IS NULL AND hourly_duration_hours IS NULL)),
    CONSTRAINT ck_res_nightly_nights CHECK (booking_type <> 'NIGHTLY'
        OR (check_out_date - check_in_date) BETWEEN 1 AND 30),

    -- HOURLY (BR-04, BR-05)
    CONSTRAINT ck_res_hourly_fields CHECK (booking_type <> 'HOURLY'
        OR (hourly_start_time IS NOT NULL AND hourly_duration_hours IS NOT NULL)),
    CONSTRAINT ck_res_hourly_same_day CHECK (booking_type <> 'HOURLY'
        OR check_out_date = check_in_date),
    -- BR-04: mốc đóng hai đầu, 06:00 <= giờ bắt đầu <= 22:00
    CONSTRAINT ck_res_hourly_start CHECK (booking_type <> 'HOURLY'
        OR hourly_start_time BETWEEN TIME '06:00' AND TIME '22:00'),
    CONSTRAINT ck_res_hourly_hours CHECK (booking_type <> 'HOURLY'
        OR hourly_duration_hours BETWEEN 1 AND 10),
    -- BR-04, OPEN-15: kết thúc <= 24:00 (mốc đóng, đúng 24:00 hợp lệ), so đến micro giây
    CONSTRAINT ck_res_hourly_end CHECK (booking_type <> 'HOURLY'
        OR extract(epoch FROM hourly_start_time) + hourly_duration_hours * 3600 <= 86400),
    CONSTRAINT ck_res_hourly_no_voucher CHECK (booking_type <> 'HOURLY'
        OR snap_voucher_code IS NULL),                                                    -- BR-40
    CONSTRAINT ck_res_hourly_guests CHECK (booking_type <> 'HOURLY'
        OR adult_count + child_6to11_count <= 2),                                         -- BR-32

    -- BR-09
    CONSTRAINT ck_res_guest_name_trimmed CHECK (guest_name = btrim(guest_name)),
    CONSTRAINT ck_res_guest_name_length  CHECK (length(guest_name) BETWEEN 1 AND 100),
    CONSTRAINT ck_res_guest_phone CHECK (guest_phone ~ '^[0-9]{9,11}$'),
    -- BR-09: dạng tên@miền (không bắt dấu chấm), khớp GuestInfo ở domain
    CONSTRAINT ck_res_guest_email CHECK (guest_email IS NULL OR guest_email ~ '^[^@\s]+@[^@\s]+$'),

    -- BR-31, BR-32 (sức chứa theo loại phòng kiểm ở domain vì cần đọc bảng khác)
    CONSTRAINT ck_res_adults      CHECK (adult_count >= 1),
    CONSTRAINT ck_res_child_6to11 CHECK (child_6to11_count >= 0),
    CONSTRAINT ck_res_child_under6 CHECK (child_under6_count BETWEEN 0 AND 2),

    -- BR-20, BR-26 (cọc yêu cầu có thể làm tròn về 0)
    CONSTRAINT ck_res_deposit_required CHECK (deposit_required >= 0),
    CONSTRAINT ck_res_deposit_paid     CHECK (deposit_paid >= 0),
    -- BR-21, BR-24, OPEN-17: chỉ đơn CANCELLED hoặc NO_SHOW mới có cọc mất
    CONSTRAINT ck_res_forfeited_status CHECK (NOT deposit_forfeited OR status IN ('CANCELLED','NO_SHOW')),

    -- BR-55, BR-88: snapshot giá và tỷ lệ
    CONSTRAINT ck_res_snap_rate         CHECK (snap_nightly_rate BETWEEN 1 AND 100000000),
    CONSTRAINT ck_res_snap_deposit_rate CHECK (snap_deposit_rate_percent > 0 AND snap_deposit_rate_percent <= 100),
    CONSTRAINT ck_res_snap_fee_rate     CHECK (snap_service_fee_rate_percent BETWEEN 0 AND 20),
    CONSTRAINT ck_res_snap_vat_rate     CHECK (snap_vat_rate_percent BETWEEN 0 AND 20),

    -- BR-44, BR-55: snapshot voucher đầy đủ hoặc trống
    CONSTRAINT ck_res_voucher_snap_complete CHECK (
        (snap_voucher_code IS NULL AND snap_voucher_type IS NULL
            AND snap_voucher_value IS NULL AND snap_voucher_max_discount IS NULL)
        OR (snap_voucher_code IS NOT NULL AND snap_voucher_type IS NOT NULL
            AND snap_voucher_value IS NOT NULL)),
    CONSTRAINT ck_res_voucher_snap_type CHECK (snap_voucher_type IS NULL
        OR snap_voucher_type IN ('PERCENT','FIXED')),
    CONSTRAINT ck_res_voucher_snap_percent CHECK (snap_voucher_type IS DISTINCT FROM 'PERCENT'
        OR (snap_voucher_value > 0 AND snap_voucher_value <= 100)),
    CONSTRAINT ck_res_voucher_snap_fixed CHECK (snap_voucher_type IS DISTINCT FROM 'FIXED'
        OR (snap_voucher_value > 0 AND snap_voucher_value = trunc(snap_voucher_value)
            AND snap_voucher_max_discount IS NULL)),
    CONSTRAINT ck_res_voucher_snap_max CHECK (snap_voucher_max_discount IS NULL
        OR snap_voucher_max_discount > 0),

    -- BR-66: mốc thời gian khớp trạng thái
    CONSTRAINT ck_res_cancelled_at  CHECK (status <> 'CANCELLED' OR cancelled_at IS NOT NULL),
    CONSTRAINT ck_res_no_show_at    CHECK (status <> 'NO_SHOW'   OR no_show_at   IS NOT NULL),
    CONSTRAINT ck_res_checkin_time  CHECK (status NOT IN ('CHECKED_IN','CHECKED_OUT')
                                           OR actual_check_in_time IS NOT NULL),
    CONSTRAINT ck_res_checkin_room  CHECK (status NOT IN ('CHECKED_IN','CHECKED_OUT')
                                           OR assigned_room_id IS NOT NULL),
    CONSTRAINT ck_res_checked_out_at CHECK (status <> 'CHECKED_OUT' OR actual_check_out_time IS NOT NULL),
    -- BR-08, BR-24: hủy, no-show làm mất liên kết với phòng (bỏ gán)
    CONSTRAINT ck_res_released_room CHECK (status NOT IN ('CANCELLED','NO_SHOW') OR assigned_room_id IS NULL)
);

-- BR-60, BR-06: khoảng chiếm nửa mở [start, end) theo giờ địa phương.
-- NIGHTLY: ngày check-in 14:00 đến ngày check-out 12:00; HOURLY: giờ bắt đầu
-- đến giờ bắt đầu + số giờ. Mọi đơn cùng múi giờ Asia/Ho_Chi_Minh nên so sánh
-- trên timestamp không múi giờ là đúng, và hàm là IMMUTABLE (dùng được trong
-- EXCLUDE và index) mà không cần thêm cột ngoài SRS.
CREATE FUNCTION reservation_occupancy(bt VARCHAR, d_in DATE, d_out DATE, h_start TIME, h_hours SMALLINT)
RETURNS tsrange LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
    SELECT CASE WHEN bt = 'NIGHTLY'
        THEN tsrange(d_in + TIME '14:00', d_out + TIME '12:00', '[)')
        ELSE tsrange(d_in + h_start, d_in + h_start + h_hours * INTERVAL '1 hour', '[)')
    END
$$;

-- BR-60, BR-63, BR-64 (lưới an toàn cấp PHÒNG): một phòng không có hai đơn đang
-- hiệu lực chồng khoảng chiếm. Đơn trả 12:00 và đơn nhận 14:00 cùng ngày không
-- xung đột. Nguồn cung theo LOẠI phòng (BR-61) giữ bằng SELECT ... FOR UPDATE
-- trên room_types (BR-92), vì đơn CONFIRMED chưa chắc đã gán phòng.
ALTER TABLE reservations ADD CONSTRAINT ex_res_room_no_overlap
    EXCLUDE USING gist (
        assigned_room_id WITH =,
        reservation_occupancy(booking_type, check_in_date, check_out_date,
                              hourly_start_time, hourly_duration_hours) WITH &&)
    WHERE (assigned_room_id IS NOT NULL AND status IN ('CONFIRMED','CHECKED_IN'));

-- BR-82: một phòng tối đa một đơn CHECKED_IN
CREATE UNIQUE INDEX ux_res_one_checked_in_per_room
    ON reservations (assigned_room_id) WHERE status = 'CHECKED_IN';

-- BR-61: đếm nhu cầu theo loại phòng và khoảng
CREATE INDEX ix_res_type_active_period ON reservations USING gist (
    room_type_id,
    reservation_occupancy(booking_type, check_in_date, check_out_date,
                          hourly_start_time, hourly_duration_hours))
    WHERE status IN ('CONFIRMED','CHECKED_IN');
-- BR-121, BR-122: thống kê theo kỳ
CREATE INDEX ix_res_created_at    ON reservations (created_at);
CREATE INDEX ix_res_cancelled_at  ON reservations (cancelled_at)          WHERE cancelled_at IS NOT NULL;
CREATE INDEX ix_res_no_show_at    ON reservations (no_show_at)            WHERE no_show_at IS NOT NULL;
CREATE INDEX ix_res_check_out_at  ON reservations (actual_check_out_time) WHERE actual_check_out_time IS NOT NULL;

-- BR-102 (DB-F01): phòng từng được gán cho đơn nào thì ever_used = TRUE mãi mãi,
-- kể cả khi sau đó bỏ gán (no-show BR-24, đổi lịch BR-25). Gán một phòng đã xóa
-- mềm sẽ vi phạm ck_room_delete_never_used và bị chặn.
CREATE FUNCTION fn_room_mark_ever_used() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE rooms SET ever_used = TRUE
     WHERE room_id = NEW.assigned_room_id AND NOT ever_used;
    RETURN NULL;
END $$;
CREATE TRIGGER trg_room_mark_ever_used
    AFTER INSERT OR UPDATE OF assigned_room_id ON reservations
    FOR EACH ROW WHEN (NEW.assigned_room_id IS NOT NULL)
    EXECUTE FUNCTION fn_room_mark_ever_used();

-- ---------------------------------------------------------------------
-- Table 7 – RESERVATION_HOLIDAY_NIGHTS (BR-33, BR-55): snapshot đêm lễ
-- ---------------------------------------------------------------------
CREATE TABLE reservation_holiday_nights (
    reservation_id  UUID       NOT NULL,
    month_day       VARCHAR(5) NOT NULL,
    CONSTRAINT pk_reservation_holiday_nights PRIMARY KEY (reservation_id, month_day),
    CONSTRAINT fk_rhn_reservation FOREIGN KEY (reservation_id)
        REFERENCES reservations (reservation_id) ON DELETE CASCADE,
    CONSTRAINT ck_rhn_month_day_format CHECK (month_day ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'),
    CONSTRAINT ck_rhn_month_day_valid  CHECK (month_day NOT IN
        ('02-29','02-30','02-31','04-31','06-31','09-31','11-31'))
);

-- ---------------------------------------------------------------------
-- Table 8 – VOUCHERS (BR-40, BR-44)
-- Lưu ý: NUMERIC(10,2) tự làm tròn số có hơn 2 chữ số thập phân; việc TỪ CHỐI
-- giá trị như 10.125 (BR-44) do domain kiểm.
-- ---------------------------------------------------------------------
CREATE TABLE vouchers (
    code          VARCHAR(30)   NOT NULL,
    type          VARCHAR(10)   NOT NULL,
    value         NUMERIC(10,2) NOT NULL,
    max_discount  NUMERIC(15,0),
    min_nights    SMALLINT      NOT NULL DEFAULT 1,
    valid_from    DATE          NOT NULL,
    valid_to      DATE          NOT NULL,
    CONSTRAINT pk_vouchers PRIMARY KEY (code),
    CONSTRAINT ck_voucher_code_nonempty CHECK (length(btrim(code)) > 0),
    CONSTRAINT ck_voucher_type          CHECK (type IN ('PERCENT','FIXED')),
    CONSTRAINT ck_voucher_percent_value CHECK (type <> 'PERCENT' OR (value > 0 AND value <= 100)),
    CONSTRAINT ck_voucher_fixed_value   CHECK (type <> 'FIXED' OR (value > 0 AND value = trunc(value))),
    CONSTRAINT ck_voucher_fixed_no_max  CHECK (type <> 'FIXED' OR max_discount IS NULL),
    CONSTRAINT ck_voucher_max_discount  CHECK (max_discount IS NULL OR max_discount > 0),
    CONSTRAINT ck_voucher_min_nights    CHECK (min_nights >= 1),
    CONSTRAINT ck_voucher_period        CHECK (valid_from <= valid_to)
);
-- BR-44: mã duy nhất không phân biệt hoa thường
CREATE UNIQUE INDEX ux_voucher_code_ci ON vouchers (lower(code));

-- ---------------------------------------------------------------------
-- Table 9 – SYSTEM_CONFIG (BR-88): bảng một dòng
-- ---------------------------------------------------------------------
CREATE TABLE system_config (
    id                        SMALLINT     NOT NULL DEFAULT 1,
    deposit_rate_percent      NUMERIC(5,2) NOT NULL DEFAULT 30.00,
    service_fee_rate_percent  NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    vat_rate_percent          NUMERIC(5,2) NOT NULL DEFAULT 10.00,
    updated_at                TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT pk_system_config PRIMARY KEY (id),
    CONSTRAINT ck_config_singleton   CHECK (id = 1),
    CONSTRAINT ck_config_deposit     CHECK (deposit_rate_percent > 0 AND deposit_rate_percent <= 100),
    CONSTRAINT ck_config_service_fee CHECK (service_fee_rate_percent BETWEEN 0 AND 20),
    CONSTRAINT ck_config_vat         CHECK (vat_rate_percent BETWEEN 0 AND 20)
);

-- ---------------------------------------------------------------------
-- Table 10 – HOLIDAYS (BR-33, BR-89): ngày lễ dương lịch lặp hằng năm
-- ---------------------------------------------------------------------
CREATE TABLE holidays (
    month_day     VARCHAR(5)   NOT NULL,
    holiday_name  VARCHAR(100) NOT NULL,
    CONSTRAINT pk_holidays PRIMARY KEY (month_day),                         -- BR-89: không trùng
    CONSTRAINT ck_holiday_month_day_format CHECK (month_day ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'),
    -- BR-89: ngày có thật, không 29/02
    CONSTRAINT ck_holiday_month_day_valid  CHECK (month_day NOT IN
        ('02-29','02-30','02-31','04-31','06-31','09-31','11-31')),
    CONSTRAINT ck_holiday_name CHECK (length(btrim(holiday_name)) > 0)
);

-- ---------------------------------------------------------------------
-- Table 11 – SERVICE_CATALOG_ITEMS (BR-110)
-- ---------------------------------------------------------------------
CREATE TABLE service_catalog_items (
    code        VARCHAR(10)   NOT NULL,
    name        VARCHAR(100)  NOT NULL,
    category    VARCHAR(10)   NOT NULL,
    unit_price  NUMERIC(15,0) NOT NULL,
    active      BOOLEAN       NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_service_catalog_items PRIMARY KEY (code),
    CONSTRAINT ck_catalog_code     CHECK (code ~ '^[A-Za-z0-9]{2,10}$'),
    CONSTRAINT ck_catalog_name     CHECK (length(btrim(name)) BETWEEN 1 AND 100),
    CONSTRAINT ck_catalog_category CHECK (category IN ('MINIBAR','LAUNDRY')),
    CONSTRAINT ck_catalog_price    CHECK (unit_price BETWEEN 1 AND 5000000)
);
CREATE UNIQUE INDEX ux_catalog_code_ci ON service_catalog_items (lower(code));

-- ---------------------------------------------------------------------
-- Table 12 – SERVICE_CHARGE_LINES (BR-34 đến BR-37, BR-55)
-- ---------------------------------------------------------------------
CREATE TABLE service_charge_lines (
    charge_line_id       UUID          NOT NULL DEFAULT gen_random_uuid(),
    reservation_id       UUID          NOT NULL,
    created_by_user_id   UUID          NOT NULL,
    service_type         VARCHAR(10)   NOT NULL,
    item_code            VARCHAR(10),
    quantity             SMALLINT      NOT NULL,
    unit_price_snapshot  NUMERIC(15,0) NOT NULL,          -- BR-55: chốt lúc thêm
    damage_note          VARCHAR(200),
    CONSTRAINT pk_service_charge_lines PRIMARY KEY (charge_line_id),
    CONSTRAINT fk_scl_reservation FOREIGN KEY (reservation_id)     REFERENCES reservations (reservation_id),
    CONSTRAINT fk_scl_created_by  FOREIGN KEY (created_by_user_id) REFERENCES users (user_id),
    CONSTRAINT fk_scl_item        FOREIGN KEY (item_code)          REFERENCES service_catalog_items (code),
    CONSTRAINT ck_scl_type CHECK (service_type IN ('MINIBAR','LAUNDRY','DAMAGE')),
    -- MINIBAR, LAUNDRY (BR-34, BR-35)
    CONSTRAINT ck_scl_item_required CHECK (service_type = 'DAMAGE' OR item_code IS NOT NULL),
    CONSTRAINT ck_scl_item_quantity CHECK (service_type = 'DAMAGE' OR quantity BETWEEN 1 AND 99),
    CONSTRAINT ck_scl_item_price    CHECK (service_type = 'DAMAGE' OR unit_price_snapshot > 0),
    CONSTRAINT ck_scl_item_no_note  CHECK (service_type = 'DAMAGE' OR damage_note IS NULL),
    -- DAMAGE (BR-36)
    CONSTRAINT ck_scl_damage_no_item  CHECK (service_type <> 'DAMAGE' OR item_code IS NULL),
    CONSTRAINT ck_scl_damage_quantity CHECK (service_type <> 'DAMAGE' OR quantity = 1),
    CONSTRAINT ck_scl_damage_price    CHECK (service_type <> 'DAMAGE' OR unit_price_snapshot BETWEEN 1 AND 50000000),
    CONSTRAINT ck_scl_damage_note     CHECK (service_type <> 'DAMAGE' OR (
        damage_note IS NOT NULL AND length(btrim(damage_note)) BETWEEN 1 AND 200))
);
CREATE INDEX ix_scl_reservation ON service_charge_lines (reservation_id);

-- ---------------------------------------------------------------------
-- Table 13 – CLEANING_TASKS (BR-111 đến BR-114)
-- Thứ tự PENDING -> IN_PROGRESS -> DONE (BR-112) kiểm ở domain: SRS không có
-- cột thời điểm bắt đầu nên CSDL không chứng minh được bước IN_PROGRESS.
-- ---------------------------------------------------------------------
CREATE TABLE cleaning_tasks (
    task_id                  UUID         NOT NULL DEFAULT gen_random_uuid(),
    room_id                  UUID         NOT NULL,
    reservation_id           UUID         NOT NULL,
    assigned_housekeeper_id  UUID,                                  -- BR-113 (vai trò kiểm ở domain)
    status                   VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),
    completed_at             TIMESTAMPTZ,
    version                  BIGINT       NOT NULL DEFAULT 0,       -- BR-114
    CONSTRAINT pk_cleaning_tasks PRIMARY KEY (task_id),
    CONSTRAINT fk_task_room        FOREIGN KEY (room_id)                 REFERENCES rooms (room_id),
    CONSTRAINT fk_task_reservation FOREIGN KEY (reservation_id)          REFERENCES reservations (reservation_id),
    CONSTRAINT fk_task_assignee    FOREIGN KEY (assigned_housekeeper_id) REFERENCES users (user_id),
    -- BR-111: một lần check-out sinh đúng một nhiệm vụ (retry không tạo thêm)
    CONSTRAINT uq_task_reservation UNIQUE (reservation_id),
    CONSTRAINT ck_task_status CHECK (status IN ('PENDING','IN_PROGRESS','DONE','CANCELLED')),  -- BR-112
    CONSTRAINT ck_task_assignee CHECK (status NOT IN ('IN_PROGRESS','DONE')
                                       OR assigned_housekeeper_id IS NOT NULL),
    CONSTRAINT ck_task_completed_at CHECK ((status = 'DONE') = (completed_at IS NOT NULL))
);
-- BR-111, BR-114: mỗi phòng tối đa một nhiệm vụ chưa kết thúc
CREATE UNIQUE INDEX ux_task_one_open_per_room
    ON cleaning_tasks (room_id) WHERE status IN ('PENDING','IN_PROGRESS');
CREATE INDEX ix_task_assignee ON cleaning_tasks (assigned_housekeeper_id, status);

-- ---------------------------------------------------------------------
-- Table 14 – INVOICES (BR-50 đến BR-54)
-- Doanh thu theo kỳ (BR-122) tính theo reservations.actual_check_out_time.
-- ---------------------------------------------------------------------
CREATE TABLE invoices (
    invoice_id                UUID          NOT NULL DEFAULT gen_random_uuid(),
    reservation_id            UUID          NOT NULL,
    issued_by_user_id         UUID          NOT NULL,           -- BR-93 (DB-F06)
    status                    VARCHAR(10)   NOT NULL DEFAULT 'ISSUED',
    -- Các dòng BR-50, mỗi dòng đã làm tròn đúng một lần ở tầng ứng dụng
    room_charge               NUMERIC(15,0) NOT NULL,
    holiday_surcharge         NUMERIC(15,0) NOT NULL DEFAULT 0,
    early_check_in_surcharge  NUMERIC(15,0) NOT NULL DEFAULT 0,
    late_check_out_surcharge  NUMERIC(15,0) NOT NULL DEFAULT 0,
    extra_adult_surcharge     NUMERIC(15,0) NOT NULL DEFAULT 0,
    extra_child_surcharge     NUMERIC(15,0) NOT NULL DEFAULT 0,
    discount                  NUMERIC(15,0) NOT NULL DEFAULT 0,
    service_fee_base          NUMERIC(15,0) NOT NULL,
    service_fee               NUMERIC(15,0) NOT NULL,
    extra_services_total      NUMERIC(15,0) NOT NULL DEFAULT 0,
    taxable_amount            NUMERIC(15,0) NOT NULL,
    vat_amount                NUMERIC(15,0) NOT NULL,
    total_amount              NUMERIC(15,0) NOT NULL,
    deposit_paid              NUMERIC(15,0) NOT NULL,
    amount_due                NUMERIC(15,0) NOT NULL,           -- âm = hoàn cho khách (BR-84)
    issued_at                 TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT pk_invoices PRIMARY KEY (invoice_id),
    CONSTRAINT fk_inv_reservation FOREIGN KEY (reservation_id)    REFERENCES reservations (reservation_id),
    CONSTRAINT fk_inv_issued_by   FOREIGN KEY (issued_by_user_id) REFERENCES users (user_id),
    CONSTRAINT uq_inv_reservation UNIQUE (reservation_id),                       -- 0..1 hóa đơn mỗi đơn
    CONSTRAINT ck_inv_status CHECK (status = 'ISSUED'),                           -- BR-54
    CONSTRAINT ck_inv_non_negative CHECK (
        room_charge >= 0 AND holiday_surcharge >= 0 AND early_check_in_surcharge >= 0
        AND late_check_out_surcharge >= 0 AND extra_adult_surcharge >= 0 AND extra_child_surcharge >= 0
        AND service_fee >= 0 AND extra_services_total >= 0 AND vat_amount >= 0 AND deposit_paid >= 0),
    CONSTRAINT ck_inv_discount CHECK (discount BETWEEN 0 AND room_charge),       -- BR-43
    -- BR-50, BR-53: các tổng là cộng/trừ các dòng, không làm tròn lại
    CONSTRAINT ck_inv_step5  CHECK (service_fee_base = room_charge - discount + holiday_surcharge
                                    + early_check_in_surcharge + late_check_out_surcharge
                                    + extra_adult_surcharge + extra_child_surcharge),
    CONSTRAINT ck_inv_step8  CHECK (taxable_amount = service_fee_base + service_fee + extra_services_total),
    CONSTRAINT ck_inv_step10 CHECK (total_amount = taxable_amount + vat_amount),
    CONSTRAINT ck_inv_step11 CHECK (amount_due = total_amount - deposit_paid)
);
CREATE INDEX ix_inv_issued_at ON invoices (issued_at);

-- BR-54: hóa đơn ISSUED bất biến
CREATE FUNCTION fn_invoice_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'invoice % is ISSUED and immutable (BR-54)', OLD.invoice_id
        USING ERRCODE = 'check_violation', CONSTRAINT = 'trg_invoice_immutable';
END $$;
CREATE TRIGGER trg_invoice_immutable
    BEFORE UPDATE OR DELETE ON invoices
    FOR EACH ROW EXECUTE FUNCTION fn_invoice_immutable();

-- ---------------------------------------------------------------------
-- Table 15 – PAYMENT_TRANSACTIONS (BR-26, BR-84 đến BR-86, BR-90, BR-91)
-- ---------------------------------------------------------------------
CREATE TABLE payment_transactions (
    transaction_id      VARCHAR(64)   NOT NULL,              -- BR-90: sinh từ Idempotency-Key
    reservation_id      UUID,                                -- rỗng: thu cọc trước khi có đơn (DB-F05)
    invoice_id          UUID,                                -- gán ở bước (4) BR-91 (DB-F04)
    created_by_user_id  UUID          NOT NULL,              -- DB-F06
    type                VARCHAR(25)   NOT NULL,
    amount              NUMERIC(15,0) NOT NULL,
    status              VARCHAR(10)   NOT NULL,
    idempotency_key     VARCHAR(64)   NOT NULL,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),  -- BR-122: báo cáo tiền hoàn
    CONSTRAINT pk_payment_transactions PRIMARY KEY (transaction_id),
    CONSTRAINT fk_txn_reservation FOREIGN KEY (reservation_id)     REFERENCES reservations (reservation_id),
    CONSTRAINT fk_txn_invoice     FOREIGN KEY (invoice_id)         REFERENCES invoices (invoice_id),
    CONSTRAINT fk_txn_created_by  FOREIGN KEY (created_by_user_id) REFERENCES users (user_id),
    CONSTRAINT uq_txn_idempotency_key UNIQUE (idempotency_key),                         -- BR-90
    CONSTRAINT ck_txn_type CHECK (type IN
        ('DEPOSIT_CHARGE','DEPOSIT_REFUND','CHECKOUT_CHARGE','CHECKOUT_REFUND')),
    CONSTRAINT ck_txn_amount CHECK (amount > 0),
    CONSTRAINT ck_txn_status CHECK (status IN ('SUCCEEDED','FAILED')),
    -- BR-26, BR-91: chỉ lần thu cọc lúc tạo đơn mới được ghi khi chưa có đơn
    CONSTRAINT ck_txn_reservation_required CHECK (reservation_id IS NOT NULL OR type = 'DEPOSIT_CHARGE'),
    -- BR-91: hóa đơn chỉ gắn với giao dịch check-out. KHÔNG bắt buộc có hóa đơn:
    -- giao dịch được ghi ở bước (3), trước khi hóa đơn được tạo ở bước (4).
    CONSTRAINT ck_txn_invoice_checkout_only CHECK (invoice_id IS NULL
        OR type IN ('CHECKOUT_CHARGE','CHECKOUT_REFUND'))
);
CREATE INDEX ix_txn_reservation ON payment_transactions (reservation_id);
CREATE INDEX ix_txn_created_at  ON payment_transactions (created_at);
-- BR-86: tối đa một lần thu và một lần hoàn check-out SUCCEEDED mỗi đơn
CREATE UNIQUE INDEX ux_txn_one_checkout_charge
    ON payment_transactions (reservation_id) WHERE type = 'CHECKOUT_CHARGE' AND status = 'SUCCEEDED';
CREATE UNIQUE INDEX ux_txn_one_checkout_refund
    ON payment_transactions (reservation_id) WHERE type = 'CHECKOUT_REFUND' AND status = 'SUCCEEDED';

-- ---------------------------------------------------------------------
-- Table 16 – IDEMPOTENCY_RECORDS (BR-90, BR-91)
-- Hết hạn khi now >= created_at + 24 giờ (ứng dụng tính, BR-90).
-- ---------------------------------------------------------------------
CREATE TABLE idempotency_records (
    idempotency_key     VARCHAR(64)  NOT NULL,
    request_hash        CHAR(64)     NOT NULL,          -- SHA-256 hex; khác nội dung => 422
    response_status     SMALLINT,                        -- NULL = đang xử lý: BR-91 bước (2) lưu t trước khi có phản hồi
    response_body_json  JSONB,
    locked_timestamp    TIMESTAMPTZ,                     -- BR-91 bước (2): chốt thời điểm t
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT pk_idempotency_records PRIMARY KEY (idempotency_key),
    CONSTRAINT ck_idem_hash   CHECK (request_hash ~ '^[0-9a-f]{64}$'),
    CONSTRAINT ck_idem_status CHECK (response_status BETWEEN 100 AND 599)
);
CREATE INDEX ix_idem_created_at ON idempotency_records (created_at);
