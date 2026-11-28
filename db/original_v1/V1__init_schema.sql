-- =====================================================================
-- HMS – Lược đồ cơ sở dữ liệu PostgreSQL (bám Business Rules v1.2)
-- Đồ án SE113 – Nhóm 12 – người thiết kế: Võ Thành Đạt
-- Phiên bản: V1 (migration Flyway: V1__init_schema.sql)
-- Yêu cầu: PostgreSQL >= 14 (chạy được trên Postgres cục bộ, Docker,
--          Testcontainers và Neon).
--
-- Quy ước chung
--   * Tiền: NUMERIC(15,0) – VNĐ nguyên, ánh xạ sang BigDecimal (không double).
--   * Tỷ lệ: NUMERIC(5,2) – ví dụ 30.00 = 30 %.
--   * Thời điểm: TIMESTAMPTZ (lưu UTC). Ngày nghiệp vụ: DATE theo
--     Asia/Ho_Chi_Minh (BR-06) – tầng ứng dụng quy đổi qua ClockProvider.
--   * Enum: TEXT + CHECK (dễ dùng với JPA @Enumerated(STRING), dễ migrate).
--   * Khóa lạc quan: cột version (BR-92), JPA @Version.
--   * Ràng buộc DB là "lưới an toàn" thứ hai; logic chính vẫn ở domain.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;   -- cho EXCLUDE (id =, range &&)

-- ---------------------------------------------------------------------
-- F01 – Tài khoản, phiên đăng nhập
-- ---------------------------------------------------------------------
CREATE TABLE app_user (
    id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username             VARCHAR(30)  NOT NULL,
    password_hash        VARCHAR(100) NOT NULL,                    -- BR-76: chỉ lưu băm
    role                 TEXT         NOT NULL,
    active               BOOLEAN      NOT NULL DEFAULT TRUE,       -- BR-93: vô hiệu hóa, không xóa
    failed_login_count   SMALLINT     NOT NULL DEFAULT 0,          -- BR-71, BR-78
    locked_until         TIMESTAMPTZ,                              -- BR-71 (mốc mở)
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    version              INTEGER      NOT NULL DEFAULT 0,
    CONSTRAINT ck_user_role     CHECK (role IN ('ADMIN','MANAGER','RECEPTIONIST','HOUSEKEEPER')),
    CONSTRAINT ck_user_username CHECK (username ~ '^[A-Za-z0-9._]{4,30}$'),          -- BR-93
    CONSTRAINT ck_user_failed   CHECK (failed_login_count BETWEEN 0 AND 5)
);
-- BR-93: username duy nhất không phân biệt hoa thường
CREATE UNIQUE INDEX ux_user_username_ci ON app_user (lower(username));

-- BR-72, BR-73, BR-93: token 30 phút, thu hồi khi đăng xuất / đổi vai trò / vô hiệu hóa
CREATE TABLE auth_token (
    jti          UUID         PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES app_user(id),
    issued_at    TIMESTAMPTZ  NOT NULL,
    expires_at   TIMESTAMPTZ  NOT NULL,
    revoked_at   TIMESTAMPTZ,
    CONSTRAINT ck_token_ttl CHECK (expires_at = issued_at + INTERVAL '30 minutes')
);
CREATE INDEX ix_token_user_active ON auth_token (user_id) WHERE revoked_at IS NULL;

-- ---------------------------------------------------------------------
-- Cấu hình hệ thống (BR-88) – bảng một dòng
-- ---------------------------------------------------------------------
CREATE TABLE system_config (
    id                 SMALLINT     PRIMARY KEY DEFAULT 1,
    deposit_rate       NUMERIC(5,2) NOT NULL DEFAULT 30.00,
    service_fee_rate   NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    vat_rate           NUMERIC(5,2) NOT NULL DEFAULT 10.00,
    updated_by         BIGINT       REFERENCES app_user(id),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    version            INTEGER      NOT NULL DEFAULT 0,
    CONSTRAINT ck_config_singleton   CHECK (id = 1),
    CONSTRAINT ck_config_deposit     CHECK (deposit_rate > 0 AND deposit_rate <= 100),
    CONSTRAINT ck_config_service_fee CHECK (service_fee_rate BETWEEN 0 AND 20),
    CONSTRAINT ck_config_vat         CHECK (vat_rate BETWEEN 0 AND 20)
);

