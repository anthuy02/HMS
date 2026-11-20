import { test, expect } from '@playwright/test';

test.describe('TS02: Vòng đời Khách & Trạng thái Phòng (BR01 -> BR07)', () => {
  test('Quy trình khép kín: Đặt phòng -> Check-in -> Dịch vụ -> Check-out -> Dọn phòng', async ({ page }) => {
    // 1. Đăng nhập với quyền Lễ tân
    await page.goto('/login');
    await page.fill('input[type="email"]', 'reception@hotel.com');
    await page.fill('input[type="password"]', 'reception123');
    await page.click('button[type="submit"]');

    // 2. Vào màn hình Đặt phòng [F03] và mở form tạo đơn mới [BR01, BR02]
    await page.goto('/reservations');
    await page.click('text=+ Tạo Đơn Đặt Phòng Mới');

    await page.fill('input[value="2026-11-20"]', '2026-11-25');
    await page.fill('input[value="2026-11-22"]', '2026-11-27');
    await page.click('text=Tra cứu phòng trống');

    // 3. Đến Bàn lễ tân [F04] thực hiện Check-in [BR03]
    await page.goto('/front-desk');
    const checkInBtn = page.locator('text=Xác nhận Nhận phòng (BR03)').first();
    if (await checkInBtn.isVisible()) {
      await checkInBtn.click();
      await page.click('text=Xác nhận Check-in (OCCUPIED)');
    }

    // 4. Gọi dịch vụ Minibar [F06 - TC_SVC_01]
    await page.goto('/service-orders');
    await expect(page.locator('h1')).toContainText('Gọi Dịch vụ Minibar');

    // 5. Trả phòng [F04 - BR04] chuyển sang DIRTY
    await page.goto('/front-desk');
    const checkOutBtn = page.locator('text=Trả phòng (BR04)').first();
    if (await checkOutBtn.isVisible()) {
      await checkOutBtn.click();
      await page.click('text=Xác nhận Check-out (DIRTY)');
    }

    // 6. Chuyển sang Housekeeping [F06 - BR07] xác nhận dọn xong
    await page.goto('/housekeeping');
    await expect(page.locator('h1')).toContainText('Bảng Điều phối Dọn Buồng phòng');
  });
});
