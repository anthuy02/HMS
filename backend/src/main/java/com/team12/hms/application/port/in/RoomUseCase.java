package com.team12.hms.application.port.in;

import com.team12.hms.domain.room.Room;
import com.team12.hms.domain.room.RoomType;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface RoomUseCase {
    List<Room> getAllRooms();
    List<RoomType> getAllRoomTypes();
    Room createRoom(Map<String, Object> data);
    Room updateRoomStatus(UUID roomId, String newStatus, String reason);
    RoomType createRoomType(Map<String, Object> data);
}
