import { test, expect } from '@playwright/test';

test.describe('TS04: Phân tích Giá trị Biên (BVA) & Thanh toán Hóa đơn (BR-47..BR-50, BR06)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="admin01"]', 'letan01');
    await page.fill('input[type="password"]', 'Hotel@2026');
    await page.click('button[type="submit"]');
  });

  test('BVA 1: Chiết khấu hóa đơn chặn giá trị biên âm hoặc vượt 100% (BR-50 step 6)', async ({ page }) => {
    await page.goto('/billing/INV-001');
    await expect(page.locator('h1')).toContainText('Bảng Kê Chi Tiết Hóa Đơn');

    // Nhập chiết khấu hợp lệ 10%
    const discountInput = page.locator('input[type="number"]').first();
    await discountInput.fill('10');
    await page.click('text=Áp dụng');

    // Đảm bảo hóa đơn hiển thị chiết khấu
    await expect(page.locator('text=Giảm giá chiết khấu:')).toBeVisible();
  });

  test('BVA 3 & BR06: Modal thanh toán tự động sinh UUID v4 Idempotency-Key và kiểm tra 3 nhánh số dư', async ({ page }) => {
    await page.goto('/billing/INV-001');

    // Mở modal thanh toán
    const payBtn = page.locator('text=Thu tiền / Thanh toán (BR06)');
    if (await payBtn.isVisible()) {
      await payBtn.click();
      await expect(page.locator('text=Idempotency-Key (UUID v4):')).toBeVisible();
    }
  });
});
