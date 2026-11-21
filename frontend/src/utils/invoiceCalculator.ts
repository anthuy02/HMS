/**
 * Tính toán hóa đơn theo đúng 11 bước của [BR-50] & BR v1.2:
 * R là làm tròn HALF_UP về 1 VNĐ (Math.round trên số nguyên)
 * 1. roomCharge:
 *    - NIGHTLY: số đêm * nightlyRate
 *    - HOURLY: R(nightlyRate * tỷ lệ BR-04)
 * 2. holiday: R(số đêm lễ * nightlyRate * 20%)
 * 3. Phụ thu:
 *    - early: R(nightlyRate * tỷ lệ BR-10)
 *    - late: R(nightlyRate * tỷ lệ BR-11)
 *    - extraAdult: số người lớn thêm * 200.000 * số đêm
 *    - extraChild: số trẻ 6-11 * 100.000 * số đêm
 * 4. discount: VIP 10% (đêm > 3, ko lễ) hoặc Voucher (PERCENT trần maxDiscount hoặc FIXED), lấy max, cap tại roomCharge
 * 5. serviceFeeBase = roomCharge - discount + holiday + early + late + extraAdult + extraChild
 * 6. serviceFee = R(5% * serviceFeeBase)
 * 7. services = sum(minibar + laundry + damage)
 * 8. taxable = serviceFeeBase + serviceFee + services
 * 9. vat = R(10% * taxable)
 * 10. total = taxable + vat
 * 11. amountDue = total - depositPaid (số âm = hoàn lại khách)
 */

import { getHourlyRateRatio } from './dateValidation';

export interface BillingCalculationInput {
  bookingType: 'NIGHTLY' | 'HOURLY';
  nightlyRate: number;
  nights?: number;
  hourlyDurationHours?: number;
  holidayNightsCount?: number;
  actualCheckInTime?: string | Date;
  actualCheckOutTime?: string | Date;
  extraAdultCount?: number;   // người lớn > 2
  child6to11Count?: number;    // trẻ 6-11
  isVipGuest?: boolean;
  voucher?: {
    type: 'PERCENT' | 'FIXED';
    value: number;
    maxDiscount?: number;
  };
  servicesTotal?: number;      // tổng tiền minibar + giặt ủi + hư hao
  serviceFeeRate?: number;     // default 0.05 (5%)
  vatRate?: number;            // default 0.10 (10%)
  depositPaid: number;
}

export interface BillingCalculationOutput {
  roomCharge: number;
  holidaySurcharge: number;
  earlyCheckInSurcharge: number;
  lateCheckOutSurcharge: number;
  extraAdultSurcharge: number;
  extraChildSurcharge: number;
  discount: number;
  serviceFeeBase: number;
  serviceFee: number;
  servicesTotal: number;
  taxableAmount: number;
  vatAmount: number;
  totalAmount: number;
  depositPaid: number;
  amountDue: number; // >0: thu thêm; ==0: vừa đủ; <0: hoàn cọc dư (BR-84)
}

