import { axiosClient } from '../axiosClient';
import { mockHandlers } from '../../mocks/mockHandlers';
import { Invoice, PaymentMethod } from '../../types/billing.types';
import { getIdempotencyHeaders } from '../idempotencyHelper';

const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const billingService = {
  getInvoices: async (): Promise<Invoice[]> => {
    if (isMock) return mockHandlers.getInvoices();
    const res = await axiosClient.get<Invoice[]>('/invoices');
    return res.data;
  },

  getInvoiceById: async (invoiceId: string): Promise<Invoice | null> => {
    if (isMock) return mockHandlers.getInvoiceById(invoiceId);
    const res = await axiosClient.get<Invoice>(`/invoices/${invoiceId}`);
    return res.data;
  },

  getInvoiceByReservation: async (reservationId: string): Promise<Invoice | null> => {
    if (isMock) return mockHandlers.getInvoiceByReservation(reservationId);
    const res = await axiosClient.get<Invoice>(`/invoices/${reservationId}`);
    return res.data;
  },

  applyDiscount: async (invoiceId: string, discountPercent: number): Promise<Invoice> => {
    if (isMock) return mockHandlers.applyDiscount(invoiceId, discountPercent);
    const res = await axiosClient.post<Invoice>(`/invoices/${invoiceId}/discount`, { discountPercent });
    return res.data;
  },

  payInvoice: async (
    invoiceId: string,
    amount: number,
    method: PaymentMethod,
    idempotencyKey: string,
    note?: string
  ): Promise<Invoice> => {
    if (isMock) {
      return mockHandlers.payInvoice(invoiceId, amount, method, idempotencyKey, note);
    }
    const res = await axiosClient.post<Invoice>(
      `/invoices/${invoiceId}/pay`,
      { amount, method, note },
      { headers: getIdempotencyHeaders(idempotencyKey) }
    );
    return res.data;
  },
};
