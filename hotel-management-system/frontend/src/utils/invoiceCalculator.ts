/**
 * Tính toán hóa đơn theo quy tắc [BR05]:
 * Total = (Phòng + Dịch vụ + Phụ thu - Chiết khấu) + VAT 10%
 * Làm tròn HALF_UP tiền tệ VNĐ (số nguyên)
 */

export interface InvoiceCalculationInput {
  roomCharge: number;
  serviceCharge: number;
  lateSurcharge: number;
  discountPercent: number; // 0 - 100%
  vatRate?: number;        // default 0.10 (10%)
}

export interface InvoiceCalculationResult {
  subTotal: number;
  discountAmount: number;
  amountAfterDiscount: number;
  vatAmount: number;
  totalAmount: number;
}

export function calculateInvoiceTotals(params: InvoiceCalculationInput): InvoiceCalculationResult {
  const { roomCharge, serviceCharge, lateSurcharge, discountPercent = 0, vatRate = 0.10 } = params;

  // 1. Tổng tiền trước giảm trừ
  const subTotal = Math.max(0, roomCharge + serviceCharge + lateSurcharge);

  // 2. Chiết khấu theo % (chặn trong khoảng 0% - 100%)
  const clampedDiscount = Math.min(100, Math.max(0, discountPercent));
  const discountAmount = Math.round((subTotal * clampedDiscount) / 100);

  // 3. Sau chiết khấu
  const amountAfterDiscount = Math.max(0, subTotal - discountAmount);

  // 4. Thuế VAT 10%
  const vatAmount = Math.round(amountAfterDiscount * vatRate);

  // 5. Tổng thanh toán
  const totalAmount = amountAfterDiscount + vatAmount;

  return {
    subTotal,
    discountAmount,
    amountAfterDiscount,
    vatAmount,
    totalAmount,
  };
}