export function calculateFullInvoice(input: BillingCalculationInput): BillingCalculationOutput {
  const {
    bookingType,
    nightlyRate,
    nights = 1,
    hourlyDurationHours = 1,
    holidayNightsCount = 0,
    actualCheckInTime,
    actualCheckOutTime,
    extraAdultCount = 0,
    child6to11Count = 0,
    isVipGuest = false,
    voucher,
    servicesTotal = 0,
    serviceFeeRate = 0.05,
    vatRate = 0.10,
    depositPaid = 0,
  } = input;

  // Bước 1: roomCharge
  let roomCharge = 0;
  if (bookingType === 'NIGHTLY') {
    roomCharge = nights * nightlyRate;
  } else {
    const ratio = getHourlyRateRatio(hourlyDurationHours);
    roomCharge = Math.round(nightlyRate * ratio);
  }

  // Bước 2: holiday surcharge (chỉ NIGHTLY, BR-33)
  let holidaySurcharge = 0;
  if (bookingType === 'NIGHTLY' && holidayNightsCount > 0) {
    holidaySurcharge = Math.round(holidayNightsCount * nightlyRate * 0.20);
  }

  // Bước 3: Phụ thu nhận sớm / trả muộn / thêm người (chỉ NIGHTLY, BR-04 loại trừ các phụ thu này cho HOURLY)
  let earlyCheckInSurcharge = 0;
  let lateCheckOutSurcharge = 0;
  let extraAdultSurcharge = 0;
  let extraChildSurcharge = 0;

  if (bookingType === 'NIGHTLY') {
    if (actualCheckInTime) {
      const d = new Date(actualCheckInTime);
      const hour = d.getHours() + d.getMinutes() / 60;
      if (hour < 6.0) earlyCheckInSurcharge = Math.round(nightlyRate * 1.0);
      else if (hour < 12.0) earlyCheckInSurcharge = Math.round(nightlyRate * 0.5);
      else if (hour < 14.0) earlyCheckInSurcharge = Math.round(nightlyRate * 0.3);
    }

    if (actualCheckOutTime) {
      const d = new Date(actualCheckOutTime);
      const hour = d.getHours() + d.getMinutes() / 60;
      if (hour > 18.0) lateCheckOutSurcharge = Math.round(nightlyRate * 1.0);
      else if (hour > 15.0) lateCheckOutSurcharge = Math.round(nightlyRate * 0.5);
      else if (hour > 12.0) lateCheckOutSurcharge = Math.round(nightlyRate * 0.3);
    }

    if (extraAdultCount > 0) {
      extraAdultSurcharge = extraAdultCount * 200000 * nights;
    }
    if (child6to11Count > 0) {
      extraChildSurcharge = child6to11Count * 100000 * nights;
    }
  }

  // Bước 4: discount (BR-40..43, chỉ NIGHTLY)
  let discount = 0;
  if (bookingType === 'NIGHTLY') {
    let vipDiscount = 0;
    if (isVipGuest && nights > 3 && holidayNightsCount === 0) {
      vipDiscount = Math.round(roomCharge * 0.10);
    }

    let voucherDiscount = 0;
    if (voucher && holidayNightsCount === 0) {
      if (voucher.type === 'PERCENT') {
        const raw = Math.round((roomCharge * voucher.value) / 100);
        voucherDiscount = voucher.maxDiscount ? Math.min(raw, voucher.maxDiscount) : raw;
      } else {
        voucherDiscount = Math.round(voucher.value);
      }
    }

    // Chọn khoản giảm lớn hơn; nếu bằng nhau chọn VIP (BR-42)
    const bestDiscount = Math.max(vipDiscount, voucherDiscount);
    // Cap at roomCharge (BR-43)
    discount = Math.min(bestDiscount, roomCharge);
  }

  // Bước 5: serviceFeeBase
  const serviceFeeBase = Math.max(
    0,
    roomCharge - discount + holidaySurcharge + earlyCheckInSurcharge + lateCheckOutSurcharge + extraAdultSurcharge + extraChildSurcharge
  );

  // Bước 6: serviceFee (5% trên base)
  const serviceFee = Math.round(serviceFeeBase * serviceFeeRate);

  // Bước 7: servicesTotal (minibar + laundry + damage)
  const services = Math.max(0, servicesTotal);

  // Bước 8: taxable
  const taxableAmount = serviceFeeBase + serviceFee + services;

  // Bước 9: vat (10% trên taxable)
  const vatAmount = Math.round(taxableAmount * vatRate);

  // Bước 10: total
  const totalAmount = taxableAmount + vatAmount;

  // Bước 11: amountDue = total - depositPaid
  const amountDue = totalAmount - depositPaid;

  return {
    roomCharge,
    holidaySurcharge,
    earlyCheckInSurcharge,
    lateCheckOutSurcharge,
    extraAdultSurcharge,
    extraChildSurcharge,
    discount,
    serviceFeeBase,
    serviceFee,
    servicesTotal: services,
    taxableAmount,
    vatAmount,
    totalAmount,
    depositPaid,
    amountDue,
  };
}
