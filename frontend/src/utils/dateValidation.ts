/**
 * Kiểm tra ràng buộc ngày Check-out > Check-in (BR01) & Tính phụ thu Check-out muộn (BR04)
 */

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
  nights: number;
}

export function validateReservationDates(checkIn: string, checkOut: string): DateValidationResult {
  if (!checkIn || !checkOut) {
    return { isValid: false, error: 'Vui lòng chọn đầy đủ ngày nhận và trả phòng.', nights: 0 };
  }

  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  inDate.setHours(0, 0, 0, 0);
  outDate.setHours(0, 0, 0, 0);

  const diffTime = outDate.getTime() - inDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      isValid: false,
      error: 'Quy tắc [BR01]: Ngày trả phòng phải sau ngày nhận phòng ít nhất 01 đêm.',
      nights: 0,
    };
  }

  return { isValid: true, nights: diffDays };
}

export function isTodayOrFuture(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d.getTime() >= today.getTime();
}

/**
 * Tính phụ thu trả phòng muộn theo [BR04]:
 * - Giờ trả tiêu chuẩn: 12:00
 * - 12:01 -> 15:00: Phụ thu 30%
 * - 15:01 -> 18:00: Phụ thu 50%
 * - Sau 18:00: Phụ thu 100%
 */
export function calculateLateCheckoutFee(
  dailyRate: number,
  actualCheckout: string | Date = new Date()
): { surcharge: number; percentage: number; hoursLate: number } {
  const d = new Date(actualCheckout);
  const hour = d.getHours() + d.getMinutes() / 60;

  if (hour <= 12.0) {
    return { surcharge: 0, percentage: 0, hoursLate: 0 };
  } else if (hour <= 15.0) {
    const surcharge = Math.round(dailyRate * 0.3);
    return { surcharge, percentage: 30, hoursLate: hour - 12.0 };
  } else if (hour <= 18.0) {
    const surcharge = Math.round(dailyRate * 0.5);
    return { surcharge, percentage: 50, hoursLate: hour - 12.0 };
  } else {
    const surcharge = Math.round(dailyRate * 1.0);
    return { surcharge, percentage: 100, hoursLate: hour - 12.0 };
  }
}
