export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'ROOM' | 'SERVICE' | 'SURCHARGE';
}

export interface PaymentRecord {
  id: string;
  amount: number;
  method: PaymentMethod;
  transactionDate: string;
  idempotencyKey: string;
  note?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  reservationId: string;
  roomNumber: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  items: InvoiceItem[];
  roomCharge: number;
  serviceCharge: number;
  lateSurcharge: number;
  subTotal: number;
  discountPercent: number;
  discountAmount: number;
  vatRate: number; // e.g. 0.1 (10%)
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  status: PaymentStatus;
  payments: PaymentRecord[];
  createdAt: string;
}
