import { test, expect } from '@playwright/test';

test.describe('TS01: Xác thực & Phân quyền Truy cập (RBAC - BR-70 -> BR-75 & F01)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('TC_AUTH_01: ADMIN (admin01) đăng nhập thành công và truy cập được Quản trị hệ thống & Người dùng (/users, /system-settings)', async ({ page }) => {
    await page.fill('input[placeholder*="admin01"]', 'admin01');
    await page.fill('input[type="password"]', 'Hotel@2026');
    await page.click('button[type="submit"]');

    // Chuyển hướng thành công và có thể vào /users
    await page.goto('/users');
    await expect(page.locator('h1')).toContainText('Quản lý nhân viên');
    await expect(page.locator('text=admin01')).toBeVisible();

    // ADMIN có thể vào /system-settings
    await page.goto('/system-settings');
    await expect(page.locator('h1')).toContainText('Cài đặt hệ thống');
  });

  test('TC_AUTH_04: Lễ tân (letan01 - RECEPTIONIST) truy cập trái quyền /users bị điều hướng sang 403 Forbidden', async ({ page }) => {
    await page.fill('input[placeholder*="admin01"]', 'letan01');
    await page.fill('input[type="password"]', 'Hotel@2026');
    await page.click('button[type="submit"]');

    // Cố tình truy cập trực tiếp URL chỉ dành cho ADMIN
    await page.goto('/users');

    // Kiểm tra màn hình 403 Forbidden được kích hoạt (TC_AUTH_04)
    await expect(page.locator('h2')).toContainText('Truy cập Bị từ chối');
    await expect(page.locator('code')).toContainText('/users');
  });

  test('TC_AUTH_05: Buồng phòng (donphong01 - HOUSEKEEPER) không thể truy cập Báo cáo Doanh thu (/reports)', async ({ page }) => {
    await page.fill('input[placeholder*="admin01"]', 'donphong01');
    await page.fill('input[type="password"]', 'Hotel@2026');
    await page.click('button[type="submit"]');

    await page.goto('/reports');
    await expect(page.locator('h2')).toContainText('Truy cập Bị từ chối');
  });
});