-- BR-89: ngày lễ dương lịch lặp hằng năm, không trùng, không 29/02
CREATE TABLE holiday (
    id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    month   SMALLINT     NOT NULL,
    day     SMALLINT     NOT NULL,
    name    VARCHAR(100) NOT NULL,
    CONSTRAINT ux_holiday_month_day UNIQUE (month, day),
    CONSTRAINT ck_holiday_valid_date CHECK (
        month BETWEEN 1 AND 12
        AND day >= 1
        AND day <= CASE WHEN month = 2 THEN 28
                        WHEN month IN (4,6,9,11) THEN 30
                        ELSE 31 END)                        -- loại 31/04 và 29/02
);

-- ---------------------------------------------------------------------
-- F02 – Phòng
-- ---------------------------------------------------------------------
CREATE TABLE room_type (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name           VARCHAR(50)    NOT NULL,
    max_capacity   SMALLINT       NOT NULL,                  -- BR-101, BR-32
    nightly_rate   NUMERIC(15,0)  NOT NULL,                  -- BR-101
    version        INTEGER        NOT NULL DEFAULT 0,        -- khóa theo loại phòng (BR-92)
    CONSTRAINT ck_room_type_capacity CHECK (max_capacity BETWEEN 1 AND 6),
    CONSTRAINT ck_room_type_rate     CHECK (nightly_rate BETWEEN 1 AND 100000000)
);
CREATE UNIQUE INDEX ux_room_type_name_ci ON room_type (lower(name));

CREATE TABLE room (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_number             VARCHAR(10)  NOT NULL,
    room_type_id            BIGINT       NOT NULL REFERENCES room_type(id),   -- BR-102: RESTRICT
    status                  TEXT         NOT NULL DEFAULT 'AVAILABLE',        -- BR-100
    out_of_service_reason   VARCHAR(200),                                     -- BR-104
    version                 INTEGER      NOT NULL DEFAULT 0,                  -- BR-92
    CONSTRAINT ck_room_number CHECK (room_number ~ '^[A-Za-z0-9]{1,10}$'),
    CONSTRAINT ck_room_status CHECK (status IN
        ('AVAILABLE','RESERVED','OCCUPIED','CLEANING','OUT_OF_SERVICE')),
    CONSTRAINT ck_room_oos_reason CHECK (
        (status = 'OUT_OF_SERVICE'
            AND out_of_service_reason IS NOT NULL
            AND length(btrim(out_of_service_reason)) BETWEEN 1 AND 200)
        OR (status <> 'OUT_OF_SERVICE' AND out_of_service_reason IS NULL))
);
CREATE UNIQUE INDEX ux_room_number_ci ON room (lower(room_number));
CREATE INDEX ix_room_type_status ON room (room_type_id, status);

-- ---------------------------------------------------------------------
-- Voucher (BR-40, BR-44)
-- ---------------------------------------------------------------------
CREATE TABLE voucher (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code           VARCHAR(30)   NOT NULL,
    type           TEXT          NOT NULL,
    percent        NUMERIC(5,2),
    fixed_amount   NUMERIC(15,0),
    max_discount   NUMERIC(15,0),
    min_nights     SMALLINT      NOT NULL DEFAULT 1,
    valid_from     DATE          NOT NULL,
    valid_to       DATE          NOT NULL,
    version        INTEGER       NOT NULL DEFAULT 0,
    CONSTRAINT ck_voucher_code   CHECK (length(btrim(code)) > 0),
    CONSTRAINT ck_voucher_type   CHECK (type IN ('PERCENT','FIXED')),
    CONSTRAINT ck_voucher_shape  CHECK (
        (type = 'PERCENT' AND percent > 0 AND percent <= 100
             AND fixed_amount IS NULL
             AND (max_discount IS NULL OR max_discount > 0))
        OR
        (type = 'FIXED' AND fixed_amount > 0
             AND percent IS NULL AND max_discount IS NULL)),
    CONSTRAINT ck_voucher_min_nights CHECK (min_nights >= 1),
    CONSTRAINT ck_voucher_period     CHECK (valid_from <= valid_to)
);
CREATE UNIQUE INDEX ux_voucher_code_ci ON voucher (lower(code));

