import React, { useState } from 'react';
import { Invoice, PaymentMethod } from '../../../types/billing.types';
import { billingService } from '../../../api/services/billing.service';
import { generateIdempotencyKey } from '../../../api/idempotencyHelper';
import { CurrencyDisplay } from '../../../components/common/CurrencyDisplay';

interface PaymentModalProps {
  isOpen: boolean;
  invoice: Invoice;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, invoice, onClose, onSuccess }) => {
  const [amount, setAmount] = useState(invoice.amountDue || 0);
  const [method, setMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [note, setNote] = useState('');
  const [idempotencyKey] = useState(() => generateIdempotencyKey()); // Sinh UUID v4 chống lặp (BR06)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // BR06: Chặn trả thừa
    if (amount <= 0) {
      setError('Số tiền thanh toán phải lớn hơn 0.');
      return;
    }
    if (amount > invoice.amountDue) {
      setError(`Quy tắc [BR06]: Chặn thanh toán thừa! Số tiền nhập vượt quá dư nợ (${invoice.amountDue.toLocaleString()} ₫).`);
      return;
    }

    setLoading(true);
    try {
      await billingService.payInvoice(invoice.id, amount, method, idempotencyKey, note);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi thanh toán');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '10px', width: '100%', maxWidth: '440px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
          [BR06] Thu tiền Hóa đơn {invoice.invoiceNumber}
        </h3>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
          Dư nợ còn lại: <CurrencyDisplay amount={invoice.amountDue} color="#dc2626" />
        </p>

        {error && <div style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}

        <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Số tiền thanh toán (VNĐ)</label>
            <input
              type="number"
              required
              max={invoice.amountDue}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Hình thức thanh toán</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="BANK_TRANSFER">Chuyển khoản Ngân hàng (QR Code)</option>
              <option value="CASH">Tiền mặt</option>
              <option value="CREDIT_CARD">Thẻ Tín dụng / POS</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Ghi chú thu tiền</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: Đã nhận tiền qua Vietcombank..." style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>

          <div style={{ padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '11px', color: '#64748b' }}>
            <b>Idempotency-Key (UUID v4):</b> {idempotencyKey}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>Hủy</button>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600 }}>
              {loading ? 'Đang thực hiện...' : 'Xác nhận Thu tiền'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
