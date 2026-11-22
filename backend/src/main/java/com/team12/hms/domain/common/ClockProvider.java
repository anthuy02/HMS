package com.team12.hms.domain.common;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/**
 * [BR-06] Múi giờ nghiệp vụ cố định là Asia/Ho_Chi_Minh (UTC+7).
 */
public interface ClockProvider {
    ZoneId ZONE_VN = ZoneId.of("Asia/Ho_Chi_Minh");

    Instant now();

    default ZonedDateTime nowZoned() {
        return now().atZone(ZONE_VN);
    }

    default LocalDate today() {
        return nowZoned().toLocalDate();
    }
}