-- ---------------------------------------------------------------------
-- F03 – Đơn đặt phòng
-- ---------------------------------------------------------------------
CREATE TABLE reservation (
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_type          TEXT          NOT NULL,                 -- BR-05
    status                TEXT          NOT NULL DEFAULT 'CONFIRMED',  -- BR-66
    room_type_id          BIGINT        NOT NULL REFERENCES room_type(id),
    assigned_room_id      BIGINT        REFERENCES room(id),      -- BR-08 (gán trước hoặc lúc check-in)

    -- Thông tin khách (BR-09, BR-27)
    guest_name            VARCHAR(100)  NOT NULL,
    guest_phone           VARCHAR(11)   NOT NULL,
    guest_email           VARCHAR(100),
    guest_vip             BOOLEAN       NOT NULL DEFAULT FALSE,   -- BR-41 (tier VIP)

    -- Khoảng thuê
    check_in_date         DATE,                                   -- NIGHTLY
    check_out_date        DATE,                                   -- NIGHTLY
    hourly_start          TIMESTAMPTZ,                            -- HOURLY
    hourly_hours          SMALLINT,                               -- HOURLY
    occupancy_start       TIMESTAMPTZ   NOT NULL,                 -- BR-60: tầng ứng dụng tính
    occupancy_end         TIMESTAMPTZ   NOT NULL,                 --        theo giờ VN (14:00/12:00)

    -- Số khách (BR-30 đến BR-32) – đếm tại ngày check-in, chốt lúc đặt
    adults                SMALLINT      NOT NULL,
    children_6_11         SMALLINT      NOT NULL DEFAULT 0,
    children_under_6      SMALLINT      NOT NULL DEFAULT 0,

    -- Snapshot giá và cấu hình (BR-55)
    nightly_rate_snap     NUMERIC(15,0) NOT NULL,
    deposit_rate_snap     NUMERIC(5,2)  NOT NULL,
    service_fee_rate_snap NUMERIC(5,2)  NOT NULL,
    vat_rate_snap         NUMERIC(5,2)  NOT NULL,
    voucher_id            BIGINT        REFERENCES voucher(id),
    voucher_type_snap     TEXT,
    voucher_percent_snap  NUMERIC(5,2),
    voucher_fixed_snap    NUMERIC(15,0),
    voucher_max_snap      NUMERIC(15,0),
    voucher_min_nights_snap SMALLINT,

    -- Tiền cọc (BR-20, BR-26) và cọc mất (BR-122)
    deposit_required      NUMERIC(15,0) NOT NULL,
    deposit_paid          NUMERIC(15,0) NOT NULL DEFAULT 0,
    deposit_forfeited     NUMERIC(15,0) NOT NULL DEFAULT 0,

    -- Mốc thời gian (BR-10, BR-11, BR-121, BR-122)
    created_by            BIGINT        NOT NULL REFERENCES app_user(id),
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
    actual_check_in_at    TIMESTAMPTZ,
    actual_check_out_at   TIMESTAMPTZ,
    cancelled_at          TIMESTAMPTZ,
    no_show_at            TIMESTAMPTZ,
    version               INTEGER       NOT NULL DEFAULT 0,       -- BR-92

    CONSTRAINT ck_res_type   CHECK (booking_type IN ('NIGHTLY','HOURLY')),
    CONSTRAINT ck_res_status CHECK (status IN
        ('CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED','NO_SHOW')),

    -- BR-05, BR-03, BR-04: mỗi loại đơn có đúng bộ trường của nó
    CONSTRAINT ck_res_nightly_shape CHECK (booking_type <> 'NIGHTLY' OR (
        check_in_date IS NOT NULL AND check_out_date IS NOT NULL
        AND hourly_start IS NULL AND hourly_hours IS NULL
        AND (check_out_date - check_in_date) BETWEEN 1 AND 30)),
    CONSTRAINT ck_res_hourly_shape CHECK (booking_type <> 'HOURLY' OR (
        hourly_start IS NOT NULL AND hourly_hours BETWEEN 1 AND 10
        AND check_in_date IS NULL AND check_out_date IS NULL
        AND voucher_id IS NULL                                  -- BR-40: HOURLY không voucher
        AND adults + children_6_11 <= 2)),                      -- BR-32 HOURLY
    CONSTRAINT ck_res_occupancy CHECK (occupancy_start < occupancy_end),

    -- BR-09
    CONSTRAINT ck_res_guest_name  CHECK (guest_name = btrim(guest_name)
                                         AND length(guest_name) BETWEEN 1 AND 100),
    CONSTRAINT ck_res_guest_phone CHECK (guest_phone ~ '^[0-9]{9,11}$'),
    CONSTRAINT ck_res_guest_email CHECK (guest_email IS NULL
                                         OR guest_email ~ '^[^@\s]+@[^@\s]+$'),

    -- BR-32 (phần không phụ thuộc loại phòng; sức chứa theo loại kiểm ở domain)
    CONSTRAINT ck_res_guests CHECK (adults >= 1 AND children_6_11 >= 0
                                    AND children_under_6 BETWEEN 0 AND 2),

    -- BR-55: snapshot voucher đi kèm voucher
    CONSTRAINT ck_res_voucher_snap CHECK (
        (voucher_id IS NULL AND voucher_type_snap IS NULL)
        OR (voucher_id IS NOT NULL AND voucher_type_snap IN ('PERCENT','FIXED')
            AND voucher_min_nights_snap >= 1)),

    -- BR-20, BR-26
    CONSTRAINT ck_res_deposit CHECK (deposit_required >= 0 AND deposit_paid >= 0
                                     AND deposit_forfeited BETWEEN 0 AND deposit_paid),

    -- BR-66: mốc thời gian khớp trạng thái
    CONSTRAINT ck_res_status_stamps CHECK (
        (status <> 'CANCELLED' OR cancelled_at IS NOT NULL)
        AND (status <> 'NO_SHOW' OR no_show_at IS NOT NULL)
        AND (status NOT IN ('CHECKED_IN','CHECKED_OUT')
             OR (actual_check_in_at IS NOT NULL AND assigned_room_id IS NOT NULL))
        AND (status <> 'CHECKED_OUT' OR actual_check_out_at IS NOT NULL))
);

