import React from 'react';
import { Invoice } from '../../../types/billing.types';
import { CurrencyDisplay } from '../../../components/common/CurrencyDisplay';
import { formatDateVN } from '../../../utils/formatters';

interface InvoicePrintViewProps {
  invoice: Invoice;
  onBack: () => void;
}

export const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({ invoice, onBack }) => {
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: '#fff', padding: '32px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff' }}>
          ← Quay lại
        </button>
        <button onClick={() => window.print()} style={{ padding: '6px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600 }}>
          In ra máy in / Xuất PDF
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>KHÁCH SẠN NGHỈ DƯỠNG QUỐC TẾ HMS</h2>
        <p style={{ fontSize: '12px', color: '#64748b' }}>Địa chỉ: 123 Đường Biển, Quận 1, TP. Đà Nẵng | Hotline: 1900 6868</p>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: '16px' }}>HÓA ĐƠN THANH TOÁN DỊCH VỤ</h3>
        <p style={{ fontSize: '13px', color: '#64748b' }}>Số: {invoice.invoiceNumber}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '16px' }}>
        <div>
          <div>Khách hàng: <b>{invoice.guestName}</b></div>
          <div>Phòng lưu trú: <b>{invoice.roomNumber}</b></div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div>Ngày đến: {formatDateVN(invoice.checkInDate)}</div>
          <div>Ngày đi: {formatDateVN(invoice.checkOutDate)}</div>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #0f172a', textAlign: 'left' }}>
            <th style={{ padding: '8px 0' }}>Khoản mục</th>
            <th style={{ padding: '8px 0', width: '15%' }}>SL</th>
            <th style={{ padding: '8px 0', width: '25%', textAlign: 'right' }}>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it) => (
            <tr key={it.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px 0' }}>{it.description}</td>
              <td style={{ padding: '8px 0' }}>{it.quantity}</td>
              <td style={{ padding: '8px 0', textAlign: 'right' }}><CurrencyDisplay amount={it.total} fontSize="13px" /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', fontSize: '13px', borderTop: '1px solid #0f172a', paddingTop: '10px' }}>
        <div>Tạm tính: <CurrencyDisplay amount={invoice.subTotal} /></div>
        <div>Chiết khấu ({invoice.discountPercent}%): - <CurrencyDisplay amount={invoice.discountAmount} color="#16a34a" /></div>
        <div>Thuế GTGT (10%): <CurrencyDisplay amount={invoice.vatAmount} /></div>
        <div style={{ fontSize: '16px', fontWeight: 800 }}>TỔNG THANH TOÁN: <CurrencyDisplay amount={invoice.totalAmount} fontSize="17px" /></div>
        <div>Đã thu: <CurrencyDisplay amount={invoice.paidAmount} color="#16a34a" /></div>
      </div>

      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', textAlign: 'center', fontSize: '13px' }}>
        <div>
          <b>Khách hàng ký nhận</b>
          <br /><br /><br />
          <span>{invoice.guestName}</span>
        </div>
        <div>
          <b>Nhân viên thu ngân</b>
          <br /><br /><br />
          <span>Lễ tân ca trực</span>
        </div>
      </div>
    </div>
  );
};
