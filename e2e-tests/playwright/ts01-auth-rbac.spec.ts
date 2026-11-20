import { test, expect } from '@playwright/test';

test.describe('TS01: Xác thực & Phân quyền Truy cập (RBAC - BR08 & F01)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('TC_AUTH_01: ADMIN đăng nhập thành công và truy cập được Quản lý Người dùng (/users)', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@hotel.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Chuyển hướng thành công và có thể vào /users
    await page.goto('/users');
    await expect(page.locator('h1')).toContainText('[F01 - AUTH_01] Quản lý Người dùng');
    await expect(page.locator('text=admin@hotel.com')).toBeVisible();
  });

  test('TC_AUTH_04: Lễ tân (RECEPTIONIST) truy cập trái quyền /users bị điều hướng sang 403 Forbidden', async ({ page }) => {
    await page.fill('input[type="email"]', 'reception@hotel.com');
    await page.fill('input[type="password"]', 'reception123');
    await page.click('button[type="submit"]');

    // Cố tình truy cập trực tiếp URL chỉ dành cho ADMIN
    await page.goto('/users');

    // Kiểm tra màn hình 403 Forbidden được kích hoạt (TC_AUTH_04)
    await expect(page.locator('h2')).toContainText('Truy cập Bị từ chối');
    await expect(page.locator('code')).toContainText('/users');
  });

  test('TC_AUTH_05: Buồng phòng (HOUSEKEEPING) không thể truy cập Báo cáo Doanh thu (/reports)', async ({ page }) => {
    await page.fill('input[type="email"]', 'hk@hotel.com');
    await page.fill('input[type="password"]', 'hk123');
    await page.click('button[type="submit"]');

    await page.goto('/reports');
    await expect(page.locator('h2')).toContainText('Truy cập Bị từ chối');
  });
});