-- BR-64 / BR-60 (lưới an toàn cấp PHÒNG): một phòng cụ thể không có hai đơn
-- đang hiệu lực chồng khoảng chiếm. Khoảng nửa mở [start, end) nên đơn trả 12:00
-- và đơn nhận 14:00 cùng ngày không xung đột.
-- Lưu ý: nguồn cung theo LOẠI phòng (BR-61) vẫn giữ bằng SELECT ... FOR UPDATE
-- trên room_type (BR-92), vì đơn CONFIRMED chưa chắc đã gán phòng.
ALTER TABLE reservation ADD CONSTRAINT ex_res_room_no_overlap
    EXCLUDE USING gist (
        assigned_room_id WITH =,
        tstzrange(occupancy_start, occupancy_end, '[)') WITH &&)
    WHERE (assigned_room_id IS NOT NULL AND status IN ('CONFIRMED','CHECKED_IN'));

-- BR-82: một phòng tối đa một đơn CHECKED_IN
CREATE UNIQUE INDEX ux_res_one_checked_in_per_room
    ON reservation (assigned_room_id) WHERE status = 'CHECKED_IN';

-- Truy vấn còn phòng theo loại (BR-61) và báo cáo (BR-121)
CREATE INDEX ix_res_type_active_period ON reservation USING gist
    (room_type_id, tstzrange(occupancy_start, occupancy_end, '[)'))
    WHERE status IN ('CONFIRMED','CHECKED_IN');
