import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { billingService } from '../../../api/services/billing.service';
import { Invoice } from '../../../types/billing.types';
import { InvoicePrintView } from '../components/InvoicePrintView';
import { PaymentModal } from '../components/PaymentModal';

// Figma Seed Invoices (node 39-1820)
const FIGMA_DEFAULT_INVOICES: (Invoice & { roomTypeLabel?: string; stayDurationLabel?: string; displayStatus?: string })[] = [
  {
    id: 'inv-123',
    invoiceNumber: 'HD00123',
    reservationId: 'res-123',
    roomNumber: '101',
    roomTypeLabel: 'Standard',
    guestName: 'Nguyễn Văn A',
    bookingType: 'NIGHTLY',
    checkInDate: '2026-10-28',
    checkOutDate: '2026-10-31',
    stayDurationLabel: '3 đêm',
    items: [{ id: '1', description: 'Tiền phòng Standard (3 đêm)', quantity: 3, unitPrice: 1000000, total: 3000000, type: 'ROOM' }],
    roomCharge: 3000000,
    holidaySurcharge: 0,
    earlyCheckInSurcharge: 0,
    lateCheckOutSurcharge: 0,
    extraAdultSurcharge: 0,
    extraChildSurcharge: 0,
    discount: 0,
    serviceFeeBase: 3000000,
    serviceFee: 150000,
    extraServicesTotal: 0,
    taxableAmount: 3150000,
    vatAmount: 97000,
    totalAmount: 3247000,
    depositPaid: 3247000,
    amountDue: 0,
    status: 'ISSUED',
    displayStatus: 'Đã thanh toán',
    payments: [],
    createdAt: '2026-10-28T09:00:00Z',
  },
  {
    id: 'inv-122',
    invoiceNumber: 'HD00122',
    reservationId: 'res-122',
    roomNumber: '205',
    roomTypeLabel: 'Deluxe',
    guestName: 'Trần Thị B',
    bookingType: 'NIGHTLY',
    checkInDate: '2026-10-28',
    checkOutDate: '2026-10-30',
    stayDurationLabel: '2 đêm',
    items: [{ id: '1', description: 'Tiền phòng Deluxe (2 đêm)', quantity: 2, unitPrice: 1000000, total: 2000000, type: 'ROOM' }],
    roomCharge: 2000000,
    holidaySurcharge: 0,
    earlyCheckInSurcharge: 0,
    lateCheckOutSurcharge: 0,
    extraAdultSurcharge: 0,
    extraChildSurcharge: 0,
    discount: 0,
    serviceFeeBase: 2000000,
    serviceFee: 100000,
    extraServicesTotal: 0,
    taxableAmount: 2100000,
    vatAmount: 50000,
    totalAmount: 2150000,
    depositPaid: 600000,
    amountDue: 1550000,
    status: 'DRAFT',
    displayStatus: 'Chờ quyết toán',
    payments: [],
    createdAt: '2026-10-28T10:30:00Z',
  },
  {
    id: 'inv-121',
    invoiceNumber: 'HD00121',
    reservationId: 'res-121',
    roomNumber: '302',
    roomTypeLabel: 'Suite',
    guestName: 'Lê Minh C',
    bookingType: 'HOURLY',
    checkInDate: '2026-10-27',
    checkOutDate: '2026-10-27',
    stayDurationLabel: 'Theo giờ',
    items: [{ id: '1', description: 'Thuê phòng Suite theo giờ (5h)', quantity: 1, unitPrice: 4000000, total: 4000000, type: 'ROOM' }],
    roomCharge: 4000000,
    holidaySurcharge: 0,
    earlyCheckInSurcharge: 0,
    lateCheckOutSurcharge: 0,
    extraAdultSurcharge: 0,
    extraChildSurcharge: 0,
    discount: 0,
    serviceFeeBase: 4000000,
    serviceFee: 200000,
    extraServicesTotal: 0,
    taxableAmount: 4200000,
    vatAmount: 300000,
    totalAmount: 4500000,
    depositPaid: 4500000,
    amountDue: 0,
    status: 'ISSUED',
    displayStatus: 'Đã thanh toán',
    payments: [],
    createdAt: '2026-10-27T14:00:00Z',
  },
  {
    id: 'inv-120',
    invoiceNumber: 'HD00120',
    reservationId: 'res-120',
    roomNumber: '118',
    roomTypeLabel: 'Standard',
    guestName: 'Phạm Thị D',
    bookingType: 'NIGHTLY',
    checkInDate: '2026-10-27',
    checkOutDate: '2026-10-28',
    stayDurationLabel: '1 đêm',
    items: [{ id: '1', description: 'Tiền phòng Standard (1 đêm)', quantity: 1, unitPrice: 1350000, total: 1350000, type: 'ROOM' }],
    roomCharge: 1350000,
    holidaySurcharge: 0,
    earlyCheckInSurcharge: 0,
    lateCheckOutSurcharge: 0,
    extraAdultSurcharge: 0,
    extraChildSurcharge: 0,
    discount: 0,
    serviceFeeBase: 1350000,
    serviceFee: 67500,
    extraServicesTotal: 0,
    taxableAmount: 1417500,
    vatAmount: 82500,
    totalAmount: 1500000,
    depositPaid: 1500000,
    amountDue: 0,
    status: 'ISSUED',
    displayStatus: 'Đã thanh toán',
    payments: [],
    createdAt: '2026-10-27T16:20:00Z',
  },
  {
    id: 'inv-119',
    invoiceNumber: 'HD00119',
    reservationId: 'res-119',
    roomNumber: '201',
    roomTypeLabel: 'Deluxe',
    guestName: 'Hoàng Anh E',
    bookingType: 'NIGHTLY',
    checkInDate: '2026-10-26',
    checkOutDate: '2026-10-28',
    stayDurationLabel: '2 đêm',
    items: [{ id: '1', description: 'Tiền phòng Deluxe (2 đêm - Hủy phòng)', quantity: 2, unitPrice: 1500000, total: 3000000, type: 'ROOM' }],
    roomCharge: 3000000,
    holidaySurcharge: 0,
    earlyCheckInSurcharge: 0,
    lateCheckOutSurcharge: 0,
    extraAdultSurcharge: 0,
    extraChildSurcharge: 0,
    discount: 0,
    serviceFeeBase: 3000000,
    serviceFee: 0,
    extraServicesTotal: 0,
    taxableAmount: 3000000,
    vatAmount: 0,
    totalAmount: 3000000,
    depositPaid: 0,
    amountDue: 0,
    status: 'DRAFT',
    displayStatus: 'Đã hủy',
    payments: [],
    createdAt: '2026-10-26T11:00:00Z',
  },
  {
    id: 'inv-118',
    invoiceNumber: 'HD00118',
    reservationId: 'res-118',
    roomNumber: '303',
    roomTypeLabel: 'Suite',
    guestName: 'Mai Phương F',
    bookingType: 'NIGHTLY',
    checkInDate: '2026-10-25',
    checkOutDate: '2026-10-28',
    stayDurationLabel: '3 đêm',
    items: [{ id: '1', description: 'Tiền phòng Suite (3 đêm)', quantity: 3, unitPrice: 900000, total: 2700000, type: 'ROOM' }],
    roomCharge: 2700000,
    holidaySurcharge: 0,
    earlyCheckInSurcharge: 0,
    lateCheckOutSurcharge: 0,
    extraAdultSurcharge: 0,
    extraChildSurcharge: 0,
    discount: 0,
    serviceFeeBase: 2700000,
    serviceFee: 135000,
    extraServicesTotal: 0,
    taxableAmount: 2835000,
    vatAmount: 15000,
    totalAmount: 2850000,
    depositPaid: 2850000,
    amountDue: 0,
    status: 'ISSUED',
    displayStatus: 'Đã thanh toán',
    payments: [],
    createdAt: '2026-10-25T15:45:00Z',
  },
];

