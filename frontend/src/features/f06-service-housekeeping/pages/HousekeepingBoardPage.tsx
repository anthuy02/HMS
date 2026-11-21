import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { serviceHkService } from '../../../api/services/serviceHk.service';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useAuth } from '../../../app/providers/AuthProvider';

export const HousekeepingBoardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const currentUserId = user?.id || 'u-donphong01';
  const currentUserName = user?.fullName || 'Nhân viên Buồng phòng';

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['cleaning-tasks'],
    queryFn: serviceHkService.getCleaningTasks,
  });

  // Bước 1: PENDING -> IN_PROGRESS [BR-112]
  const handleStartCleaning = async (taskId: string) => {
    try {
      await serviceHkService.startCleaningTask(taskId, currentUserId, currentUserName);
      queryClient.invalidateQueries({ queryKey: ['cleaning-tasks'] });
      alert('Đã nhận nhiệm vụ dọn phòng (Trạng thái chuyển sang IN_PROGRESS)!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi bắt đầu dọn');
    }
  };

  // Bước 2: IN_PROGRESS -> DONE & Room CLEANING -> AVAILABLE [BR-65, BR-112]
  const handleCompleteCleaning = async (taskId: string, roomNumber: string) => {
    if (!window.confirm(`Xác nhận hoàn tất dọn phòng ${roomNumber}? Phòng sẽ chuyển thẳng từ CLEANING sang AVAILABLE!`)) return;
    try {
      await serviceHkService.completeCleaningTask(taskId);
      queryClient.invalidateQueries({ queryKey: ['cleaning-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      alert(`Đã hoàn tất dọn phòng ${roomNumber}! Phòng đã sẵn sàng đón khách mới (AVAILABLE).`);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi hoàn tất dọn');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
          [F06 - TC_HK_01] Bảng Điều phối Nhiệm vụ Buồng phòng (Housekeeping Tasks)
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Vòng đời 2 bước nghiêm ngặt [BR-112]: <b>PENDING</b> &rarr; <b>IN_PROGRESS</b> &rarr; <b>DONE</b>. Khi DONE, phòng tự động chuyển sang <b>AVAILABLE</b>.
        </p>
      </div>

      {isLoading ? (
        <div>Đang tải danh sách nhiệm vụ...</div>
      ) : tasks.length === 0 ? (
        <div style={{ padding: '32px', backgroundColor: '#fff', borderRadius: '10px', textAlign: 'center', color: '#16a34a', border: '1px solid #dcfce7' }}>
          🎉 Hiện tại không có nhiệm vụ dọn phòng nào đang mở.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                padding: '16px',
                border: '1px solid #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Phòng {task.roomNumber}
                </span>
                <StatusBadge status={task.status} />
              </div>

              <div style={{ fontSize: '13px', color: '#475569' }}>
                <div>Mã nhiệm vụ: <b>{task.id}</b></div>
                <div>Người phụ trách: <b>{task.assignedHousekeeperName || 'Chưa nhận việc'}</b></div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  Khởi tạo: {new Date(task.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                {task.status === 'PENDING' && (
                  <button
                    onClick={() => handleStartCleaning(task.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#0284c7',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}
                  >
                    ▶ Bước 1: Nhận việc &amp; Bắt đầu dọn (IN_PROGRESS)
                  </button>
                )}

                {task.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleCompleteCleaning(task.id, task.roomNumber)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#16a34a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}
                  >
                    ✓ Bước 2: Hoàn tất dọn (DONE &rarr; AVAILABLE)
                  </button>
                )}

                {task.status === 'DONE' && (
                  <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
                    Đã hoàn thành lúc: {new Date(task.completedAt || '').toLocaleTimeString('vi-VN')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