CREATE INDEX ix_res_created_at   ON reservation (created_at);
CREATE INDEX ix_res_cancelled_at ON reservation (cancelled_at) WHERE cancelled_at IS NOT NULL;
CREATE INDEX ix_res_no_show_at   ON reservation (no_show_at)   WHERE no_show_at   IS NOT NULL;

-- BR-55, BR-33: snapshot các đêm lễ của khoảng thuê
CREATE TABLE reservation_holiday_night (
    reservation_id  BIGINT NOT NULL REFERENCES reservation(id) ON DELETE CASCADE,
    night_date      DATE   NOT NULL,
    PRIMARY KEY (reservation_id, night_date)
);

-- BR-31: ngày sinh trẻ em khai báo (truy vết cách đếm children_6_11 / under_6)
CREATE TABLE reservation_child (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reservation_id  BIGINT NOT NULL REFERENCES reservation(id) ON DELETE CASCADE,
    birth_date      DATE   NOT NULL
);
CREATE INDEX ix_res_child_res ON reservation_child (reservation_id);

-- ---------------------------------------------------------------------
-- F06 – Danh mục dịch vụ và dịch vụ phát sinh
-- ---------------------------------------------------------------------
CREATE TABLE service_catalog_item (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code         VARCHAR(10)   NOT NULL,
    name         VARCHAR(100)  NOT NULL,
    kind         TEXT          NOT NULL,
    unit_price   NUMERIC(15,0) NOT NULL,
    active       BOOLEAN       NOT NULL DEFAULT TRUE,
    version      INTEGER       NOT NULL DEFAULT 0,
    CONSTRAINT ck_catalog_code  CHECK (code ~ '^[A-Za-z0-9]{2,10}$'),           -- BR-110
    CONSTRAINT ck_catalog_name  CHECK (length(btrim(name)) BETWEEN 1 AND 100),
    CONSTRAINT ck_catalog_kind  CHECK (kind IN ('MINIBAR','LAUNDRY')),
    CONSTRAINT ck_catalog_price CHECK (unit_price BETWEEN 1 AND 5000000)
);
CREATE UNIQUE INDEX ux_catalog_code_ci ON service_catalog_item (lower(code));

CREATE TABLE service_charge (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reservation_id    BIGINT        NOT NULL REFERENCES reservation(id),
    kind              TEXT          NOT NULL,
    catalog_item_id   BIGINT        REFERENCES service_catalog_item(id),
    quantity          SMALLINT      NOT NULL,
    unit_price        NUMERIC(15,0) NOT NULL,                  -- BR-55: chốt lúc thêm
    amount            NUMERIC(15,0) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    note              VARCHAR(200),
    created_by        BIGINT        NOT NULL REFERENCES app_user(id),
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT ck_svc_kind CHECK (kind IN ('MINIBAR','LAUNDRY','DAMAGE')),
    CONSTRAINT ck_svc_shape CHECK (
        (kind IN ('MINIBAR','LAUNDRY')                          -- BR-34, BR-35
            AND catalog_item_id IS NOT NULL
            AND quantity BETWEEN 1 AND 99 AND unit_price > 0)
        OR
        (kind = 'DAMAGE'                                        -- BR-36
            AND catalog_item_id IS NULL AND quantity = 1
            AND unit_price BETWEEN 1 AND 50000000
            AND note IS NOT NULL AND length(btrim(note)) BETWEEN 1 AND 200))
);
CREATE INDEX ix_svc_reservation ON service_charge (reservation_id);

