import { mockDb } from './mockDb';
import { User, LoginCredentials, AuthResponse } from '../types/rbac.types';
import { Room, RoomStatus } from '../types/room.types';
import { Reservation, AvailabilityQuery } from '../types/reservation.types';
import { Invoice, InvoiceItem, PaymentRecord } from '../types/billing.types';
import { validateReservationDates, calculateLateCheckoutFee } from '../utils/dateValidation';
import { calculateInvoiceTotals } from '../utils/invoiceCalculator';

// Tập hợp xử lý giả lập chuẩn hóa 8 quy tắc nghiệp vụ BR01 -> BR08
export const mockHandlers = {
  // [F01] Auth & Users
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const users = mockDb.getUsers();
    const user = users.find((u) => u.email === credentials.email && u.password === credentials.password);
    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    const { password, ...safeUser } = user;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(safeUser));
    return { token, user: safeUser as User };
  },

  getUsers: async (): Promise<User[]> => {
    const users = mockDb.getUsers();
    return users.map(({ password, ...u }) => u as User);
  },

  createUser: async (userData: Omit<User, 'id' | 'createdAt'> & { password?: string }): Promise<User> => {
    const users = mockDb.getUsers();
    const newUser: User & { password?: string } = {
      ...userData,
      id: `u-${Date.now()}`,
      createdAt: new Date().toISOString(),
      password: userData.password || '123456',
    };
    users.push(newUser);
    mockDb.saveUsers(users);
    const { password, ...safe } = newUser;
    return safe as User;
  },

  // [F02] Rooms
  getRooms: async (): Promise<Room[]> => {
    return mockDb.getRooms();
  },

  updateRoom: async (id: string, updateData: Partial<Room>): Promise<Room> => {
    const rooms = mockDb.getRooms();
    const index = rooms.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Không tìm thấy phòng');
    rooms[index] = { ...rooms[index], ...updateData };
    mockDb.saveRooms(rooms);
    return rooms[index];
  },

  // [F03] Reservations & Availability (BR01, BR02)
  checkAvailability: async (query: AvailabilityQuery): Promise<Room[]> => {
    const { checkInDate, checkOutDate, guestCount = 1 } = query;
    const dateVal = validateReservationDates(checkInDate, checkOutDate);
    if (!dateVal.isValid) {
      throw new Error(dateVal.error);
    }

    const rooms = mockDb.getRooms();
    const reservations = mockDb.getReservations();

    // Lọc theo BR01 (sức chứa) và BR02 (không trùng lịch)
    return rooms.filter((room) => {
      if (room.maxCapacity < guestCount) return false;

      // Kiểm tra overlap
      const hasConflict = reservations.some((res) => {
        if (res.roomId !== room.id) return false;
        if (res.status === 'CANCELLED' || res.status === 'CHECKED_OUT') return false;

        // BR02 Overlap: max(A_start, B_start) < min(A_end, B_end)
        const startA = new Date(checkInDate).getTime();
        const endA = new Date(checkOutDate).getTime();
        const startB = new Date(res.checkInDate).getTime();
        const endB = new Date(res.checkOutDate).getTime();

        return Math.max(startA, startB) < Math.min(endA, endB);
      });

      return !hasConflict;
    });
  },

  getReservations: async (): Promise<Reservation[]> => {
    return mockDb.getReservations();
  },

  createReservation: async (data: Omit<Reservation, 'id' | 'reservationCode' | 'createdAt' | 'status' | 'totalPrice'>): Promise<Reservation> => {
    // BR01 Validation
    const dateVal = validateReservationDates(data.checkInDate, data.checkOutDate);
    if (!dateVal.isValid) throw new Error(dateVal.error);

    const rooms = mockDb.getRooms();
    const targetRoom = rooms.find((r) => r.id === data.roomId);
    if (!targetRoom) throw new Error('Phòng không tồn tại.');
    if (data.guestCount > targetRoom.maxCapacity) {
      throw new Error(`Số lượng khách (${data.guestCount}) vượt quá sức chứa tối đa (${targetRoom.maxCapacity}) của phòng.`);
    }

    // BR02 Overlap check
    const availableRooms = await mockHandlers.checkAvailability({
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      guestCount: data.guestCount,
    });
    if (!availableRooms.some((r) => r.id === data.roomId)) {
      throw new Error('Quy tắc [BR02]: Phòng này đã có lịch được giữ hoặc đang có khách trong khoảng thời gian đã chọn!');
    }

    const reservations = mockDb.getReservations();
    const newRes: Reservation = {
      ...data,
      id: `res-${Date.now()}`,
      reservationCode: `RSV-${targetRoom.roomNumber}-${Date.now().toString().slice(-4)}`,
      status: 'CONFIRMED',
      totalPrice: dateVal.nights * targetRoom.pricePerNight,
      createdAt: new Date().toISOString(),
    };
    reservations.push(newRes);
    mockDb.saveReservations(reservations);

    // Cập nhật trạng thái phòng sang RESERVED nếu đang AVAILABLE
    if (targetRoom.status === 'AVAILABLE') {
      targetRoom.status = 'RESERVED';
      mockDb.saveRooms(rooms);
    }

    return newRes;
  },

  // [F04] Check-in / Check-out (BR03, BR04)
  checkIn: async (reservationId: string): Promise<{ reservation: Reservation; room: Room }> => {
    const reservations = mockDb.getReservations();
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) throw new Error('Không tìm thấy đơn đặt phòng.');
    if (res.status !== 'CONFIRMED') throw new Error('Đơn đặt phòng không ở trạng thái CONFIRMED.');

    const rooms = mockDb.getRooms();
    const room = rooms.find((r) => r.id === res.roomId);
    if (!room) throw new Error('Phòng không tồn tại.');

    // BR03: Chuyển đổi trạng thái sang OCCUPIED
    room.status = 'OCCUPIED';
    res.status = 'CHECKED_IN';
    mockDb.saveRooms(rooms);
    mockDb.saveReservations(reservations);

    // Tự động khởi tạo hóa đơn nếu chưa có
    const invoices = mockDb.getInvoices();
    let invoice = invoices.find((inv) => inv.reservationId === res.id);
    if (!invoice) {
      const dateVal = validateReservationDates(res.checkInDate, res.checkOutDate);
      const roomCharge = dateVal.nights * room.pricePerNight;
      const calc = calculateInvoiceTotals({ roomCharge, serviceCharge: 0, lateSurcharge: 0, discountPercent: 0 });

      invoice = {
        id: `inv-${res.id}`,
        invoiceNumber: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${room.roomNumber}`,
        reservationId: res.id,
        roomNumber: room.roomNumber,
        guestName: res.guestInfo.fullName,
        checkInDate: res.checkInDate,
        checkOutDate: res.checkOutDate,
        items: [
          {
            id: `it-${Date.now()}-room`,
            description: `Tiền phòng ${room.roomNumber} (${dateVal.nights} đêm)`,
            quantity: dateVal.nights,
            unitPrice: room.pricePerNight,
            total: roomCharge,
            type: 'ROOM',
          },
        ],
        roomCharge,
        serviceCharge: 0,
        lateSurcharge: 0,
        subTotal: calc.subTotal,
        discountPercent: 0,
        discountAmount: 0,
        vatRate: 0.1,
        vatAmount: calc.vatAmount,
        totalAmount: calc.totalAmount,
        paidAmount: 0,
        remainingBalance: calc.totalAmount,
        status: 'UNPAID',
        payments: [],
        createdAt: new Date().toISOString(),
      };
      invoices.push(invoice);
      mockDb.saveInvoices(invoices);
    }

    return { reservation: res, room };
  },

  checkOut: async (reservationId: string, actualCheckoutTime?: string): Promise<{ reservation: Reservation; room: Room; invoice: Invoice }> => {
    const reservations = mockDb.getReservations();
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) throw new Error('Không tìm thấy đơn đặt phòng.');

    const rooms = mockDb.getRooms();
    const room = rooms.find((r) => r.id === res.roomId);
    if (!room) throw new Error('Phòng không tồn tại.');

    // BR04: Tính phụ thu trả muộn
    const lateResult = calculateLateCheckoutFee(room.pricePerNight, actualCheckoutTime || new Date());

    // Cập nhật hóa đơn
    const invoices = mockDb.getInvoices();
    let invoice = invoices.find((inv) => inv.reservationId === res.id);
    if (invoice && lateResult.surcharge > 0) {
      invoice.items.push({
        id: `it-${Date.now()}-late`,
        description: `Phụ thu trả muộn (${lateResult.percentage}% ngày)`,
        quantity: 1,
        unitPrice: lateResult.surcharge,
        total: lateResult.surcharge,
        type: 'SURCHARGE',
      });
      invoice.lateSurcharge = lateResult.surcharge;
      const calc = calculateInvoiceTotals({
        roomCharge: invoice.roomCharge,
        serviceCharge: invoice.serviceCharge,
        lateSurcharge: invoice.lateSurcharge,
        discountPercent: invoice.discountPercent,
      });
      invoice.subTotal = calc.subTotal;
      invoice.discountAmount = calc.discountAmount;
      invoice.vatAmount = calc.vatAmount;
      invoice.totalAmount = calc.totalAmount;
      invoice.remainingBalance = Math.max(0, invoice.totalAmount - invoice.paidAmount);
      mockDb.saveInvoices(invoices);
    }

    // BR04: Trạng thái phòng đổi sang DIRTY, đơn sang CHECKED_OUT
    room.status = 'DIRTY';
    res.status = 'CHECKED_OUT';
    mockDb.saveRooms(rooms);
    mockDb.saveReservations(reservations);

    return { reservation: res, room, invoice: invoice! };
  },

  // [F05] Billing & Invoices (BR05, BR06)
  getInvoiceByReservation: async (reservationId: string): Promise<Invoice | null> => {
    const invoices = mockDb.getInvoices();
    return invoices.find((inv) => inv.reservationId === reservationId) || null;
  },

  getInvoiceById: async (invoiceId: string): Promise<Invoice | null> => {
    const invoices = mockDb.getInvoices();
    return invoices.find((inv) => inv.id === invoiceId) || null;
  },

  applyDiscount: async (invoiceId: string, discountPercent: number): Promise<Invoice> => {
    const invoices = mockDb.getInvoices();
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) throw new Error('Không tìm thấy hóa đơn.');

    const calc = calculateInvoiceTotals({
      roomCharge: invoice.roomCharge,
      serviceCharge: invoice.serviceCharge,
      lateSurcharge: invoice.lateSurcharge,
      discountPercent,
    });

    invoice.discountPercent = discountPercent;
    invoice.discountAmount = calc.discountAmount;
    invoice.vatAmount = calc.vatAmount;
    invoice.totalAmount = calc.totalAmount;
    invoice.remainingBalance = Math.max(0, invoice.totalAmount - invoice.paidAmount);
    if (invoice.remainingBalance === 0 && invoice.paidAmount > 0) {
      invoice.status = 'PAID';
    }
    mockDb.saveInvoices(invoices);
    return invoice;
  },

  payInvoice: async (
    invoiceId: string,
    amount: number,
    method: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER',
    idempotencyKey: string,
    note?: string
  ): Promise<Invoice> => {
    const invoices = mockDb.getInvoices();
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) throw new Error('Hóa đơn không tồn tại.');

    // BR06: Chặn thanh toán trùng với Idempotency Key
    const existingPayment = invoice.payments.find((p) => p.idempotencyKey === idempotencyKey);
    if (existingPayment) {
      // Đã ghi nhận giao dịch này trước đó, trả lại hóa đơn hiện tại không cộng dồn
      return invoice;
    }

    // BR06: Chặn thanh toán vượt dư nợ còn lại
    if (amount <= 0) throw new Error('Số tiền thanh toán phải lớn hơn 0 VNĐ.');
    if (amount > invoice.remainingBalance) {
      throw new Error(`Quy tắc [BR06]: Số tiền thanh toán (${amount.toLocaleString()} ₫) vượt quá số dư cần trả (${invoice.remainingBalance.toLocaleString()} ₫).`);
    }

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      amount,
      method,
      transactionDate: new Date().toISOString(),
      idempotencyKey,
      note,
    };

    invoice.payments.push(newPayment);
    invoice.paidAmount += amount;
    invoice.remainingBalance = Math.max(0, invoice.totalAmount - invoice.paidAmount);

    if (invoice.remainingBalance === 0) {
      invoice.status = 'PAID';
    } else {
      invoice.status = 'PARTIALLY_PAID';
    }

    mockDb.saveInvoices(invoices);
    return invoice;
  },

  // [F06] Service & Housekeeping (BR07, TC_HK_01, TC_HK_02, TC_SVC_01)
  getServicesCatalog: async () => {
    return mockDb.getServices();
  },

  getDirtyRooms: async (): Promise<Room[]> => {
    const rooms = mockDb.getRooms();
    return rooms.filter((r) => r.status === 'DIRTY');
  },

  confirmRoomCleaned: async (roomId: string): Promise<Room> => {
    const rooms = mockDb.getRooms();
    const room = rooms.find((r) => r.id === roomId);
    if (!room) throw new Error('Phòng không tồn tại.');

    // BR07: Chỉ phòng DIRTY mới được chuyển sang AVAILABLE
    if (room.status !== 'DIRTY') {
      throw new Error('Quy tắc [BR07]: Chỉ có phòng ở trạng thái DIRTY mới được xác nhận đã dọn xong!');
    }

    room.status = 'AVAILABLE';
    mockDb.saveRooms(rooms);
    return room;
  },

  orderService: async (roomNumber: string, serviceItemId: string, quantity: number): Promise<Invoice> => {
    const rooms = mockDb.getRooms();
    const room = rooms.find((r) => r.roomNumber === roomNumber);
    if (!room || room.status !== 'OCCUPIED') {
      throw new Error('Dịch vụ chỉ có thể thêm vào phòng đang có khách ở (OCCUPIED).');
    }

    const services = mockDb.getServices();
    const service = services.find((s) => s.id === serviceItemId);
    if (!service) throw new Error('Dịch vụ không tồn tại.');

    const invoices = mockDb.getInvoices();
    const invoice = invoices.find((inv) => inv.roomNumber === roomNumber && inv.status !== 'PAID');
    if (!invoice) throw new Error('Không tìm thấy hóa đơn chưa thanh toán của phòng.');

    const totalItemPrice = service.price * quantity;
    invoice.items.push({
      id: `it-${Date.now()}-${service.id}`,
      description: `${service.name} (x${quantity})`,
      quantity,
      unitPrice: service.price,
      total: totalItemPrice,
      type: 'SERVICE',
    });

    invoice.serviceCharge += totalItemPrice;
    const calc = calculateInvoiceTotals({
      roomCharge: invoice.roomCharge,
      serviceCharge: invoice.serviceCharge,
      lateSurcharge: invoice.lateSurcharge,
      discountPercent: invoice.discountPercent,
    });

    invoice.subTotal = calc.subTotal;
    invoice.discountAmount = calc.discountAmount;
    invoice.vatAmount = calc.vatAmount;
    invoice.totalAmount = calc.totalAmount;
    invoice.remainingBalance = Math.max(0, invoice.totalAmount - invoice.paidAmount);

    mockDb.saveInvoices(invoices);
    return invoice;
  },

  // [F07] Reports & Shift Allocation (REP_01, REP_02)
  getRevenueReport: async () => {
    const invoices = mockDb.getInvoices();
    const rooms = mockDb.getRooms();

    const totalRevenue = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
    const totalExpected = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    const occupiedCount = rooms.filter((r) => r.status === 'OCCUPIED').length;
    const occupancyRate = Math.round((occupiedCount / rooms.length) * 100);

    return {
      totalRevenue,
      totalExpected,
      occupiedRooms: occupiedCount,
      totalRooms: rooms.length,
      occupancyRate,
      monthlyData: [
        { month: 'T07', revenue: 45000000 },
        { month: 'T08', revenue: 52000000 },
        { month: 'T09', revenue: 48000000 },
        { month: 'T10', revenue: 61000000 },
        { month: 'T11', revenue: totalRevenue + 35000000 },
      ],
    };
  },
};
