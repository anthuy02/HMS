import { mockDb } from './mockDb';
import { User, LoginCredentials, AuthResponse, Role } from '../types/rbac.types';
import { Room, RoomStatus, RoomType, CleaningTask } from '../types/room.types';
import { Reservation, AvailabilityQuery, BookingType } from '../types/reservation.types';
import { Invoice, InvoiceItem, PaymentRecord, PaymentMethod } from '../types/billing.types';
import { SystemConfig, Holiday, ServiceCatalogItem, Voucher } from '../types/systemConfig.types';
import {
  validateNightlyDates,
  validateHourlyBooking,
  calculateCancellationRefundRatio,
  calculateEarlyCheckInFee,
  calculateLateCheckOutFee,
} from '../utils/dateValidation';
import { calculateFullInvoice } from '../utils/invoiceCalculator';

export const mockHandlers = {
  // ==========================================
  // [F01] Auth & Users (BR-70..79, BR-93, BR-94)
  // ==========================================
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const users = mockDb.getUsers();
    const identifier = (credentials.username || credentials.email || '').toLowerCase().trim();
    const user = users.find(
      (u) => u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier
    );

    if (!user) {
      throw new Error('Tài khoản hoặc email không tồn tại.');
    }

    if (!user.isActive) {
      throw new Error('Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ Admin (BR-93).');
    }

    // Kiểm tra khóa tài khoản 15 phút (BR-71)
    if (user.lockedUntil) {
      const lockTime = new Date(user.lockedUntil).getTime();
      if (Date.now() < lockTime) {
        const remainingMinutes = Math.ceil((lockTime - Date.now()) / (1000 * 60));
        throw new Error(`Tài khoản tạm thời bị khóa do sai mật khẩu 5 lần. Vui lòng thử lại sau ${remainingMinutes} phút (BR-71).`);
      } else {
        // Hết thời gian khóa -> mở khóa và reset bộ đếm
        user.lockedUntil = null;
        user.failedLoginAttempts = 0;
      }
    }

    if (user.password !== credentials.password) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        mockDb.saveUsers(users);
        throw new Error('Nhập sai mật khẩu 5 lần liên tiếp. Tài khoản đã bị khóa trong 15 phút (BR-71).');
      }
      mockDb.saveUsers(users);
      throw new Error(`Mật khẩu không chính xác. Bạn còn ${5 - user.failedLoginAttempts} lần thử.`);
    }

    // Đăng nhập thành công -> reset bộ đếm
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    mockDb.saveUsers(users);

    const token = `mock-token-${user.id}-${Date.now()}`;
    const { password, ...safeUser } = user;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(safeUser));

    return { token, user: safeUser as User };
  },

  getUsers: async (): Promise<User[]> => {
    const users = mockDb.getUsers();
    return users.map(({ password, ...u }) => u as User);
  },

  createUser: async (
    userData: Omit<User, 'id' | 'createdAt'> & { password?: string },
    operatorRole: Role = 'ADMIN'
  ): Promise<User> => {
    if (operatorRole !== 'ADMIN') {
      throw new Error('Chỉ có vai trò ADMIN mới được phép tạo tài khoản (BR-75, BR-93).');
    }

    const users = mockDb.getUsers();
    if (users.some((u) => u.username.toLowerCase() === userData.username.toLowerCase())) {
      throw new Error(`Username '${userData.username}' đã tồn tại (BR-93).`);
    }

    const newUser: User & { password?: string } = {
      ...userData,
      id: `u-${Date.now()}`,
      isActive: true,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      password: userData.password || 'Hotel@2026',
    };
    users.push(newUser);
    mockDb.saveUsers(users);

    const { password, ...safe } = newUser;
    return safe as User;
  },

  toggleUserActive: async (userId: string, currentAdminId: string): Promise<User> => {
    const users = mockDb.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('Người dùng không tồn tại.');

    // BR-94: Bảo vệ Admin không được tự vô hiệu hóa chính mình
    if (user.id === currentAdminId) {
      throw new Error('Quy tắc [BR-94]: Administrator không được tự vô hiệu hóa tài khoản của chính mình.');
    }

    // BR-94: Luôn còn ít nhất 1 Admin hoạt động
    if (user.role === 'ADMIN' && user.isActive) {
      const activeAdmins = users.filter((u) => u.role === 'ADMIN' && u.isActive);
      if (activeAdmins.length <= 1) {
        throw new Error('Quy tắc [BR-94]: Hệ thống phải duy trì ít nhất 01 tài khoản ADMIN đang hoạt động.');
      }
    }

    user.isActive = !user.isActive;
    mockDb.saveUsers(users);
    const { password, ...safe } = user;
    return safe as User;
  },

  // ==========================================
  // [F02] Room Management (BR-65, BR-69, BR-100..104)
  // ==========================================
  getRooms: async (): Promise<Room[]> => {
    return mockDb.getRooms();
  },

  createRoom: async (roomData: Omit<Room, 'id'>, userRole: Role = 'MANAGER'): Promise<Room> => {
    if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
      throw new Error('Quy tắc [BR-101]: Chỉ có MANAGER hoặc ADMIN mới có quyền tạo phòng mới.');
    }
    const rooms = mockDb.getRooms();
    if (rooms.some((r) => r.roomNumber === roomData.roomNumber)) {
      throw new Error(`Số phòng ${roomData.roomNumber} đã tồn tại trong hệ thống.`);
    }
    const newRoom: Room = {
      ...roomData,
      id: `r-${roomData.roomNumber}-${Date.now()}`,
      status: roomData.status || 'AVAILABLE',
    };
    rooms.push(newRoom);
    mockDb.saveRooms(rooms);
    return newRoom;
  },

  updateRoom: async (
    roomId: string,
    updateData: Partial<Room>,
    userRole: Role
  ): Promise<Room> => {
    // BR-101 & BR-75: Giá phòng chỉ Quản lý (MANAGER) được sửa; ADMIN chỉ xem
    if (updateData.pricePerNight !== undefined && userRole !== 'MANAGER') {
      throw new Error('Quy tắc [BR-101, BR-75]: Chỉ có MANAGER mới được quyền chỉnh sửa đơn giá phòng. ADMIN chỉ có quyền xem.');
    }

    const rooms = mockDb.getRooms();
    const index = rooms.findIndex((r) => r.id === roomId);
    if (index === -1) throw new Error('Không tìm thấy phòng.');

    rooms[index] = { ...rooms[index], ...updateData };
    mockDb.saveRooms(rooms);
    return rooms[index];
  },

  setOutOfService: async (
    roomId: string,
    reason: string,
    userRole: Role
  ): Promise<Room> => {
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      throw new Error('Quy tắc [BR-104]: Chỉ ADMIN và MANAGER mới có quyền đặt phòng bảo trì.');
    }

    const trimmedReason = (reason || '').trim();
    if (!trimmedReason || trimmedReason.length > 200) {
      throw new Error('Quy tắc [BR-104]: Bắt buộc nhập lý do bảo trì dài từ 1 đến 200 ký tự.');
    }

    const rooms = mockDb.getRooms();
    const room = rooms.find((r) => r.id === roomId);
    if (!room) throw new Error('Phòng không tồn tại.');

    // BR-69: Chỉ từ AVAILABLE hoặc CLEANING
    if (room.status !== 'AVAILABLE' && room.status !== 'CLEANING') {
      throw new Error(`Quy tắc [BR-69]: Không thể chuyển phòng sang OUT_OF_SERVICE khi đang ở trạng thái ${room.status}. Phải ở AVAILABLE hoặc CLEANING.`);
    }

    // BR-69 & BR-112: Hủy nhiệm vụ dọn phòng đang mở nếu có
    const cleaningTasks = mockDb.getCleaningTasks();
    cleaningTasks.forEach((t) => {
      if (t.roomId === room.id && (t.status === 'PENDING' || t.status === 'IN_PROGRESS')) {
        t.status = 'CANCELLED';
      }
    });
    mockDb.saveCleaningTasks(cleaningTasks);

    room.status = 'OUT_OF_SERVICE';
    room.maintenanceReason = trimmedReason;
    mockDb.saveRooms(rooms);
    return room;
  },

  returnToService: async (roomId: string, userRole: Role): Promise<Room> => {
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      throw new Error('Quy tắc [BR-104]: Chỉ ADMIN và MANAGER mới có quyền đưa phòng trở lại hoạt động.');
    }

    const rooms = mockDb.getRooms();
    const room = rooms.find((r) => r.id === roomId);
    if (!room) throw new Error('Phòng không tồn tại.');

    if (room.status !== 'OUT_OF_SERVICE') {
      throw new Error('Phòng không ở trạng thái bảo trì.');
    }

    // BR-65: OUT_OF_SERVICE -> AVAILABLE
    room.status = 'AVAILABLE';
    room.maintenanceReason = undefined;
    mockDb.saveRooms(rooms);
    return room;
  },

  // ==========================================
  // [F03] Reservations (BR-01..09, BR-20..27, BR-60..64)
  // ==========================================
  checkAvailability: async (query: AvailabilityQuery): Promise<Room[]> => {
    const { bookingType, checkInDate, checkOutDate, hourlyStartTime, hourlyDurationHours, guestCount = 1, roomType } = query;

    if (bookingType === 'NIGHTLY') {
      const v = validateNightlyDates(checkInDate, checkOutDate);
      if (!v.isValid) throw new Error(v.error);
    } else {
      const v = validateHourlyBooking(checkInDate, hourlyStartTime || '09:00', hourlyDurationHours || 2, guestCount);
      if (!v.isValid) throw new Error(v.error);
    }

    const rooms = mockDb.getRooms();
    const reservations = mockDb.getReservations();

    // Nguồn cung = các phòng không bị OUT_OF_SERVICE (BR-61)
    return rooms.filter((room) => {
      if (room.status === 'OUT_OF_SERVICE') return false;
      if (roomType && room.type !== roomType) return false;
      if (room.maxCapacity < guestCount) return false;

      // Kiểm tra xung đột lịch với các đơn CONFIRMED hoặc CHECKED_IN
      const hasConflict = reservations.some((res) => {
        if (res.roomId !== room.id) return false;
        if (res.status === 'CANCELLED' || res.status === 'CHECKED_OUT' || res.status === 'NO_SHOW') return false;

        if (bookingType === 'NIGHTLY' && res.bookingType === 'NIGHTLY') {
          const startA = new Date(checkInDate).getTime();
          const endA = new Date(checkOutDate).getTime();
          const startB = new Date(res.checkInDate).getTime();
          const endB = new Date(res.checkOutDate).getTime();
          // BR-60: Overlap khi max(startA, startB) < min(endA, endB)
          return Math.max(startA, startB) < Math.min(endA, endB);
        }

        // Nếu trùng ngày với đơn theo giờ hoặc giao nhau
        if (checkInDate === res.checkInDate) {
          return true;
        }

        return false;
      });

      return !hasConflict;
    });
  },

  getReservations: async (): Promise<Reservation[]> => {
    return mockDb.getReservations();
  },

  createReservation: async (
    data: Omit<
      Reservation,
      | 'id'
      | 'reservationCode'
      | 'status'
      | 'depositRequired'
      | 'depositPaid'
      | 'snapNightlyRate'
      | 'snapDepositRatePercent'
      | 'snapServiceFeeRatePercent'
      | 'snapVATRatePercent'
      | 'createdAt'
    >
  ): Promise<Reservation> => {
    // 1. Kiểm tra thông tin khách (BR-09)
    const name = (data.guestInfo.fullName || '').trim();
    if (!name || name.length > 100) {
      throw new Error('Quy tắc [BR-09]: Tên khách hàng bắt buộc và dài từ 1 đến 100 ký tự.');
    }
    const phone = (data.guestInfo.phone || '').trim();
    if (!/^\d{9,11}$/.test(phone)) {
      throw new Error('Quy tắc [BR-09]: Số điện thoại phải gồm 9 đến 11 chữ số.');
    }

    // 2. Validate ngày theo loại (BR-03, BR-04)
    let nights = 1;
    if (data.bookingType === 'NIGHTLY') {
      const v = validateNightlyDates(data.checkInDate, data.checkOutDate);
      if (!v.isValid) throw new Error(v.error);
      nights = v.nights || 1;
    } else {
      const v = validateHourlyBooking(
        data.checkInDate,
        data.hourlyStartTime || '09:00',
        data.hourlyDurationHours || 2,
        data.guestCount
      );
      if (!v.isValid) throw new Error(v.error);
    }

    // 3. Tìm phòng theo category và kiểm tra nguồn cung (BR-61, BR-64)
    const rooms = mockDb.getRooms();
    const availableRooms = await mockHandlers.checkAvailability({
      bookingType: data.bookingType,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      hourlyStartTime: data.hourlyStartTime,
      hourlyDurationHours: data.hourlyDurationHours,
      guestCount: data.guestCount,
      roomType: data.roomType,
    });

    if (availableRooms.length === 0) {
      throw new Error(`Quy tắc [BR-63, BR-64]: Loại phòng ${data.roomType} đã hết phòng trong thời gian yêu cầu.`);
    }

    const assignedRoom = data.roomId ? rooms.find((r) => r.id === data.roomId) : availableRooms[0];
    if (!assignedRoom) throw new Error('Không tìm thấy phòng phù hợp.');

    // 4. Lấy cấu hình hệ thống hiện hành để đóng băng snapshot (BR-55)
    const config = mockDb.getConfig();
    const baseRate = assignedRoom.pricePerNight;

    // Tính tiền phòng cơ sở
    let roomCharge = 0;
    if (data.bookingType === 'NIGHTLY') {
      roomCharge = nights * baseRate;
    } else {
      const duration = data.hourlyDurationHours || 2;
      const ratio = duration <= 3 ? 0.3 : Math.min(1.0, 0.3 + (duration - 3) * 0.1);
      roomCharge = Math.round(baseRate * ratio);
    }

    // Tiền cọc yêu cầu 30% (BR-20)
    const depositRequired = Math.round((roomCharge * config.depositRatePercent) / 100);

    const reservations = mockDb.getReservations();
    const newRes: Reservation = {
      ...data,
      id: `res-${Date.now()}`,
      reservationCode: `RSV-${assignedRoom.roomNumber}-${Date.now().toString().slice(-4)}`,
      roomId: assignedRoom.id,
      roomNumber: assignedRoom.roomNumber,
      status: 'CONFIRMED',
      snapNightlyRate: baseRate,
      snapDepositRatePercent: config.depositRatePercent,
      snapServiceFeeRatePercent: config.serviceFeeRatePercent,
      snapVATRatePercent: config.vatRatePercent,
      depositRequired,
      depositPaid: depositRequired, // Thu cọc thành công qua Mock Gateway (BR-26)
      createdAt: new Date().toISOString(),
    };

    reservations.push(newRes);
    mockDb.saveReservations(reservations);

    // Gán phòng trước -> chuyển sang RESERVED (BR-08)
    if (assignedRoom.status === 'AVAILABLE') {
      assignedRoom.status = 'RESERVED';
      assignedRoom.assignedReservationId = newRes.id;
      mockDb.saveRooms(rooms);
    }

    return newRes;
  },

  // Đổi lịch đơn theo đêm (BR-25)
  rescheduleReservation: async (
    reservationId: string,
    newCheckIn: string,
    newCheckOut: string
  ): Promise<Reservation> => {
    const reservations = mockDb.getReservations();
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) throw new Error('Không tìm thấy đơn đặt phòng.');

    if (res.bookingType !== 'NIGHTLY') {
      throw new Error('Quy tắc [BR-25]: Chỉ đơn đặt phòng theo đêm (NIGHTLY) mới được phép đổi lịch.');
    }

    if (res.status !== 'CONFIRMED') {
      throw new Error('Quy tắc [BR-25]: Chỉ đơn ở trạng thái CONFIRMED mới được đổi lịch.');
    }

    // Kiểm tra H >= 24h
    const refundInfo = calculateCancellationRefundRatio(res.checkInDate);
    if (refundInfo.hoursRemaining < 24.0) {
      throw new Error('Quy tắc [BR-25]: Đổi lịch phải thực hiện trước ít nhất 24 giờ so với 14:00 ngày nhận phòng cũ.');
    }

    const v = validateNightlyDates(newCheckIn, newCheckOut);
    if (!v.isValid) throw new Error(v.error);

    // Bỏ gán phòng cũ (nếu có)
    const rooms = mockDb.getRooms();
    if (res.roomId) {
      const oldRoom = rooms.find((r) => r.id === res.roomId);
      if (oldRoom && oldRoom.status === 'RESERVED') {
        oldRoom.status = 'AVAILABLE';
        oldRoom.assignedReservationId = undefined;
      }
    }

    // Cập nhật ngày và tính cọc chênh lệch
    const nights = v.nights || 1;
    const newRoomCharge = nights * res.snapNightlyRate;
    const newDepositRequired = Math.round((newRoomCharge * res.snapDepositRatePercent) / 100);

    res.checkInDate = newCheckIn;
    res.checkOutDate = newCheckOut;
    res.depositRequired = newDepositRequired;
    res.depositPaid = newDepositRequired; // điều chỉnh chênh lệch qua gateway
    res.roomId = undefined;
    res.roomNumber = undefined;

    mockDb.saveRooms(rooms);
    mockDb.saveReservations(reservations);
    return res;
  },

  // Hủy đơn đặt phòng kèm hoàn cọc theo mốc (BR-21, BR-22, BR-23)
  cancelReservation: async (reservationId: string): Promise<{ reservation: Reservation; refundAmount: number; refundPercentLabel: string }> => {
    const reservations = mockDb.getReservations();
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) throw new Error('Không tìm thấy đơn đặt phòng.');

    if (res.status !== 'CONFIRMED') {
      throw new Error(`Quy tắc [BR-23]: Chỉ có thể hủy đơn ở trạng thái CONFIRMED (Trạng thái hiện tại: ${res.status}).`);
    }

    const refundCalc = calculateCancellationRefundRatio(res.checkInDate);
    const refundAmount = Math.round(res.depositPaid * refundCalc.refundRatio);

    res.status = 'CANCELLED';
    res.cancelledAt = new Date().toISOString();
    res.depositRefunded = refundAmount;

    // Trả phòng RESERVED về AVAILABLE (BR-08)
    if (res.roomId) {
      const rooms = mockDb.getRooms();
      const room = rooms.find((r) => r.id === res.roomId);
      if (room && room.status === 'RESERVED') {
        room.status = 'AVAILABLE';
        room.assignedReservationId = undefined;
        mockDb.saveRooms(rooms);
      }
    }

    mockDb.saveReservations(reservations);
    return { reservation: res, refundAmount, refundPercentLabel: refundCalc.refundPercentLabel };
  },

  // Cập nhật thông tin khách đại diện (BR-27)
  updateGuestProfile: async (
    reservationId: string,
    guestInfo: { fullName: string; phone: string; email?: string }
  ): Promise<Reservation> => {
    const reservations = mockDb.getReservations();
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) throw new Error('Không tìm thấy đơn đặt phòng.');

    if (res.status !== 'CONFIRMED' && res.status !== 'CHECKED_IN') {
      throw new Error('Quy tắc [BR-27]: Chỉ được sửa thông tin khách đối với đơn CONFIRMED hoặc CHECKED_IN.');
    }

    const name = (guestInfo.fullName || '').trim();
    if (!name || name.length > 100) throw new Error('Tên khách hàng từ 1 đến 100 ký tự (BR-09).');
    const phone = (guestInfo.phone || '').trim();
    if (!/^\d{9,11}$/.test(phone)) throw new Error('Số điện thoại gồm 9 đến 11 chữ số (BR-09).');

    res.guestInfo = {
      fullName: name,
      phone,
      email: guestInfo.email?.trim(),
    };

    mockDb.saveReservations(reservations);
    return res;
  },

  // Gán phòng trước cho đơn CONFIRMED (BR-08)
  preAssignRoom: async (reservationId: string, roomId: string): Promise<Reservation> => {
    const reservations = mockDb.getReservations();
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) throw new Error('Không tìm thấy đơn đặt phòng.');

    const rooms = mockDb.getRooms();
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) throw new Error('Phòng không tồn tại.');

    if (targetRoom.status !== 'AVAILABLE') {
      throw new Error(`Phòng ${targetRoom.roomNumber} đang ở trạng thái ${targetRoom.status}, không thể gán.`);
    }

    if (targetRoom.type !== res.roomType) {
      throw new Error(`Phòng ${targetRoom.roomNumber} (${targetRoom.type}) không khớp loại phòng đã đặt (${res.roomType}).`);
    }

    // Nếu trước đó đã gán phòng khác -> giải phóng phòng cũ
    if (res.roomId) {
      const oldRoom = rooms.find((r) => r.id === res.roomId);
      if (oldRoom && oldRoom.status === 'RESERVED') {
        oldRoom.status = 'AVAILABLE';
        oldRoom.assignedReservationId = undefined;
      }
    }

    res.roomId = targetRoom.id;
    res.roomNumber = targetRoom.roomNumber;
    targetRoom.status = 'RESERVED';
    targetRoom.assignedReservationId = res.id;

    mockDb.saveRooms(rooms);
    mockDb.saveReservations(reservations);
    return res;
  },

  // ==========================================
  // [F04] Check-in / Check-out (BR-80..84, BR-10, BR-11)
  // ==========================================
  checkIn: async (reservationId: string, assignedRoomId?: string): Promise<{ reservation: Reservation; room: Room }> => {
    const reservations = mockDb.getReservations();
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) throw new Error('Không tìm thấy đơn đặt phòng.');

    if (res.status !== 'CONFIRMED') {
      throw new Error(`Quy tắc [BR-80]: Chỉ đơn CONFIRMED mới được nhận phòng (Hiện tại: ${res.status}).`);
    }

    const rooms = mockDb.getRooms();
    const targetRoomId = assignedRoomId || res.roomId;
    if (!targetRoomId) throw new Error('Vui lòng chọn phòng để nhận.');

    const room = rooms.find((r) => r.id === targetRoomId);
    if (!room) throw new Error('Phòng không tồn tại.');

    // BR-81: Phải ở trạng thái AVAILABLE hoặc RESERVED cho chính đơn này
    if (room.status !== 'AVAILABLE' && !(room.status === 'RESERVED' && room.assignedReservationId === res.id)) {
      throw new Error(`Quy tắc [BR-81]: Phòng ${room.roomNumber} không sẵn sàng nhận (Trạng thái: ${room.status}).`);
    }

    // Chuyển đổi trạng thái (BR-65, BR-66, BR-81)
    room.status = 'OCCUPIED';
    room.assignedReservationId = res.id;
    res.status = 'CHECKED_IN';
    res.roomId = room.id;
    res.roomNumber = room.roomNumber;
    res.actualCheckInTime = new Date().toISOString();

    mockDb.saveRooms(rooms);
    mockDb.saveReservations(reservations);

    // Khởi tạo Draft Invoice nếu chưa có
    const invoices = mockDb.getInvoices();
    let invoice = invoices.find((inv) => inv.reservationId === res.id);
    if (!invoice) {
      const nights = Math.max(1, (new Date(res.checkOutDate).getTime() - new Date(res.checkInDate).getTime()) / (1000 * 3600 * 24));
      const calc = calculateFullInvoice({
        bookingType: res.bookingType,
        nightlyRate: res.snapNightlyRate,
        nights,
        hourlyDurationHours: res.hourlyDurationHours || 2,
        actualCheckInTime: res.actualCheckInTime,
        depositPaid: res.depositPaid,
      });

      invoice = {
        id: `inv-${res.id}`,
        invoiceNumber: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${room.roomNumber}`,
        reservationId: res.id,
        roomNumber: room.roomNumber,
        guestName: res.guestInfo.fullName,
        bookingType: res.bookingType,
        checkInDate: res.checkInDate,
        checkOutDate: res.checkOutDate,
        items: [
          {
            id: `it-${Date.now()}-room`,
            description: `Tiền phòng ${room.roomNumber} (${res.bookingType === 'NIGHTLY' ? `${nights} đêm` : `${res.hourlyDurationHours} giờ`})`,
            quantity: nights,
            unitPrice: res.snapNightlyRate,
            total: calc.roomCharge,
            type: 'ROOM',
          },
        ],
        roomCharge: calc.roomCharge,
        holidaySurcharge: calc.holidaySurcharge,
        earlyCheckInSurcharge: calc.earlyCheckInSurcharge,
        lateCheckOutSurcharge: calc.lateCheckOutSurcharge,
        extraAdultSurcharge: calc.extraAdultSurcharge,
        extraChildSurcharge: calc.extraChildSurcharge,
        discount: calc.discount,
        serviceFeeBase: calc.serviceFeeBase,
        serviceFee: calc.serviceFee,
        extraServicesTotal: 0,
        taxableAmount: calc.taxableAmount,
        vatAmount: calc.vatAmount,
        totalAmount: calc.totalAmount,
        depositPaid: res.depositPaid,
        amountDue: calc.amountDue,
        status: 'DRAFT',
        payments: [
          {
            id: `pay-init-${Date.now()}`,
            type: 'DEPOSIT_CHARGE',
            amount: res.depositPaid,
            method: 'BANK_TRANSFER',
            transactionDate: res.createdAt,
            idempotencyKey: `init-${res.id}`,
            note: 'Tiền đặt cọc đã thu',
            status: 'SUCCEEDED',
          },
        ],
        createdAt: new Date().toISOString(),
      };
      invoices.push(invoice);
      mockDb.saveInvoices(invoices);
    }

    return { reservation: res, room };
  },

  // Xem số dư tạm tính tại thời điểm hiện tại (BR-87)
  getInterimBalance: async (reservationId: string): Promise<Invoice> => {
    const reservations = mockDb.getReservations();
    const res = reservations.find((r) => r.id === reservationId);
    if (!res || res.status !== 'CHECKED_IN') {
      throw new Error('Quy tắc [BR-87]: Chỉ xem số dư tạm tính đối với phòng đang ở (CHECKED_IN).');
    }

    const invoices = mockDb.getInvoices();
    const invoice = invoices.find((inv) => inv.reservationId === res.id);
    if (!invoice) throw new Error('Chưa có hóa đơn cho đơn đặt phòng này.');

    return invoice;
  },

  // Check-out xử lý 3 nhánh amountDue & chuyển phòng sang CLEANING (BR-83, BR-84, BR-111)
  checkOut: async (
    reservationId: string,
    actualCheckoutTime?: string
  ): Promise<{ reservation: Reservation; room: Room; invoice: Invoice; branchMessage: string }> => {
    const reservations = mockDb.getReservations();
    const res = reservations.find((r) => r.id === reservationId);
    if (!res || res.status !== 'CHECKED_IN') {
      throw new Error('Quy tắc [BR-83]: Chỉ được trả phòng cho đơn đang ở (CHECKED_IN).');
    }

    const rooms = mockDb.getRooms();
    const room = rooms.find((r) => r.id === res.roomId);
    if (!room) throw new Error('Phòng không tồn tại.');

    const checkoutTime = actualCheckoutTime || new Date().toISOString();
    res.actualCheckOutTime = checkoutTime;

    // Tính toán hóa đơn đầy đủ với phụ thu trả muộn (BR-11, BR-50)
    const invoices = mockDb.getInvoices();
    const invoice = invoices.find((inv) => inv.reservationId === res.id);
    if (!invoice) throw new Error('Không tìm thấy hóa đơn.');

    const nights = Math.max(1, (new Date(res.checkOutDate).getTime() - new Date(res.checkInDate).getTime()) / (1000 * 3600 * 24));
    const calc = calculateFullInvoice({
      bookingType: res.bookingType,
      nightlyRate: res.snapNightlyRate,
      nights,
      hourlyDurationHours: res.hourlyDurationHours,
      actualCheckInTime: res.actualCheckInTime,
      actualCheckOutTime: checkoutTime,
      servicesTotal: invoice.extraServicesTotal,
      depositPaid: res.depositPaid,
    });

    invoice.lateCheckOutSurcharge = calc.lateCheckOutSurcharge;
    invoice.totalAmount = calc.totalAmount;
    invoice.amountDue = calc.amountDue;

    // Đánh giá 3 nhánh của amountDue (BR-84):
    let branchMessage = '';
    if (calc.amountDue > 0) {
      branchMessage = `Nhánh 1 [amountDue > 0]: Thu thêm ${calc.amountDue.toLocaleString()} VNĐ từ khách hàng qua Cổng thanh toán.`;
      invoice.payments.push({
        id: `pay-settle-${Date.now()}`,
        type: 'CHECKOUT_CHARGE',
        amount: calc.amountDue,
        method: 'BANK_TRANSFER',
        transactionDate: new Date().toISOString(),
        idempotencyKey: `settle-${invoice.id}`,
        note: 'Thanh toán dứt điểm khi check-out',
        status: 'SUCCEEDED',
      });
    } else if (calc.amountDue === 0) {
      branchMessage = 'Nhánh 2 [amountDue = 0]: Cọc khớp 100% chi phí. Bỏ qua cổng thanh toán, hoàn tất tất toán.';
    } else {
      const refund = Math.abs(calc.amountDue);
      branchMessage = `Nhánh 3 [amountDue < 0]: Hoàn lại tiền cọc dư ${refund.toLocaleString()} VNĐ cho khách hàng qua Cổng thanh toán.`;
      invoice.payments.push({
        id: `pay-refund-${Date.now()}`,
        type: 'CHECKOUT_REFUND',
        amount: refund,
        method: 'BANK_TRANSFER',
        transactionDate: new Date().toISOString(),
        idempotencyKey: `refund-${invoice.id}`,
        note: 'Hoàn tiền cọc thừa',
        status: 'SUCCEEDED',
      });
    }

    // BR-54: Hóa đơn chuyển ISSUED (bất biến)
    invoice.status = 'ISSUED';
    invoice.amountDue = 0; // Đã tất toán xong

    // BR-65, BR-66: Phòng chuyển sang CLEANING, đơn sang CHECKED_OUT
    room.status = 'CLEANING';
    room.assignedReservationId = undefined;
    res.status = 'CHECKED_OUT';

    // BR-111: Tự động khởi tạo nhiệm vụ dọn phòng trạng thái PENDING
    const cleaningTasks = mockDb.getCleaningTasks();
    const newTask: CleaningTask = {
      id: `task-${room.roomNumber}-${Date.now().toString().slice(-4)}`,
      roomId: room.id,
      roomNumber: room.roomNumber,
      reservationId: res.id,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    cleaningTasks.push(newTask);

    mockDb.saveCleaningTasks(cleaningTasks);
    mockDb.saveRooms(rooms);
    mockDb.saveReservations(reservations);
    mockDb.saveInvoices(invoices);

    return { reservation: res, room, invoice, branchMessage };
  },

  // ==========================================
  // [F05] Billing & Payments (BR-85, BR-86, BR-90)
  // ==========================================
  getInvoices: async (): Promise<Invoice[]> => {
    return mockDb.getInvoices();
  },

  getInvoiceById: async (invoiceId: string): Promise<Invoice | null> => {
    const invoices = mockDb.getInvoices();
    return invoices.find((inv) => inv.id === invoiceId || inv.invoiceNumber === invoiceId) || (invoiceId === 'INV-001' ? invoices[0] : null) || null;
  },

  getInvoiceByReservation: async (reservationId: string): Promise<Invoice | null> => {
    const invoices = mockDb.getInvoices();
    return invoices.find((inv) => inv.reservationId === reservationId) || null;
  },

  applyDiscount: async (invoiceId: string, discountPercent: number): Promise<Invoice> => {
    const invoices = mockDb.getInvoices();
    const invoice = invoices.find((inv) => inv.id === invoiceId || inv.invoiceNumber === invoiceId) || (invoiceId === 'INV-001' ? invoices[0] : null);
    if (!invoice) throw new Error('Không tìm thấy hóa đơn.');
    invoice.discount = Math.round(invoice.roomCharge * (discountPercent / 100));
    const calc = calculateFullInvoice({
      bookingType: invoice.bookingType,
      nightlyRate: invoice.roomCharge,
      servicesTotal: invoice.extraServicesTotal,
      voucher: {
        type: 'PERCENT',
        value: discountPercent,
      },
      depositPaid: invoice.depositPaid,
    });
    invoice.taxableAmount = calc.taxableAmount;
    invoice.vatAmount = calc.vatAmount;
    invoice.totalAmount = calc.totalAmount;
    invoice.amountDue = calc.amountDue;
    mockDb.saveInvoices(invoices);
    return invoice;
  },

  payInvoice: async (
    invoiceId: string,
    amount: number,
    method: PaymentMethod,
    idempotencyKey: string,
    note?: string
  ): Promise<Invoice> => {
    const invoices = mockDb.getInvoices();
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) throw new Error('Không tìm thấy hóa đơn.');
    invoice.payments.push({
      id: `pay-${Date.now()}`,
      type: 'CHECKOUT_CHARGE',
      amount,
      method,
      transactionDate: new Date().toISOString(),
      idempotencyKey,
      note,
      status: 'SUCCEEDED',
    });
    invoice.amountDue = Math.max(0, invoice.amountDue - amount);
    if (invoice.amountDue === 0) {
      invoice.status = 'ISSUED';
    }
    mockDb.saveInvoices(invoices);
    return invoice;
  },

  // ==========================================
  // [F06] Service & Housekeeping (BR-34..36, BR-110..114)
  // ==========================================
  getCatalogItems: async (): Promise<ServiceCatalogItem[]> => {
    return mockDb.getCatalog();
  },

  orderService: async (roomNumber: string, itemCode: string, quantity: number): Promise<Invoice> => {
    const rooms = mockDb.getRooms();
    const room = rooms.find((r) => r.roomNumber === roomNumber);
    if (!room || room.status !== 'OCCUPIED') {
      throw new Error('Quy tắc [BR-37]: Chỉ có thể thêm dịch vụ vào phòng đang có khách ở (OCCUPIED).');
    }

    const catalog = mockDb.getCatalog();
    const item = catalog.find((i) => i.code === itemCode && i.active);
    if (!item) throw new Error('Mặt hàng dịch vụ không tồn tại hoặc đã ngừng phục vụ (BR-110).');

    if (quantity < 1 || quantity > 99) {
      throw new Error('Quy tắc [BR-34, BR-35]: Số lượng dịch vụ từ 1 đến 99.');
    }

    const invoices = mockDb.getInvoices();
    const invoice = invoices.find((inv) => inv.roomNumber === roomNumber && inv.status === 'DRAFT');
    if (!invoice) throw new Error('Không tìm thấy hóa đơn chưa xuất của phòng.');

    const lineTotal = item.unitPrice * quantity;
    invoice.items.push({
      id: `it-${Date.now()}-${item.code}`,
      description: `${item.name} (${item.code})`,
      quantity,
      unitPrice: item.unitPrice,
      total: lineTotal,
      type: 'SERVICE',
      serviceType: item.category,
    });

    invoice.extraServicesTotal += lineTotal;
    // Cập nhật lại các chỉ số hóa đơn
    const calc = calculateFullInvoice({
      bookingType: invoice.bookingType,
      nightlyRate: invoice.roomCharge,
      servicesTotal: invoice.extraServicesTotal,
      depositPaid: invoice.depositPaid,
    });

    invoice.serviceFeeBase = calc.serviceFeeBase;
    invoice.serviceFee = calc.serviceFee;
    invoice.taxableAmount = calc.taxableAmount;
    invoice.vatAmount = calc.vatAmount;
    invoice.totalAmount = calc.totalAmount;
    invoice.amountDue = calc.amountDue;

    mockDb.saveInvoices(invoices);
    return invoice;
  },

  // Ghi nhận bồi thường hư hao tài sản (BR-36)
  recordDamage: async (roomNumber: string, amount: number, note: string): Promise<Invoice> => {
    const rooms = mockDb.getRooms();
    const room = rooms.find((r) => r.roomNumber === roomNumber);
    if (!room || room.status !== 'OCCUPIED') {
      throw new Error('Quy tắc [BR-37]: Chỉ có thể ghi nhận bồi thường hư hao vào phòng đang ở (OCCUPIED).');
    }

    if (amount < 1 || amount > 50000000 || !Number.isInteger(amount)) {
      throw new Error('Quy tắc [BR-36]: Tiền bồi thường hư hao phải là số nguyên từ 1 đến 50.000.000 VNĐ.');
    }

    const trimmedNote = (note || '').trim();
    if (!trimmedNote || trimmedNote.length > 200) {
      throw new Error('Quy tắc [BR-36]: Ghi chú giải trình hư hại bắt buộc và dài từ 1 đến 200 ký tự.');
    }

    const invoices = mockDb.getInvoices();
    const invoice = invoices.find((inv) => inv.roomNumber === roomNumber && inv.status === 'DRAFT');
    if (!invoice) throw new Error('Không tìm thấy hóa đơn của phòng.');

    invoice.items.push({
      id: `it-${Date.now()}-damage`,
      description: `Bồi thường hư hại tài sản: ${trimmedNote}`,
      quantity: 1,
      unitPrice: amount,
      total: amount,
      type: 'SERVICE',
      serviceType: 'DAMAGE',
      damageNote: trimmedNote,
    });

    invoice.extraServicesTotal += amount;
    const calc = calculateFullInvoice({
      bookingType: invoice.bookingType,
      nightlyRate: invoice.roomCharge,
      servicesTotal: invoice.extraServicesTotal,
      depositPaid: invoice.depositPaid,
    });

    invoice.taxableAmount = calc.taxableAmount;
    invoice.vatAmount = calc.vatAmount;
    invoice.totalAmount = calc.totalAmount;
    invoice.amountDue = calc.amountDue;

    mockDb.saveInvoices(invoices);
    return invoice;
  },

  // Quản lý nhiệm vụ dọn phòng vòng đời 2 bước (BR-111, BR-112)
  getCleaningTasks: async (): Promise<CleaningTask[]> => {
    return mockDb.getCleaningTasks();
  },

  startCleaningTask: async (taskId: string, housekeeperId: string, housekeeperName: string): Promise<CleaningTask> => {
    const tasks = mockDb.getCleaningTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Nhiệm vụ không tồn tại.');

    if (task.status !== 'PENDING') {
      throw new Error(`Quy tắc [BR-112]: Chỉ nhiệm vụ PENDING mới có thể chuyển sang IN_PROGRESS (Hiện tại: ${task.status}).`);
    }

    // Chuyển bước 1: PENDING -> IN_PROGRESS
    task.status = 'IN_PROGRESS';
    task.assignedHousekeeperId = housekeeperId;
    task.assignedHousekeeperName = housekeeperName;
    mockDb.saveCleaningTasks(tasks);
    return task;
  },

  completeCleaningTask: async (taskId: string): Promise<{ task: CleaningTask; room: Room }> => {
    const tasks = mockDb.getCleaningTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Nhiệm vụ không tồn tại.');

    if (task.status !== 'IN_PROGRESS') {
      throw new Error(`Quy tắc [BR-112]: Chỉ nhiệm vụ IN_PROGRESS mới có thể chuyển sang DONE (Hiện tại: ${task.status}). Không nhảy bước!`);
    }

    const rooms = mockDb.getRooms();
    const room = rooms.find((r) => r.id === task.roomId);
    if (!room) throw new Error('Phòng không tồn tại.');

    // Chuyển bước 2: IN_PROGRESS -> DONE & Phòng từ CLEANING -> AVAILABLE (BR-65, BR-112)
    task.status = 'DONE';
    task.completedAt = new Date().toISOString();
    room.status = 'AVAILABLE';

    mockDb.saveCleaningTasks(tasks);
    mockDb.saveRooms(rooms);
    return { task, room };
  },

  confirmRoomCleaned: async (roomId: string): Promise<Room> => {
    const rooms = mockDb.getRooms();
    const room = rooms.find((r) => r.id === roomId || r.roomNumber === roomId);
    if (!room) throw new Error('Phòng không tồn tại.');
    room.status = 'AVAILABLE';
    mockDb.saveRooms(rooms);
    return room;
  },

  // ==========================================
  // [F07] Reports & Settings (BR-88, BR-89, BR-120..124)
  // ==========================================
  getSystemConfig: async (): Promise<SystemConfig> => {
    return mockDb.getConfig();
  },

  updateSystemConfig: async (configData: Partial<SystemConfig>, userRole: Role): Promise<SystemConfig> => {
    if (userRole !== 'ADMIN') {
      throw new Error('Quy tắc [BR-88, BR-75]: Chỉ có vai trò ADMIN mới được cấu hình tham số hệ thống.');
    }

    const config = mockDb.getConfig();
    if (configData.depositRatePercent !== undefined) {
      if (configData.depositRatePercent <= 0 || configData.depositRatePercent > 100) {
        throw new Error('Quy tắc [BR-88]: Tỷ lệ cọc phải lớn hơn 0% và không quá 100%.');
      }
      config.depositRatePercent = configData.depositRatePercent;
    }

    if (configData.serviceFeeRatePercent !== undefined) {
      if (configData.serviceFeeRatePercent < 0 || configData.serviceFeeRatePercent > 20) {
        throw new Error('Quy tắc [BR-88]: Phí dịch vụ phải từ 0% đến 20%.');
      }
      config.serviceFeeRatePercent = configData.serviceFeeRatePercent;
    }

    if (configData.vatRatePercent !== undefined) {
      if (configData.vatRatePercent < 0 || configData.vatRatePercent > 20) {
        throw new Error('Quy tắc [BR-88]: Thuế VAT phải từ 0% đến 20%.');
      }
      config.vatRatePercent = configData.vatRatePercent;
    }

    config.updatedAt = new Date().toISOString();
    mockDb.saveConfig(config);
    return config;
  },

  getHolidays: async (): Promise<Holiday[]> => {
    return mockDb.getHolidays();
  },

  getVouchers: async (): Promise<Voucher[]> => {
    return mockDb.getVouchers();
  },

  getRevenueReport: async () => {
    const invoices = mockDb.getInvoices();
    const rooms = mockDb.getRooms();
    const reservations = mockDb.getReservations();

    // BR-122: Doanh thu = tổng total của các hóa đơn ISSUED
    const issuedInvoices = invoices.filter((inv) => inv.status === 'ISSUED');
    const totalRevenue = issuedInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

    // Tiền hoàn và cọc mất báo riêng biệt (BR-122)
    const totalRefunded = reservations.reduce((acc, r) => acc + (r.depositRefunded || 0), 0);
    const totalForfeited = reservations
      .filter((r) => r.status === 'NO_SHOW')
      .reduce((acc, r) => acc + r.depositPaid, 0);

    // BR-120: Phân bố 5 trạng thái phòng
    const distribution = {
      AVAILABLE: rooms.filter((r) => r.status === 'AVAILABLE').length,
      RESERVED: rooms.filter((r) => r.status === 'RESERVED').length,
      OCCUPIED: rooms.filter((r) => r.status === 'OCCUPIED').length,
      CLEANING: rooms.filter((r) => r.status === 'CLEANING').length,
      OUT_OF_SERVICE: rooms.filter((r) => r.status === 'OUT_OF_SERVICE').length,
      TOTAL: rooms.length,
    };

    const occupancyRate = Math.round((distribution.OCCUPIED / rooms.length) * 100);

    return {
      totalRevenue,
      totalRefunded,
      totalForfeited,
      distribution,
      occupancyRate,
      monthlyData: [
        { month: 'T07', revenue: 45000000 },
        { month: 'T08', revenue: 52000000 },
        { month: 'T09', revenue: 48000000 },
        { month: 'T10', revenue: 61000000 },
        { month: 'T11', revenue: totalRevenue + 28000000 },
      ],
    };
  },
};
