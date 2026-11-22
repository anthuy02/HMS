package com.team12.hms.domain;

import com.team12.hms.domain.common.DomainExceptions.IllegalStateTransitionException;
import com.team12.hms.domain.room.Room;
import com.team12.hms.domain.room.RoomStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class RoomDomainTest {

    @Test
    @DisplayName("[BR-69, BR-104] Đưa phòng AVAILABLE sang OUT_OF_SERVICE với lý do hợp lệ")
    void testSetOutOfServiceFromAvailable() {
        Room room = new Room(UUID.randomUUID(), "101", 1, UUID.randomUUID());
        assertEquals(RoomStatus.AVAILABLE, room.getStatus());
        assertFalse(room.isDeleted());

        room.setOutOfService("Sửa chữa điều hòa");
        assertEquals(RoomStatus.OUT_OF_SERVICE, room.getStatus());
        assertEquals("Sửa chữa điều hòa", room.getMaintenanceReason());
    }

    @Test
    @DisplayName("[BR-69] Đưa phòng CLEANING sang OUT_OF_SERVICE thành công")
    void testSetOutOfServiceFromCleaning() {
        Room room = new Room(UUID.randomUUID(), "102", 1, UUID.randomUUID());
        room.setStatus(RoomStatus.CLEANING);

        room.setOutOfService("Sơn lại tường");
        assertEquals(RoomStatus.OUT_OF_SERVICE, room.getStatus());
        assertEquals("Sơn lại tường", room.getMaintenanceReason());
    }

    @Test
    @DisplayName("[BR-104] Lý do bảo trì không hợp lệ: null, rỗng hoặc vượt quá 200 ký tự")
    void testInvalidMaintenanceReason() {
        Room room = new Room(UUID.randomUUID(), "103", 1, UUID.randomUUID());

        assertThrows(IllegalArgumentException.class, () -> room.setOutOfService(null));
        assertThrows(IllegalArgumentException.class, () -> room.setOutOfService("   "));

        String tooLong = "x".repeat(201);
        assertThrows(IllegalArgumentException.class, () -> room.setOutOfService(tooLong));
    }

    @Test
    @DisplayName("[BR-69] Chặn chuyển sang OUT_OF_SERVICE khi phòng đang OCCUPIED hoặc RESERVED")
    void testIllegalTransitionToOutOfService() {
        Room room = new Room(UUID.randomUUID(), "104", 1, UUID.randomUUID());
        room.setStatus(RoomStatus.OCCUPIED);
        assertThrows(IllegalStateTransitionException.class, () -> room.setOutOfService("Sửa khóa"));

        room.setStatus(RoomStatus.RESERVED);
        assertThrows(IllegalStateTransitionException.class, () -> room.setOutOfService("Sửa khóa"));
    }

    @Test
    @DisplayName("[BR-65] Trả phòng về AVAILABLE từ OUT_OF_SERVICE hoặc CLEANING")
    void testReturnToAvailable() {
        Room room = new Room(UUID.randomUUID(), "105", 1, UUID.randomUUID());
        room.setOutOfService("Bảo trì xong");
        assertEquals(RoomStatus.OUT_OF_SERVICE, room.getStatus());

        room.returnToAvailable();
        assertEquals(RoomStatus.AVAILABLE, room.getStatus());
        assertNull(room.getMaintenanceReason());

        // Từ CLEANING về AVAILABLE
        room.setStatus(RoomStatus.CLEANING);
        room.returnToAvailable();
        assertEquals(RoomStatus.AVAILABLE, room.getStatus());
    }

    @Test
    @DisplayName("[BR-65] Chặn trả về AVAILABLE từ OCCUPIED hoặc RESERVED")
    void testIllegalReturnToAvailable() {
        Room room = new Room(UUID.randomUUID(), "106", 1, UUID.randomUUID());
        room.setStatus(RoomStatus.OCCUPIED);
        assertThrows(IllegalStateTransitionException.class, room::returnToAvailable);

        room.setStatus(RoomStatus.RESERVED);
        assertThrows(IllegalStateTransitionException.class, room::returnToAvailable);
    }

    @Test
    @DisplayName("Kiểm tra getters và setters của Room")
    void testGettersAndSetters() {
        Room room = new Room();
        UUID id = UUID.randomUUID();
        UUID typeId = UUID.randomUUID();
        room.setId(id);
        room.setRoomNumber("201");
        room.setFloor(2);
        room.setRoomTypeId(typeId);
        room.setDeleted(true);

        assertEquals(id, room.getId());
        assertEquals("201", room.getRoomNumber());
        assertEquals(2, room.getFloor());
        assertEquals(typeId, room.getRoomTypeId());
        assertTrue(room.isDeleted());
    }
}