export const BillingLedgerPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('Hôm nay (28/10)');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const { data: dbInvoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: billingService.getInvoices,
  });

  // Merge DB and Figma default invoices
  const allInvoices = useMemo(() => {
    if (dbInvoices.length > 0) {
      const merged = [...dbInvoices];
      // ensure we have standard figma invoices if not in DB
      for (const fig of FIGMA_DEFAULT_INVOICES) {
        if (!merged.some((inv) => inv.id === fig.id || inv.invoiceNumber === fig.invoiceNumber)) {
          merged.push(fig);
        }
      }
      return merged;
    }
    return FIGMA_DEFAULT_INVOICES;
  }, [dbInvoices]);

  // Filtered
  const filteredInvoices = useMemo(() => {
    return allInvoices.filter((inv) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.guestName.toLowerCase().includes(q) ||
        inv.roomNumber.toLowerCase().includes(q);

      const statusLabel =
        (inv as any).displayStatus || (inv.status === 'ISSUED' ? 'Đã thanh toán' : 'Chờ quyết toán');

      const matchStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'PAID' && statusLabel === 'Đã thanh toán') ||
        (selectedStatus === 'PENDING' && statusLabel === 'Chờ quyết toán') ||
        (selectedStatus === 'CANCELLED' && statusLabel === 'Đã hủy');

      return matchSearch && matchStatus;
    });
  }, [allInvoices, searchTerm, selectedStatus]);

  // Pagination (6 items matching Figma)
  const pageSize = 6;
  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const pagedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage]);

  const handleExportReport = () => {
    alert('Đang xuất sổ cái hóa đơn định dạng Excel (.xlsx) theo chuẩn kế toán khách sạn...');
  };

  const renderStatusBadge = (inv: Invoice) => {
    const statusLabel =
      (inv as any).displayStatus || (inv.status === 'ISSUED' ? 'Đã thanh toán' : 'Chờ quyết toán');

    if (statusLabel === 'Đã thanh toán') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 12px',
            backgroundColor: '#dcfce7',
            color: '#15803d',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          Đã thanh toán
        </span>
      );
    } else if (statusLabel === 'Chờ quyết toán') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 12px',
            backgroundColor: '#fef3c7',
            color: '#b45309',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          Chờ quyết toán
        </span>
      );
    } else {
      return (
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
          {statusLabel}
        </span>
      );
    }
  };

  return (
    <div style={{ padding: '4px 8px 32px' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '22px' }}>
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
          Hóa đơn / Quyết toán
        </h1>
        <p
          style={{
            fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", sans-serif',
            fontSize: '13.5px',
            color: '#73675e',
            margin: 0,
          }}
        >
          Sổ cái theo dõi doanh thu, quyết toán công nợ và lịch sử thanh toán hóa đơn.
        </p>
      </div>

      {/* Control Bar: Search + Filters + Export */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <div
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#95785c',
              fontSize: '14px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã hóa đơn, tên khách, số..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              backgroundColor: '#ede5d8',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13.5px',
              color: '#482e24',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Status Dropdown */}
        <div style={{ minWidth: '170px' }}>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#ede5d8',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#482e24',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <option value="ALL">Trạng thái: Tất cả</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="PENDING">Chờ quyết toán</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        {/* Date Filter Button */}
        <button
          onClick={() => {}}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#ede5d8',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#482e24',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          <span>{selectedDate}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>

        {/* Export Report Button */}
        <button
          onClick={handleExportReport}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 18px',
            backgroundColor: '#ffffff',
            border: '1px solid #ebd9c8',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#482e24',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fdfbf7')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Xuất báo cáo</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(72, 46, 36, 0.04)',
          border: '1px solid #ebd9c8',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#ede6da' }}>
              <th
                style={{
                  padding: '14px 24px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6d5b52',
                  letterSpacing: '0.5px',
                  width: '22%',
                }}
              >
                MÃ HÓA ĐƠN &amp; PHÒNG
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6d5b52',
                  letterSpacing: '0.5px',
                  width: '20%',
                }}
              >
                KHÁCH HÀNG
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6d5b52',
                  letterSpacing: '0.5px',
                  width: '22%',
                }}
              >
                NGÀY LẬP / KỲ LƯU TRÚ
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6d5b52',
                  letterSpacing: '0.5px',
                  width: '18%',
                }}
              >
                TỔNG TIỀN
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6d5b52',
                  letterSpacing: '0.5px',
                  width: '12%',
                }}
              >
                TRẠNG THÁI
              </th>
              <th
                style={{
                  padding: '14px 24px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6d5b52',
                  letterSpacing: '0.5px',
                  textAlign: 'right',
                  width: '10%',
                }}
              >
                THAO TÁC
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#8c7e74' }}>
                  Không tìm thấy hóa đơn phù hợp.
                </td>
              </tr>
            ) : (
              pagedInvoices.map((inv) => {
                const roomType = (inv as any).roomTypeLabel || 'Standard';
                const stayDuration = (inv as any).stayDurationLabel || (inv.bookingType === 'HOURLY' ? 'Theo giờ' : '1 đêm');

                return (
                  <tr
                    key={inv.id}
                    style={{
                      borderBottom: '1px solid #f2ece3',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fdfbf7')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    {/* Invoice Code & Room */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#362118' }}>
                        {inv.invoiceNumber}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8c7e74', marginTop: '2px' }}>
                        P.{inv.roomNumber} - {roomType}
                      </div>
                    </td>

                    {/* Guest Name */}
                    <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 700, color: '#362118' }}>
                      {inv.guestName}
                    </td>

                    {/* Date / Stay Duration */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '13.5px', color: '#482e24' }}>
                        {inv.checkInDate ? inv.checkInDate.split('-').reverse().join('/') : '28/10/2026'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8c7e74', marginTop: '2px' }}>
                        {stayDuration}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td style={{ padding: '16px 20px', fontSize: '14.5px', fontWeight: 700, color: '#362118' }}>
                      {inv.totalAmount.toLocaleString('vi-VN')} đ
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 20px' }}>
                      {renderStatusBadge(inv)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                        {/* Print Button */}
                        <button
                          onClick={() => setPrintingInvoice(inv)}
                          title="In hóa đơn"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#6d5b52',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ede5d8')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                          </svg>
                        </button>

                        {/* View / Edit Button */}
                        <button
                          onClick={() => navigate(`/billing/${inv.id}`)}
                          title="Xem chi tiết hóa đơn"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#6d5b52',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ede5d8')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>

                        {/* More Menu Button */}
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === inv.id ? null : inv.id)}
                          title="Tùy chọn khác"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#6d5b52',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ede5d8')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="5" r="1.5"></circle>
                            <circle cx="12" cy="12" r="1.5"></circle>
                            <circle cx="12" cy="19" r="1.5"></circle>
                          </svg>
                        </button>

                        {/* Popover Menu */}
                        {activeMenuId === inv.id && (
                          <div
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: '100%',
                              backgroundColor: '#ffffff',
                              border: '1px solid #ebd9c8',
                              borderRadius: '8px',
                              boxShadow: '0 8px 24px rgba(72, 46, 36, 0.12)',
                              padding: '6px 0',
                              zIndex: 100,
                              minWidth: '180px',
                              textAlign: 'left',
                            }}
                          >
                            <button
                              onClick={() => {
                                setPayingInvoice(inv);
                                setActiveMenuId(null);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 14px',
                                background: 'none',
                                border: 'none',
                                fontSize: '13px',
                                color: '#482e24',
                                textAlign: 'left',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fdfbf7')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              Thu tiền / Quyết toán
                            </button>
                            <button
                              onClick={() => {
                                setPrintingInvoice(inv);
                                setActiveMenuId(null);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 14px',
                                background: 'none',
                                border: 'none',
                                fontSize: '13px',
                                color: '#482e24',
                                textAlign: 'left',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fdfbf7')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              In phiếu thanh toán
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '16px 24px',
            borderTop: '1px solid #f2ece3',
            gap: '8px',
          }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #ebd9c8',
              backgroundColor: '#ffffff',
              color: '#6d5b52',
              fontSize: '13px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: currentPage === pageNum ? '#482e24' : 'transparent',
                color: currentPage === pageNum ? '#ffffff' : '#6d5b52',
                fontSize: '13px',
                fontWeight: currentPage === pageNum ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #ebd9c8',
              backgroundColor: '#ffffff',
              color: '#6d5b52',
              fontSize: '13px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Print View Modal */}
      {printingInvoice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(72, 46, 36, 0.4)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(72, 46, 36, 0.2)',
            }}
          >
            <InvoicePrintView invoice={printingInvoice} onBack={() => setPrintingInvoice(null)} />
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {payingInvoice && (
        <PaymentModal
          isOpen={true}
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onSuccess={() => {
            setPayingInvoice(null);
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
          }}
        />
      )}
    </div>
  );
};
