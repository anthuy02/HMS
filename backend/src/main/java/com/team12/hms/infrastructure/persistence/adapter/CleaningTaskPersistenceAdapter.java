package com.team12.hms.infrastructure.persistence.adapter;

import com.team12.hms.application.port.out.CleaningTaskPort;
import com.team12.hms.domain.housekeeping.CleaningTask;
import com.team12.hms.infrastructure.persistence.entity.CleaningTaskEntity;
import com.team12.hms.infrastructure.persistence.entity.RoomEntity;
import com.team12.hms.infrastructure.persistence.entity.UserEntity;
import com.team12.hms.infrastructure.persistence.repository.CleaningTaskRepository;
import com.team12.hms.infrastructure.persistence.repository.RoomRepository;
import com.team12.hms.infrastructure.persistence.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class CleaningTaskPersistenceAdapter implements CleaningTaskPort {

    private final CleaningTaskRepository cleaningTaskRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public CleaningTaskPersistenceAdapter(CleaningTaskRepository cleaningTaskRepository,
                                         RoomRepository roomRepository,
                                         UserRepository userRepository) {
        this.cleaningTaskRepository = cleaningTaskRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<CleaningTask> findAll() {
        return cleaningTaskRepository.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public Optional<CleaningTask> findById(UUID id) {
        return cleaningTaskRepository.findById(id).map(this::toDomain);
    }

    @Override
    public CleaningTask save(CleaningTask task) {
        CleaningTaskEntity entity = toEntity(task);
        CleaningTaskEntity saved = cleaningTaskRepository.save(entity);
        return toDomain(saved);
    }

    private CleaningTask toDomain(CleaningTaskEntity e) {
        if (e == null) return null;
        CleaningTask d = new CleaningTask();
        d.setId(e.getId());
        if (e.getRoom() != null) {
            d.setRoomId(e.getRoom().getId());
            d.setRoomNumber(e.getRoom().getRoomNumber());
        }
        if (e.getHousekeeper() != null) {
            d.setHousekeeperId(e.getHousekeeper().getId());
            d.setHousekeeperName(e.getHousekeeper().getFullName());
        }
        d.setStatus(e.getStatus());
        d.setNotes(e.getNotes());
        d.setCreatedAt(e.getCreatedAt());
        d.setCompletedAt(e.getCompletedAt());
        return d;
    }

    private CleaningTaskEntity toEntity(CleaningTask d) {
        if (d == null) return null;
        CleaningTaskEntity e = (d.getId() != null)
                ? cleaningTaskRepository.findById(d.getId()).orElse(new CleaningTaskEntity())
                : new CleaningTaskEntity();

        if (d.getId() != null) e.setId(d.getId());
        if (d.getRoomId() != null) {
            RoomEntity rm = roomRepository.findById(d.getRoomId()).orElse(null);
            e.setRoom(rm);
        }
        if (d.getHousekeeperId() != null) {
            UserEntity u = userRepository.findById(d.getHousekeeperId()).orElse(null);
            e.setHousekeeper(u);
        }
        e.setStatus(d.getStatus());
        e.setNotes(d.getNotes());
        e.setCompletedAt(d.getCompletedAt());
        return e;
    }
}
