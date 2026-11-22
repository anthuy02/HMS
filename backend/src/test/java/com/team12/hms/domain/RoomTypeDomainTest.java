package com.team12.hms.domain;

import com.team12.hms.domain.room.RoomType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class RoomTypeDomainTest {

    @Test
    @DisplayName("[BR-101, BR-103] Khởi tạo RoomType hợp lệ với sức chứa 1..6 và đơn giá 1..100M")
    void testValidRoomType() {
        UUID id = UUID.randomUUID();
        RoomType rtMin = new RoomType(id, "Phòng Đơn", 1, BigDecimal.ONE);
        assertEquals(id, rtMin.getId());
        assertEquals("Phòng Đơn", rtMin.getName());
        assertEquals(1, rtMin.getMaxCapacity());
        assertEquals(BigDecimal.ONE, rtMin.getBaseNightlyRate());

        RoomType rtMax = new RoomType(id, "Phòng Tổng Thống", 6, new BigDecimal("100000000"));
        assertEquals(6, rtMax.getMaxCapacity());
        assertEquals(new BigDecimal("100000000"), rtMax.getBaseNightlyRate());
    }

    @Test
    @DisplayName("[BR-101] Sức chứa không hợp lệ (< 1 hoặc > 6) ném ngoại lệ")
    void testInvalidCapacity() {
        UUID id = UUID.randomUUID();
        assertThrows(IllegalArgumentException.class, () ->
                new RoomType(id, "Sai", 0, new BigDecimal("500000")));
        assertThrows(IllegalArgumentException.class, () ->
                new RoomType(id, "Sai", 7, new BigDecimal("500000")));
    }

    @Test
    @DisplayName("[BR-101] Đơn giá đêm không hợp lệ (< 1 hoặc > 100.000.000) ném ngoại lệ")
    void testInvalidRate() {
        UUID id = UUID.randomUUID();
        assertThrows(IllegalArgumentException.class, () ->
                new RoomType(id, "Sai", 2, BigDecimal.ZERO));
        assertThrows(IllegalArgumentException.class, () ->
                new RoomType(id, "Sai", 2, new BigDecimal("-1000")));
        assertThrows(IllegalArgumentException.class, () ->
                new RoomType(id, "Sai", 2, new BigDecimal("100000001")));
    }

    @Test
    @DisplayName("Kiểm tra no-args constructor")
    void testNoArgsConstructor() {
        RoomType rt = new RoomType();
        assertNotNull(rt);
    }
}