-- ---------------------------------------------------------------------
-- F05 – Hóa đơn và giao dịch thanh toán
-- ---------------------------------------------------------------------
CREATE TABLE invoice (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reservation_id      BIGINT        NOT NULL UNIQUE REFERENCES reservation(id),
    status              TEXT          NOT NULL DEFAULT 'ISSUED',
    -- 11 bước BR-50 (mỗi dòng đã làm tròn đúng một lần ở tầng ứng dụng)
    room_charge         NUMERIC(15,0) NOT NULL,
    holiday_surcharge   NUMERIC(15,0) NOT NULL DEFAULT 0,
    early_surcharge     NUMERIC(15,0) NOT NULL DEFAULT 0,
    late_surcharge      NUMERIC(15,0) NOT NULL DEFAULT 0,
    extra_adult         NUMERIC(15,0) NOT NULL DEFAULT 0,
    extra_child         NUMERIC(15,0) NOT NULL DEFAULT 0,
    discount            NUMERIC(15,0) NOT NULL DEFAULT 0,
    discount_source     TEXT          NOT NULL DEFAULT 'NONE',
    service_fee_base    NUMERIC(15,0) NOT NULL,
    service_fee         NUMERIC(15,0) NOT NULL,
    services_total      NUMERIC(15,0) NOT NULL DEFAULT 0,
    taxable             NUMERIC(15,0) NOT NULL,
    vat                 NUMERIC(15,0) NOT NULL,
    total               NUMERIC(15,0) NOT NULL,
    deposit_paid        NUMERIC(15,0) NOT NULL,
    amount_due          NUMERIC(15,0) NOT NULL,              -- âm = hoàn cho khách
    check_out_at        TIMESTAMPTZ   NOT NULL,              -- BR-122: doanh thu theo ngày check-out
    issued_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT ck_inv_status CHECK (status = 'ISSUED'),     -- BR-54: chỉ lưu khi đã ISSUED
    CONSTRAINT ck_inv_discount_source CHECK (discount_source IN ('NONE','VIP','VOUCHER')),
    CONSTRAINT ck_inv_non_negative CHECK (
        room_charge >= 0 AND holiday_surcharge >= 0 AND early_surcharge >= 0
        AND late_surcharge >= 0 AND extra_adult >= 0 AND extra_child >= 0
        AND service_fee >= 0 AND services_total >= 0 AND vat >= 0 AND deposit_paid >= 0),
    CONSTRAINT ck_inv_discount CHECK (discount BETWEEN 0 AND room_charge),          -- BR-43
    -- BR-50, BR-53: các tổng là cộng/trừ các dòng, không làm tròn lại
    CONSTRAINT ck_inv_step5 CHECK (service_fee_base = room_charge - discount + holiday_surcharge
                                   + early_surcharge + late_surcharge + extra_adult + extra_child),
    CONSTRAINT ck_inv_step8  CHECK (taxable    = service_fee_base + service_fee + services_total),
    CONSTRAINT ck_inv_step10 CHECK (total      = taxable + vat),
    CONSTRAINT ck_inv_step11 CHECK (amount_due = total - deposit_paid)
);
CREATE INDEX ix_inv_check_out_at ON invoice (check_out_at);

-- BR-54: hóa đơn ISSUED bất biến
CREATE FUNCTION fn_invoice_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'invoice % is ISSUED and immutable (BR-54)', OLD.id
        USING ERRCODE = 'check_violation';
END $$;
CREATE TRIGGER trg_invoice_immutable
    BEFORE UPDATE OR DELETE ON invoice
    FOR EACH ROW EXECUTE FUNCTION fn_invoice_immutable();

