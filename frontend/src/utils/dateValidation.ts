/**
 * Kiểm tra ràng buộc ngày và giờ theo BR v1.2:
 * BR-01: Giờ nhận phòng chuẩn 14:00, giờ trả phòng chuẩn 12:00
 * BR-03: NIGHTLY 1 đến 30 đêm
 * BR-04: HOURLY thuê trong ngày, 06:00 đến 22:00, 1 đến 10 giờ, kết thúc <= 24:00
 * BR-10: Phụ thu nhận sớm (t < 06:00: 100%, 06:00-12:00: 50%, 12:00-14:00: 30%, >=14:00: 0%)
 * BR-11: Phụ thu trả muộn (t <= 12:00: 0%, 12:00-15:00: 30%, 15:00-18:00: 50%, >18:00: 100%)
 * BR-21: Mức hoàn cọc khi hủy (H >= 24h: 100%, 12 <= H < 24: 50%, H < 12: 0%)
 * BR-62: checkIn >= today và <= today + 365 ngày
 */

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
  nights?: number;
  hours?: number;
}

export function validateNightlyDates(checkIn: string, checkOut: string): DateValidationResult {
  if (!checkIn || !checkOut) {
    return { isValid: false, error: 'Vui lòng chọn đầy đủ ngày nhận và trả phòng.' };
  }

  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  inDate.setHours(0, 0, 0, 0);
  outDate.setHours(0, 0, 0, 0);

  const diffTime = outDate.getTime() - inDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      isValid: false,
      error: 'Quy tắc [BR-03, BR-62]: Ngày trả phòng phải sau ngày nhận phòng ít nhất 01 đêm.',
    };
  }

  if (diffDays > 30) {
    return {
      isValid: false,
      error: 'Quy tắc [BR-03]: Thời gian lưu trú theo đêm tối đa là 30 đêm.',
    };
  }

  return { isValid: true, nights: diffDays };
}

// Alias for backwards compatibility
export const validateReservationDates = validateNightlyDates;

export function validateHourlyBooking(
  date: string,
  startTime: string,
  durationHours: number,
  guestCount: number = 1
): DateValidationResult {
  if (!date || !startTime || !durationHours) {
    return { isValid: false, error: 'Vui lòng nhập đầy đủ ngày thuê, giờ bắt đầu và số giờ thuê.' };
  }

  if (durationHours < 1 || durationHours > 10 || !Number.isInteger(durationHours)) {
    return { isValid: false, error: 'Quy tắc [BR-04]: Số giờ thuê phải là số nguyên từ 1 đến 10 giờ.' };
  }

  if (guestCount > 2) {
    return { isValid: false, error: 'Quy tắc [BR-04, BR-32]: Đặt phòng theo giờ giới hạn tối đa 2 khách.' };
  }

  const [h, m] = startTime.split(':').map(Number);
  const startDecimal = h + (m || 0) / 60;

  if (startDecimal < 6.0 || startDecimal > 22.0) {
    return { isValid: false, error: 'Quy tắc [BR-04]: Giờ bắt đầu thuê theo giờ phải từ 06:00 đến 22:00.' };
  }

  const endDecimal = startDecimal + durationHours;
  if (endDecimal > 24.0) {
    return { isValid: false, error: 'Quy tắc [BR-04]: Giờ kết thúc thuê theo giờ không được vượt quá 24:00 trong ngày.' };
  }

  return { isValid: true, hours: durationHours };
}

/**
 * Tính tỷ lệ giá thuê theo giờ theo [BR-04]:
 * 1 đến 3 giờ: 30% giá đêm
 * Từ giờ thứ 4: mỗi giờ thêm +10% (4h=40%, 5h=50%, ..., 10h=100%)
 */
export function getHourlyRateRatio(durationHours: number): number {
  if (durationHours <= 3) return 0.3;
  return Math.min(1.0, 0.3 + (durationHours - 3) * 0.1);
}

/**
 * Phụ thu nhận phòng sớm [BR-10] (chỉ đơn NIGHTLY)
 */
export function calculateEarlyCheckInFee(
  nightlyRate: number,
  actualCheckIn: string | Date = new Date()
): { surcharge: number; percentage: number } {
  const d = new Date(actualCheckIn);
  const hour = d.getHours() + d.getMinutes() / 60;

  if (hour >= 14.0) {
    return { surcharge: 0, percentage: 0 };
  } else if (hour >= 12.0) {
    return { surcharge: Math.round(nightlyRate * 0.3), percentage: 30 };
  } else if (hour >= 6.0) {
    return { surcharge: Math.round(nightlyRate * 0.5), percentage: 50 };
  } else {
    return { surcharge: Math.round(nightlyRate * 1.0), percentage: 100 };
  }
}

/**
 * Phụ thu trả phòng trễ [BR-11] (chỉ đơn NIGHTLY)
 */
export function calculateLateCheckOutFee(
  nightlyRate: number,
  actualCheckOut: string | Date = new Date()
): { surcharge: number; percentage: number } {
  const d = new Date(actualCheckOut);
  const hour = d.getHours() + d.getMinutes() / 60;

  if (hour <= 12.0) {
    return { surcharge: 0, percentage: 0 };
  } else if (hour <= 15.0) {
    return { surcharge: Math.round(nightlyRate * 0.3), percentage: 30 };
  } else if (hour <= 18.0) {
    return { surcharge: Math.round(nightlyRate * 0.5), percentage: 50 };
  } else {
    return { surcharge: Math.round(nightlyRate * 1.0), percentage: 100 };
  }
}

// Alias for case insensitivity
export const calculateLateCheckoutFee = calculateLateCheckOutFee;

/**
 * Tính tỷ lệ hoàn cọc khi hủy [BR-21, BR-22]
 * H = số giờ từ thời điểm hủy đến 14:00 ngày check-in
 * H >= 24h: 100%
 * 12h <= H < 24h: 50%
 * H < 12h (hoặc H âm): 0%
 */
export function calculateCancellationRefundRatio(
  checkInDate: string,
  now: Date = new Date()
): { refundRatio: number; hoursRemaining: number; refundPercentLabel: string } {
  const targetCheckIn = new Date(checkInDate);
  targetCheckIn.setHours(14, 0, 0, 0);

  const diffMs = targetCheckIn.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours >= 24.0) {
    return { refundRatio: 1.0, hoursRemaining: diffHours, refundPercentLabel: '100% (Trước >24h)' };
  } else if (diffHours >= 12.0) {
    return { refundRatio: 0.5, hoursRemaining: diffHours, refundPercentLabel: '50% (Từ 12h - 24h)' };
  } else {
    return { refundRatio: 0.0, hoursRemaining: diffHours, refundPercentLabel: '0% (Dưới 12h)' };
  }
}
