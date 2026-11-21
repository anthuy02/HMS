package com.team12.hms.infrastructure.persistence.repository;

import com.team12.hms.infrastructure.persistence.entity.RoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<RoomEntity, UUID> {
    Optional<RoomEntity> findByRoomNumber(String roomNumber);
    List<RoomEntity> findByDeletedFalse();
    long countByStatusAndDeletedFalse(String status);
    long countByRoomTypeIdAndDeletedFalseAndStatusNot(UUID roomTypeId, String status);
}