-- BR-26, BR-84, BR-86, BR-91: mọi lần gọi Mock gateway
CREATE TABLE payment_transaction (
    id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reservation_id     BIGINT        NOT NULL REFERENCES reservation(id),
    invoice_id         BIGINT        REFERENCES invoice(id),
    purpose            TEXT          NOT NULL,
    direction          TEXT          NOT NULL,
    amount             NUMERIC(15,0) NOT NULL,
    status             TEXT          NOT NULL,
    gateway_txn_id     VARCHAR(100)  NOT NULL,          -- BR-90: sinh từ Idempotency-Key
    idempotency_key    VARCHAR(100)  NOT NULL,
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT ck_txn_purpose   CHECK (purpose IN ('DEPOSIT','CANCEL_REFUND','RESCHEDULE','CHECKOUT')),
    CONSTRAINT ck_txn_direction CHECK (direction IN ('CHARGE','REFUND')),
    CONSTRAINT ck_txn_amount    CHECK (amount > 0),
    CONSTRAINT ck_txn_status    CHECK (status IN ('SUCCEEDED','FAILED')),
    CONSTRAINT ux_txn_gateway_id UNIQUE (gateway_txn_id)
);
CREATE INDEX ix_txn_reservation ON payment_transaction (reservation_id);
-- BR-86: tối đa một giao dịch thu check-out SUCCEEDED cho mỗi đơn (mỗi hóa đơn)
CREATE UNIQUE INDEX ux_txn_one_checkout_charge
    ON payment_transaction (reservation_id)
    WHERE purpose = 'CHECKOUT' AND direction = 'CHARGE' AND status = 'SUCCEEDED';
CREATE UNIQUE INDEX ux_txn_one_checkout_refund
    ON payment_transaction (reservation_id)
    WHERE purpose = 'CHECKOUT' AND direction = 'REFUND' AND status = 'SUCCEEDED';

-- BR-90, BR-91: kho Idempotency-Key (24 giờ)
CREATE TABLE idempotency_record (
    idempotency_key   VARCHAR(100) PRIMARY KEY,
    user_id           BIGINT       NOT NULL REFERENCES app_user(id),
    operation         VARCHAR(50)  NOT NULL,           -- CREATE_RESERVATION, CHECK_OUT, ...
    request_hash      CHAR(64)     NOT NULL,           -- SHA-256 của body: khác body => 422
    captured_at       TIMESTAMPTZ  NOT NULL,           -- BR-91 bước 2: chốt thời điểm t
    response_status   SMALLINT,                         -- NULL = đang xử lý
    response_body     JSONB,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at        TIMESTAMPTZ  NOT NULL,
    CONSTRAINT ck_idem_ttl CHECK (expires_at = created_at + INTERVAL '24 hours')
);
CREATE INDEX ix_idem_expires ON idempotency_record (expires_at);

-- ---------------------------------------------------------------------
-- F06 – Nhiệm vụ dọn phòng (BR-111 đến BR-114)
-- ---------------------------------------------------------------------
CREATE TABLE cleaning_task (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_id          BIGINT       NOT NULL REFERENCES room(id),
    reservation_id   BIGINT       NOT NULL UNIQUE REFERENCES reservation(id),  -- retry không tạo thêm
    status           TEXT         NOT NULL DEFAULT 'PENDING',
    assignee_id      BIGINT       REFERENCES app_user(id),   -- vai trò HOUSEKEEPER kiểm ở domain
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    started_at       TIMESTAMPTZ,
    done_at          TIMESTAMPTZ,
    cancelled_at     TIMESTAMPTZ,
    version          INTEGER      NOT NULL DEFAULT 0,        -- BR-114
    CONSTRAINT ck_task_status CHECK (status IN ('PENDING','IN_PROGRESS','DONE','CANCELLED')),
    CONSTRAINT ck_task_stamps CHECK (
        (status <> 'IN_PROGRESS' OR (started_at IS NOT NULL AND assignee_id IS NOT NULL))
        AND (status <> 'DONE'    OR (done_at IS NOT NULL AND started_at IS NOT NULL))
        AND (status <> 'CANCELLED' OR cancelled_at IS NOT NULL))
);
-- BR-111, BR-114: mỗi phòng tối đa một nhiệm vụ chưa kết thúc
CREATE UNIQUE INDEX ux_task_one_open_per_room
    ON cleaning_task (room_id) WHERE status IN ('PENDING','IN_PROGRESS');
CREATE INDEX ix_task_assignee ON cleaning_task (assignee_id, status);
