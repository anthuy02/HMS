package com.team12.hms.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "rooms")
public class RoomEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "room_number", unique = true, nullable = false, length = 10)
    private String roomNumber;

    @Column(nullable = false)
    private int floor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomTypeEntity roomType;

    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE";

    @Column(name = "maintenance_reason", length = 200)
    private String maintenanceReason;

    @Column(nullable = false)
    private boolean deleted = false;

    public RoomEntity() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public int getFloor() { return floor; }
    public void setFloor(int floor) { this.floor = floor; }
    public RoomTypeEntity getRoomType() { return roomType; }
    public void setRoomType(RoomTypeEntity roomType) { this.roomType = roomType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMaintenanceReason() { return maintenanceReason; }
    public void setMaintenanceReason(String maintenanceReason) { this.maintenanceReason = maintenanceReason; }
    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
}
