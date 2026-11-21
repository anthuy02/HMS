package com.team12.hms.application.port.out;

import com.team12.hms.domain.room.Room;
import com.team12.hms.domain.room.RoomType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomPort {
    List<Room> findAllRooms();
    Optional<Room> findRoomById(UUID id);
    Optional<Room> findRoomByNumber(String roomNumber);
    Room saveRoom(Room room);
    List<RoomType> findAllRoomTypes();
    Optional<RoomType> findRoomTypeById(UUID id);
    RoomType saveRoomType(RoomType roomType);
    long countAvailableRoomsByTypeId(UUID roomTypeId);
    long countRoomsByStatus(String status);
}
