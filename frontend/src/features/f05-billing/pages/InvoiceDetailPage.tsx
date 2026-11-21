import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { billingService } from '../../../api/services/billing.service';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { CurrencyDisplay } from '../../../components/common/CurrencyDisplay';
import { formatDateVN } from '../../../utils/formatters';
import { InvoicePrintView } from '../components/InvoicePrintView';

export const InvoiceDetailPage: React.FC = () => {
  const { invoiceId = 'inv-103' } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [isPrintView, setIsPrintView] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => billingService.getInvoiceById(invoiceId),
  });

  if (isLoading) return <div style={{ padding: '32px', color: '#6d5b52' }}>Đang tải thông tin hóa đơn...</div>;
  if (!invoice) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#362118', marginBottom: '8px' }}>
          Không tìm thấy hóa đơn mã: {invoiceId}
        </h2>
        <p style={{ fontSize: '13px', color: '#786c65', marginBottom: '20px' }}>
          Hóa đơn này có thể chưa được tạo hoặc đã tất toán.
        </p>
        <button
          onClick={() => navigate('/billing')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#482e24',
            color: '#f8f5ec',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ← Quay lại Sổ cái Hóa đơn
        </button>
      </div>
    );
  }

  if (isPrintView) {
    return <InvoicePrintView invoice={invoice} onBack={() => setIsPrintView(false)} />;
  }

  return (
    <div style={{ padding: '4px 8px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '32px',
              fontWeight: 700,
              color: '#482e24',
              lineHeight: 1.15,
              margin: '0 0 6px 0',
              letterSpacing: '-0.3px',
            }}
          >
            Hóa đơn thanh toán {invoice.invoiceNumber}
          </h1>
          <p
            style={{
              fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", sans-serif',
              fontSize: '13.5px',
              color: '#73675e',
              margin: 0,
            }}
          >
            Phòng {invoice.roomNumber} - Khách hàng: <b>{invoice.guestName}</b> [{invoice.bookingType}]
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsPrintView(true)}
            style={{ padding: '8px 16px', backgroundColor: '#475569', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}
          >
            In Hóa đơn (BILL_03)
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Bảng kê chi tiết các khoản (BR-50) */}
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
            Bảng kê chi tiết các khoản phí [BR-50]
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Mô tả</th>
                <th style={{ padding: '10px', width: '12%' }}>Số lượng</th>
                <th style={{ padding: '10px', width: '25%' }}>Đơn giá</th>
                <th style={{ padding: '10px', width: '25%', textAlign: 'right' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it) => (
                <tr key={it.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px' }}>
                    {it.description}
                    {it.damageNote && <div style={{ fontSize: '11px', color: '#dc2626' }}>Ghi chú: {it.damageNote}</div>}
                  </td>
                  <td style={{ padding: '10px' }}>{it.quantity}</td>
                  <td style={{ padding: '10px' }}><CurrencyDisplay amount={it.unitPrice} fontSize="13px" isBold={false} /></td>
                  <td style={{ padding: '10px', textAlign: 'right' }}><CurrencyDisplay amount={it.total} fontSize="13px" /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Lịch sử giao dịch */}
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginTop: '24px', marginBottom: '10px' }}>
            Lịch sử giao dịch thanh toán / hoàn tiền qua Gateway:
          </h4>
          {invoice.payments.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>Chưa có giao dịch thanh toán.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {invoice.payments.map((p) => (
                <div key={p.id} style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b>{p.type}</b> ({p.method}) - {new Date(p.transactionDate).toLocaleString('vi-VN')}
                    <div style={{ color: '#64748b' }}>Key: {p.idempotencyKey} | Ghi chú: {p.note}</div>
                  </div>
                  <CurrencyDisplay amount={p.amount} color={p.type.includes('REFUND') ? '#0284c7' : '#16a34a'} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cột tổng hợp 11 bước (BR-50) */}
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Trạng thái:</span>
            <StatusBadge status={invoice.status} />
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>1. Tiền phòng (roomCharge):</span>
              <CurrencyDisplay amount={invoice.roomCharge} isBold={false} fontSize="12px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>2. Phụ thu ngày lễ (+20%):</span>
              <CurrencyDisplay amount={invoice.holidaySurcharge} isBold={false} fontSize="12px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>3. Phụ thu nhận sớm:</span>
              <CurrencyDisplay amount={invoice.earlyCheckInSurcharge} isBold={false} fontSize="12px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>3. Phụ thu trả muộn:</span>
              <CurrencyDisplay amount={invoice.lateCheckOutSurcharge} isBold={false} fontSize="12px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
              <span>4. Giảm giá (discount):</span>
              <span>- <CurrencyDisplay amount={invoice.discount} color="#16a34a" fontSize="12px" /></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
              <span>5. Base tính phí DV (serviceFeeBase):</span>
              <CurrencyDisplay amount={invoice.serviceFeeBase} fontSize="12px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>6. Phí dịch vụ (5%):</span>
              <CurrencyDisplay amount={invoice.serviceFee} isBold={false} fontSize="12px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>7. Dịch vụ (Minibar/Laundry/Damage):</span>
              <CurrencyDisplay amount={invoice.extraServicesTotal} isBold={false} fontSize="12px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
              <span>8. Thuế suất cơ sở (taxable):</span>
              <CurrencyDisplay amount={invoice.taxableAmount} fontSize="12px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>9. Thuế VAT (10%):</span>
              <CurrencyDisplay amount={invoice.vatAmount} isBold={false} fontSize="12px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, borderTop: '2px solid #0f172a', paddingTop: '8px' }}>
              <span>10. TỔNG CỘNG (total):</span>
              <CurrencyDisplay amount={invoice.totalAmount} fontSize="16px" color="#2563eb" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontSize: '13px' }}>
              <span>Cọc đã thu (depositPaid):</span>
              <CurrencyDisplay amount={invoice.depositPaid} color="#16a34a" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
              <span>11. SỐ DƯ TẤT TOÁN (amountDue):</span>
              <CurrencyDisplay amount={invoice.amountDue} color={invoice.amountDue > 0 ? '#dc2626' : invoice.amountDue < 0 ? '#0284c7' : '#16a34a'} fontSize="15px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
