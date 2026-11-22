package com.team12.hms.application.service;

import com.team12.hms.application.port.in.ServiceHkUseCase;
import com.team12.hms.application.port.out.CleaningTaskPort;
import com.team12.hms.application.port.out.RoomPort;
import com.team12.hms.domain.common.ClockProvider;
import com.team12.hms.domain.housekeeping.CleaningTask;
import com.team12.hms.domain.room.Room;
import com.team12.hms.domain.room.RoomStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ServiceHkAppService implements ServiceHkUseCase {

    private final CleaningTaskPort cleaningTaskPort;
    private final RoomPort roomPort;
    private final ClockProvider clockProvider;

    public ServiceHkAppService(CleaningTaskPort cleaningTaskPort,
                               RoomPort roomPort,
                               ClockProvider clockProvider) {
        this.cleaningTaskPort = cleaningTaskPort;
        this.roomPort = roomPort;
        this.clockProvider = clockProvider;
    }

    @Override
    public List<CleaningTask> getAllTasks() {
        return cleaningTaskPort.findAll();
    }

    @Override
    @Transactional
    public CleaningTask updateTaskStatus(UUID taskId, String newStatus) {
        CleaningTask task = cleaningTaskPort.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhiệm vụ dọn phòng."));

        String currentStatus = task.getStatus();

        // BR-112: PENDING -> IN_PROGRESS -> DONE
        if ("IN_PROGRESS".equalsIgnoreCase(newStatus)) {
            if (!"PENDING".equalsIgnoreCase(currentStatus)) {
                throw new IllegalStateException("[BR-112] Chỉ chuyển sang IN_PROGRESS từ PENDING.");
            }
            task.setStatus("IN_PROGRESS");
        } else if ("DONE".equalsIgnoreCase(newStatus)) {
            if (!"IN_PROGRESS".equalsIgnoreCase(currentStatus)) {
                throw new IllegalStateException("[BR-112] Cấm nhảy cóc: Phải nhận việc (IN_PROGRESS) trước khi hoàn tất (DONE).");
            }
            task.setStatus("DONE");
            task.setCompletedAt(clockProvider.now());

            // BR-65, BR-112: Phòng tự động chuyển từ CLEANING sang AVAILABLE
            if (task.getRoomId() != null) {
                roomPort.findRoomById(task.getRoomId()).ifPresent(room -> {
                    if (room.getStatus() == RoomStatus.CLEANING) {
                        room.setStatus(RoomStatus.AVAILABLE);
                        roomPort.saveRoom(room);
                    }
                });
            }
        } else {
            task.setStatus(newStatus.toUpperCase());
        }

        return cleaningTaskPort.save(task);
    }
}
