export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER';
export type ServiceChargeType = 'MINIBAR' | 'LAUNDRY' | 'DAMAGE';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'ROOM' | 'SERVICE' | 'SURCHARGE';
  serviceType?: ServiceChargeType;
  damageNote?: string;
}

export interface PaymentRecord {
  id: string;
  type: 'DEPOSIT_CHARGE' | 'DEPOSIT_REFUND' | 'CHECKOUT_CHARGE' | 'CHECKOUT_REFUND';
  amount: number;
  method: PaymentMethod;
  transactionDate: string;
  idempotencyKey: string;
  note?: string;
  status: 'SUCCEEDED' | 'FAILED';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  reservationId: string;
  roomNumber: string;
  guestName: string;
  bookingType: 'NIGHTLY' | 'HOURLY';
  checkInDate: string;
  checkOutDate: string;
  items: InvoiceItem[];
  
  // 11-step billing calculation breakdown (BR-50)
  roomCharge: number;
  holidaySurcharge: number;
  earlyCheckInSurcharge: number;
  lateCheckOutSurcharge: number;
  extraAdultSurcharge: number;
  extraChildSurcharge: number;
  discount: number;
  serviceFeeBase: number;
  serviceFee: number;
  extraServicesTotal: number;
  taxableAmount: number;
  vatAmount: number;
  totalAmount: number;
  depositPaid: number;
  amountDue: number; // positive = customer owes; zero = balanced; negative = refund due to customer (BR-84)
  
  status: 'ISSUED' | 'DRAFT';
  payments: PaymentRecord[];
  createdAt: string;
}
