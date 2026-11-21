package com.team12.hms.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "cleaning_tasks")
public class CleaningTaskEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    private RoomEntity room;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to_user_id")
    private UserEntity assignedTo;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    public CleaningTaskEntity() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public RoomEntity getRoom() { return room; }
    public void setRoom(RoomEntity room) { this.room = room; }
    public UserEntity getAssignedTo() { return assignedTo; }
    public void setAssignedTo(UserEntity assignedTo) { this.assignedTo = assignedTo; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public UserEntity getHousekeeper() { return assignedTo; }
    public void setHousekeeper(UserEntity housekeeper) { this.assignedTo = housekeeper; }
}
