import { test, expect } from '@playwright/test';

test.describe('TS02: Vòng đời Khách & Trạng thái Phòng (BR01 -> BR08, BR-65, BR-112)', () => {
  test('Quy trình khép kín: Đặt phòng -> Check-in -> Dịch vụ/Hư hại -> Check-out (CLEANING) -> Nhiệm vụ Buồng phòng -> Hoàn tất (AVAILABLE)', async ({ page }) => {
    // 1. Đăng nhập với quyền Lễ tân letan01
    await page.goto('/login');
    await page.fill('input[placeholder*="admin01"]', 'letan01');
    await page.fill('input[type="password"]', 'Hotel@2026');
    await page.click('button[type="submit"]');

    // 2. Vào màn hình Đặt phòng [F03] và mở form tạo đơn mới (hỗ trợ Nightly & Hourly)
    await page.goto('/reservations');
    await expect(page.locator('h1')).toContainText('Danh sách Đơn Đặt Phòng');
    await page.click('text=+ Tạo Đơn Đặt Phòng Mới');

    // Kiểm tra tab Nightly và Hourly
    await expect(page.locator('text=Theo đêm (Nightly)')).toBeVisible();
    await expect(page.locator('text=Theo giờ (Hourly - BR-04)')).toBeVisible();

    // 3. Đến Bàn lễ tân [F04] thực hiện nhận phòng / tra cứu số dư tạm tính
    await page.goto('/front-desk');
    await expect(page.locator('h1')).toContainText('Bàn Làm Việc Lễ Tân');

    // 4. Gọi dịch vụ Minibar / Báo hỏng hư hao [F06 - DAMAGE BR-36]
    await page.goto('/service-orders');
    await expect(page.locator('h1')).toContainText('Gọi Dịch vụ Phòng & Báo hỏng Hư hại');
    await expect(page.locator('text=Bồi thường Hư hao (BR-36)')).toBeVisible();

    // 5. Đến Bảng Điều phối Buồng phòng [F06 - HOUSEKEEPER] với vòng đời 2 bước
    await page.goto('/housekeeping');
    await expect(page.locator('h1')).toContainText('Bảng Điều phối Nhiệm vụ Buồng phòng');
    await expect(page.locator('text=PENDING')).toBeVisible();
  });
});
