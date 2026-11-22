package com.team12.hms.infrastructure.persistence.adapter;

import com.team12.hms.application.port.out.RoomPort;
import com.team12.hms.domain.room.Room;
import com.team12.hms.domain.room.RoomStatus;
import com.team12.hms.domain.room.RoomType;
import com.team12.hms.infrastructure.persistence.entity.RoomEntity;
import com.team12.hms.infrastructure.persistence.entity.RoomTypeEntity;
import com.team12.hms.infrastructure.persistence.repository.RoomRepository;
import com.team12.hms.infrastructure.persistence.repository.RoomTypeRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class RoomPersistenceAdapter implements RoomPort {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;

    public RoomPersistenceAdapter(RoomRepository roomRepository, RoomTypeRepository roomTypeRepository) {
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
    }

    @Override
    public List<Room> findAllRooms() {
        return roomRepository.findByDeletedFalse().stream().map(this::toDomainRoom).collect(Collectors.toList());
    }

    @Override
    public Optional<Room> findRoomById(UUID id) {
        return roomRepository.findById(id).map(this::toDomainRoom);
    }

    @Override
    public Optional<Room> findRoomByNumber(String roomNumber) {
        return roomRepository.findByRoomNumber(roomNumber).map(this::toDomainRoom);
    }

    @Override
    public Room saveRoom(Room room) {
        RoomEntity entity = toEntityRoom(room);
        RoomEntity saved = roomRepository.save(entity);
        return toDomainRoom(saved);
    }

    @Override
    public List<RoomType> findAllRoomTypes() {
        return roomTypeRepository.findAll().stream().map(this::toDomainRoomType).collect(Collectors.toList());
    }

    @Override
    public Optional<RoomType> findRoomTypeById(UUID id) {
        return roomTypeRepository.findById(id).map(this::toDomainRoomType);
    }

    @Override
    public RoomType saveRoomType(RoomType roomType) {
        RoomTypeEntity entity = toEntityRoomType(roomType);
        RoomTypeEntity saved = roomTypeRepository.save(entity);
        return toDomainRoomType(saved);
    }

    @Override
    public long countAvailableRoomsByTypeId(UUID roomTypeId) {
        return roomRepository.countByRoomTypeIdAndDeletedFalseAndStatusNot(roomTypeId, "OUT_OF_SERVICE");
    }

    @Override
    public long countRoomsByStatus(String status) {
        return roomRepository.countByStatusAndDeletedFalse(status);
    }

    private Room toDomainRoom(RoomEntity e) {
        if (e == null) return null;
        UUID typeId = e.getRoomType() != null ? e.getRoomType().getId() : null;
        Room r = new Room(e.getId(), e.getRoomNumber(), e.getFloor(), typeId);
        try {
            r.setStatus(RoomStatus.valueOf(e.getStatus().toUpperCase()));
        } catch (Exception ignored) {
            r.setStatus(RoomStatus.AVAILABLE);
        }
        r.setMaintenanceReason(e.getMaintenanceReason());
        r.setDeleted(e.isDeleted());
        return r;
    }

    private RoomEntity toEntityRoom(Room d) {
        if (d == null) return null;
        RoomEntity e = (d.getId() != null)
                ? roomRepository.findById(d.getId()).orElse(new RoomEntity())
                : new RoomEntity();

        if (d.getId() != null) e.setId(d.getId());
        e.setRoomNumber(d.getRoomNumber());
        e.setFloor(d.getFloor());
        if (d.getRoomTypeId() != null) {
            RoomTypeEntity rt = roomTypeRepository.findById(d.getRoomTypeId()).orElse(null);
            e.setRoomType(rt);
        }
        if (d.getStatus() != null) e.setStatus(d.getStatus().name());
        e.setMaintenanceReason(d.getMaintenanceReason());
        e.setDeleted(d.isDeleted());
        return e;
    }

    private RoomType toDomainRoomType(RoomTypeEntity e) {
        if (e == null) return null;
        return new RoomType(e.getId(), e.getName(), e.getMaxCapacity(), e.getBaseNightlyRate());
    }

    private RoomTypeEntity toEntityRoomType(RoomType d) {
        if (d == null) return null;
        RoomTypeEntity e = (d.getId() != null)
                ? roomTypeRepository.findById(d.getId()).orElse(new RoomTypeEntity())
                : new RoomTypeEntity();
        if (d.getId() != null) e.setId(d.getId());
        e.setName(d.getName());
        e.setMaxCapacity(d.getMaxCapacity());
        e.setBaseNightlyRate(d.getBaseNightlyRate());
        return e;
    }
}
