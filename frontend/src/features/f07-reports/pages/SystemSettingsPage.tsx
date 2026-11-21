import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { systemConfigService } from '../../../api/services/systemConfig.service';
import { useAuth } from '../../../app/providers/AuthProvider';

export const SystemSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const currentRole = user?.role || 'ADMIN';

  const [activeTab, setActiveTab] = useState<'HOTEL' | 'ACCOUNT' | 'ROLES' | 'OPTIONS'>('HOTEL');

  // Hotel info states
  const [hotelName, setHotelName] = useState('Royal Hotel');
  const [address, setAddress] = useState('123 Nguyễn Văn A, Quận 1, TP.HCM');
  const [phone, setPhone] = useState('028 1234 5678');
  const [email, setEmail] = useState('contact@royalhotel.com');

  // Financial parameter states (BR-88)
  const [depositRate, setDepositRate] = useState<number>(30);
  const [serviceFeeRate, setServiceFeeRate] = useState<number>(5);
  const [vatRate, setVatRate] = useState<number>(10);
  const [isEditingParams, setIsEditingParams] = useState(false);

  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { data: config } = useQuery({
    queryKey: ['system-config'],
    queryFn: systemConfigService.getConfig,
  });

  useEffect(() => {
    if (config) {
      setDepositRate(config.depositRatePercent);
      setServiceFeeRate(config.serviceFeeRatePercent);
      setVatRate(config.vatRatePercent);
    }
  }, [config]);

  const handleSaveHotelInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      await systemConfigService.updateConfig(
        {
          depositRatePercent: depositRate,
          serviceFeeRatePercent: serviceFeeRate,
          vatRatePercent: vatRate,
        },
        currentRole
      );
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = () => {
    alert('Vui lòng chọn file hình ảnh logo khách sạn mới (.png, .svg, .jpg, max 2MB)');
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
            margin: '0',
            letterSpacing: '-0.3px',
          }}
        >
          Cài đặt hệ thống
        </h1>
      </div>

      {/* Main Container Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(72, 46, 36, 0.04)',
          border: '1px solid #ebd9c8',
          padding: '0 0 28px',
          overflow: 'hidden',
        }}
      >
        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #f2ece3',
            padding: '0 28px',
            gap: '32px',
          }}
        >
          {[
            { id: 'HOTEL', label: 'Thông tin khách sạn' },
            { id: 'ACCOUNT', label: 'Tài khoản' },
            { id: 'ROLES', label: 'Phân quyền' },
            { id: 'OPTIONS', label: 'Tùy chọn' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '18px 0 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #482e24' : '2px solid transparent',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#362118' : '#786c65',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Thông tin khách sạn (Figma Node 46-2461) */}
        {activeTab === 'HOTEL' && (
          <div style={{ padding: '28px 32px 10px' }}>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#362118',
                margin: '0 0 24px',
              }}
            >
              Thông tin khách sạn
            </h3>

            {savedSuccess && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#f0fdf4',
                  color: '#15803d',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '20px',
                }}
              >
                ✓ Lưu thay đổi thông tin khách sạn và tham số tài chính thành công!
              </div>
            )}

            <form onSubmit={handleSaveHotelInfo}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Tên khách sạn */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: '16px' }}>
                  <label style={{ fontSize: '13.5px', color: '#6d5b52', fontWeight: 500 }}>
                    Tên khách sạn
                  </label>
                  <input
                    type="text"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: '8px',
                      border: '1px solid #ebd9c8',
                      backgroundColor: '#ffffff',
                      fontSize: '14px',
                      color: '#482e24',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Địa chỉ */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: '16px' }}>
                  <label style={{ fontSize: '13.5px', color: '#6d5b52', fontWeight: 500 }}>
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: '8px',
                      border: '1px solid #ebd9c8',
                      backgroundColor: '#ffffff',
                      fontSize: '14px',
                      color: '#482e24',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Điện thoại */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: '16px' }}>
                  <label style={{ fontSize: '13.5px', color: '#6d5b52', fontWeight: 500 }}>
                    Điện thoại
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: '8px',
                      border: '1px solid #ebd9c8',
                      backgroundColor: '#ffffff',
                      fontSize: '14px',
                      color: '#482e24',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: '16px' }}>
                  <label style={{ fontSize: '13.5px', color: '#6d5b52', fontWeight: 500 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: '8px',
                      border: '1px solid #ebd9c8',
                      backgroundColor: '#ffffff',
                      fontSize: '14px',
                      color: '#482e24',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Logo */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: '16px' }}>
                  <label style={{ fontSize: '13.5px', color: '#6d5b52', fontWeight: 500 }}>
                    Logo
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '74px',
                        height: '44px',
                        borderRadius: '6px',
                        backgroundColor: '#362118',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #ebd9c8',
                        color: '#d4af37',
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18"/>
                        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
                        <path d="M9 9h1"/>
                        <path d="M9 13h1"/>
                        <path d="M14 9h1"/>
                        <path d="M14 13h1"/>
                      </svg>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogoChange}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        backgroundColor: '#fdfbf7',
                        border: '1px solid #ebd9c8',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#482e24',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <span>🔄</span>
                      <span>Thay đổi</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Highlighted Banner: Tham số tài chính hệ thống */}
                <div
                  style={{
                    marginTop: '8px',
                    padding: '16px 20px',
                    backgroundColor: '#f7f1e6',
                    borderRadius: '10px',
                    border: '1px solid #ede4d5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#482e24' }}>
                      Tham số tài chính hệ thống:
                    </span>
                    <span style={{ fontSize: '13px', color: '#594539' }}>
                      Tỷ lệ cọc mặc định: <b>{depositRate}%</b>
                    </span>
                    <span style={{ color: '#baa797' }}>•</span>
                    <span style={{ fontSize: '13px', color: '#594539' }}>
                      Phí dịch vụ: <b>{serviceFeeRate}%</b>
                    </span>
                    <span style={{ color: '#baa797' }}>•</span>
                    <span style={{ fontSize: '13px', color: '#594539' }}>
                      Thuế VAT: <b>{vatRate}%</b>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditingParams(!isEditingParams)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '12.5px',
                      color: '#95785c',
                      textDecoration: 'underline',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {isEditingParams ? 'Thu gọn' : 'Chỉnh sửa tham số'}
                  </button>
                </div>

                {/* Inline Financial Parameter Inputs if expanded */}
                {isEditingParams && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '14px',
                      padding: '16px',
                      backgroundColor: '#fdfbf7',
                      borderRadius: '8px',
                      border: '1px dashed #ebd9c8',
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482e24', marginBottom: '4px' }}>
                        Tỷ lệ cọc mặc định (%) [BR-20]
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={depositRate}
                        onChange={(e) => setDepositRate(Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ebd9c8', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482e24', marginBottom: '4px' }}>
                        Phí phục vụ (%) [BR-50]
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={serviceFeeRate}
                        onChange={(e) => setServiceFeeRate(Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ebd9c8', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482e24', marginBottom: '4px' }}>
                        Thuế GTGT VAT (%) [BR-50]
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={vatRate}
                        onChange={(e) => setVatRate(Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ebd9c8', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '11px 26px',
                      backgroundColor: '#482e24',
                      color: '#f8f5ec',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(72, 46, 36, 0.2)',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#362118')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#482e24')}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Tài khoản */}
        {activeTab === 'ACCOUNT' && (
          <div style={{ padding: '28px 32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#362118', margin: '0 0 16px' }}>
              Chính sách Bảo mật &amp; Đăng nhập
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '600px' }}>
              <div style={{ padding: '14px', backgroundColor: '#fdfbf7', borderRadius: '8px', border: '1px solid #ebd9c8' }}>
                <div style={{ fontWeight: 600, color: '#482e24', fontSize: '13.5px' }}>Khóa tài khoản tự động (Quy tắc BR-71)</div>
                <div style={{ fontSize: '12.5px', color: '#786c65', marginTop: '4px' }}>
                  Hệ thống tự động khóa tài khoản trong <b>15 phút</b> khi nhân viên nhập sai mật khẩu <b>5 lần liên tiếp</b>.
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: '#fdfbf7', borderRadius: '8px', border: '1px solid #ebd9c8' }}>
                <div style={{ fontWeight: 600, color: '#482e24', fontSize: '13.5px' }}>Bảo vệ tài khoản Quản trị viên (Quy tắc BR-94)</div>
                <div style={{ fontSize: '12.5px', color: '#786c65', marginTop: '4px' }}>
                  Administrator không được tự vô hiệu hóa tài khoản của chính mình và hệ thống luôn duy trì ít nhất 01 tài khoản ADMIN hoạt động.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Phân quyền */}
        {activeTab === 'ROLES' && (
          <div style={{ padding: '28px 32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#362118', margin: '0 0 16px' }}>
              Ma trận Phân quyền Vai trò RBAC (Quy tắc BR-75)
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#ede6da', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px', color: '#6d5b52', fontWeight: 700 }}>Chức năng</th>
                  <th style={{ padding: '10px 14px', color: '#6d5b52', fontWeight: 700 }}>ADMIN</th>
                  <th style={{ padding: '10px 14px', color: '#6d5b52', fontWeight: 700 }}>MANAGER</th>
                  <th style={{ padding: '10px 14px', color: '#6d5b52', fontWeight: 700 }}>RECEPTIONIST</th>
                  <th style={{ padding: '10px 14px', color: '#6d5b52', fontWeight: 700 }}>HOUSEKEEPER</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f2ece3' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>Quản lý Nhân sự &amp; Phân quyền</td>
                  <td style={{ padding: '12px 14px', color: '#15803d', fontWeight: 700 }}>Toàn quyền</td>
                  <td style={{ padding: '12px 14px', color: '#786c65' }}>Xem</td>
                  <td style={{ padding: '12px 14px', color: '#dc2626' }}>Chặn</td>
                  <td style={{ padding: '12px 14px', color: '#dc2626' }}>Chặn</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f2ece3' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>Thiết lập Giá phòng &amp; Voucher (BR-101)</td>
                  <td style={{ padding: '12px 14px', color: '#786c65' }}>Chỉ xem</td>
                  <td style={{ padding: '12px 14px', color: '#15803d', fontWeight: 700 }}>Toàn quyền sửa</td>
                  <td style={{ padding: '12px 14px', color: '#786c65' }}>Xem</td>
                  <td style={{ padding: '12px 14px', color: '#dc2626' }}>Chặn</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f2ece3' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>Đặt phòng &amp; Check-in / Check-out</td>
                  <td style={{ padding: '12px 14px', color: '#15803d' }}>Có</td>
                  <td style={{ padding: '12px 14px', color: '#15803d' }}>Có</td>
                  <td style={{ padding: '12px 14px', color: '#15803d', fontWeight: 700 }}>Chính</td>
                  <td style={{ padding: '12px 14px', color: '#dc2626' }}>Chặn</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f2ece3' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>Bảng việc Buồng phòng &amp; Dọn dẹp (BR-112)</td>
                  <td style={{ padding: '12px 14px', color: '#15803d' }}>Có</td>
                  <td style={{ padding: '12px 14px', color: '#15803d' }}>Có</td>
                  <td style={{ padding: '12px 14px', color: '#786c65' }}>Xem</td>
                  <td style={{ padding: '12px 14px', color: '#15803d', fontWeight: 700 }}>Chính</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Tùy chọn */}
        {activeTab === 'OPTIONS' && (
          <div style={{ padding: '28px 32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#362118', margin: '0 0 16px' }}>
              Tùy chọn Vận hành &amp; Thông báo
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#482e24', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#482e24', width: '16px', height: '16px' }} />
                <span>Tự động gửi email xác nhận đặt phòng kèm mã QR</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#482e24', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#482e24', width: '16px', height: '16px' }} />
                <span>Thông báo chuông khi có khách đặt phòng mới hoặc yêu cầu dịch vụ</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#482e24', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#482e24', width: '16px', height: '16px' }} />
                <span>Bật cơ chế Idempotency Key chống trùng lặp thanh toán (BR-86)</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
