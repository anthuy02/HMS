import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { billingService } from '../../../api/services/billing.service';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { CurrencyDisplay } from '../../../components/common/CurrencyDisplay';
import { formatDateVN, formatDateTimeVN } from '../../../utils/formatters';
import { PaymentModal } from '../components/PaymentModal';
import { InvoicePrintView } from '../components/InvoicePrintView';

export const InvoiceDetailPage: React.FC = () => {
  const { invoiceId = 'inv-103' } = useParams<{ invoiceId: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [discountInput, setDiscountInput] = useState(0);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isPrintView, setIsPrintView] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => billingService.getInvoiceById(invoiceId),
  });

  const handleApplyDiscount = async () => {
    if (!invoice) return;
    try {
      await billingService.applyDiscount(invoice.id, discountInput);
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
    } catch (err: any) {
      alert(err.message || 'Lỗi áp dụng giảm giá');
    }
  };

  if (isLoading) return <div>Đang tải thông tin hóa đơn...</div>;
  if (!invoice) {
    return (
      <div>
        <h2>Không tìm thấy hóa đơn mã: {invoiceId}</h2>
        <button onClick={() => navigate('/front-desk')}>Quay lại Bàn lễ tân</button>
      </div>
    );
  }

  if (isPrintView) {
    return <InvoicePrintView invoice={invoice} onBack={() => setIsPrintView(false)} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
            [F05] Hóa đơn Thanh toán: {invoice.invoiceNumber}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Phòng {invoice.roomNumber} - Khách hàng: <b>{invoice.guestName}</b>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsPrintView(true)}
            style={{ padding: '8px 16px', backgroundColor: '#475569', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}
          >
            In Hóa đơn (BILL_03)
          </button>
          {invoice.remainingBalance > 0 && (
            <button
              onClick={() => setIsPayModalOpen(true)}
              style={{ padding: '8px 16px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}
            >
              Thu tiền / Thanh toán (BR06)
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Bảng kê chi tiết các mục (BR05) */}
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
            Bảng kê chi tiết các khoản (BILL_01)
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
                  <td style={{ padding: '10px' }}>{it.description}</td>
                  <td style={{ padding: '10px' }}>{it.quantity}</td>
                  <td style={{ padding: '10px' }}><CurrencyDisplay amount={it.unitPrice} fontSize="13px" isBold={false} /></td>
                  <td style={{ padding: '10px', textAlign: 'right' }}><CurrencyDisplay amount={it.total} fontSize="13px" /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Lịch sử thanh toán */}
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginTop: '24px', marginBottom: '10px' }}>
            Lịch sử giao dịch thanh toán:
          </h4>
          {invoice.payments.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>Chưa có thanh toán nào được ghi nhận.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {invoice.payments.map((p) => (
                <div key={p.id} style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b>{p.method}</b> - {formatDateTimeVN(p.transactionDate)}
                    <div style={{ color: '#64748b' }}>Key: {p.idempotencyKey}</div>
                  </div>
                  <CurrencyDisplay amount={p.amount} color="#16a34a" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tổng kết & Chiết khấu & Thuế */}
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Trạng thái:</span>
            <StatusBadge status={invoice.status} />
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tiền phòng:</span>
              <CurrencyDisplay amount={invoice.roomCharge} isBold={false} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Dịch vụ Minibar/Giặt ủi:</span>
              <CurrencyDisplay amount={invoice.serviceCharge} isBold={false} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Phụ thu trả muộn (BR04):</span>
              <CurrencyDisplay amount={invoice.lateSurcharge} isBold={false} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
              <span>Tạm tính (SubTotal):</span>
              <CurrencyDisplay amount={invoice.subTotal} />
            </div>
          </div>

          {/* Form chiết khấu BVA [0 - 100%] */}
          <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Chiết khấu (%) [BVA: 0 - 100%]:
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="number"
                min={0}
                max={100}
                value={discountInput}
                onChange={(e) => setDiscountInput(Number(e.target.value))}
                style={{ width: '80px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
              <button
                onClick={handleApplyDiscount}
                style={{ padding: '4px 10px', fontSize: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600 }}
              >
                Áp dụng
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
              <span>Giảm giá ({invoice.discountPercent}%):</span>
              <span>- <CurrencyDisplay amount={invoice.discountAmount} color="#16a34a" /></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Thuế VAT (10%):</span>
              <CurrencyDisplay amount={invoice.vatAmount} isBold={false} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, borderTop: '2px solid #0f172a', paddingTop: '10px' }}>
              <span>TỔNG CỘNG:</span>
              <CurrencyDisplay amount={invoice.totalAmount} fontSize="18px" color="#2563eb" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>Đã thanh toán:</span>
              <CurrencyDisplay amount={invoice.paidAmount} color="#16a34a" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, color: '#dc2626' }}>
              <span>Còn nợ lại:</span>
              <CurrencyDisplay amount={invoice.remainingBalance} color="#dc2626" fontSize="16px" />
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPayModalOpen}
        invoice={invoice}
        onClose={() => setIsPayModalOpen(false)}
        onSuccess={() => {
          setIsPayModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
        }}
      />
    </div>
  );
};
