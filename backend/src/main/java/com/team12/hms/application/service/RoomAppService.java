package com.team12.hms.application.service;

import com.team12.hms.application.port.in.RoomUseCase;
import com.team12.hms.application.port.out.RoomPort;
import com.team12.hms.domain.common.DomainExceptions.IllegalStateTransitionException;
import com.team12.hms.domain.room.Room;
import com.team12.hms.domain.room.RoomStatus;
import com.team12.hms.domain.room.RoomType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class RoomAppService implements RoomUseCase {

    private final RoomPort roomPort;

    public RoomAppService(RoomPort roomPort) {
        this.roomPort = roomPort;
    }

    @Override
    public List<Room> getAllRooms() {
        return roomPort.findAllRooms();
    }

    @Override
    public List<RoomType> getAllRoomTypes() {
        return roomPort.findAllRoomTypes();
    }

    @Override
    @Transactional
    public Room createRoom(Map<String, Object> data) {
        String roomNumber = (String) data.get("roomNumber");
        if (roomPort.findRoomByNumber(roomNumber).isPresent()) {
            throw new IllegalArgumentException("[BR-100] Số phòng đã tồn tại.");
        }

        UUID typeId = UUID.fromString((String) data.get("roomTypeId"));
        RoomType roomType = roomPort.findRoomTypeById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("Loại phòng không tồn tại."));

        int floor = ((Number) data.getOrDefault("floor", 1)).intValue();
        Room room = new Room(UUID.randomUUID(), roomNumber, floor, roomType.getId());
        room.setStatus(RoomStatus.AVAILABLE);

        return roomPort.saveRoom(room);
    }

    @Override
    @Transactional
    public Room updateRoomStatus(UUID roomId, String newStatus, String reason) {
        Room room = roomPort.findRoomById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phòng."));

        if ("OUT_OF_SERVICE".equalsIgnoreCase(newStatus)) {
            // BR-104: Bắt buộc lý do bảo trì
            room.setOutOfService(reason);
        } else if ("AVAILABLE".equalsIgnoreCase(newStatus)) {
            room.returnToAvailable();
        } else if ("CLEANING".equalsIgnoreCase(newStatus)) {
            room.setStatus(RoomStatus.CLEANING);
        } else if ("OCCUPIED".equalsIgnoreCase(newStatus)) {
            room.setStatus(RoomStatus.OCCUPIED);
        } else {
            try {
                room.setStatus(RoomStatus.valueOf(newStatus.toUpperCase()));
            } catch (Exception ex) {
                throw new IllegalArgumentException("Trạng thái phòng không hợp lệ: " + newStatus);
            }
        }

        return roomPort.saveRoom(room);
    }

    @Override
    @Transactional
    public RoomType createRoomType(Map<String, Object> data) {
        String name = (String) data.get("name");
        int capacity = ((Number) data.get("maxCapacity")).intValue();
        BigDecimal rate = new BigDecimal(data.get("baseNightlyRate").toString());

        RoomType roomType = new RoomType(UUID.randomUUID(), name, capacity, rate);
        return roomPort.saveRoomType(roomType);
    }
}
