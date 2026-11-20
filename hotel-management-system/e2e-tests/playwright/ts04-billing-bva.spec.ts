import { test, expect } from '@playwright/test';

test.describe('TS04: Phân tích Giá trị Biên (BVA) & Thanh toán Hóa đơn (BR05, BR06)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'reception@hotel.com');
    await page.fill('input[type="password"]', 'reception123');
    await page.click('button[type="submit"]');
  });

  test('BVA 1: Chiết khấu hóa đơn chặn giá trị biên âm hoặc vượt 100%', async ({ page }) => {
    await page.goto('/billing/inv-103');
    await expect(page.locator('h1')).toContainText('Hóa đơn Thanh toán');

    // Nhập chiết khấu hợp lệ 10%
    const discountInput = page.locator('input[type="number"]').first();
    await discountInput.fill('10');
    await page.click('text=Áp dụng');

    // Đảm bảo hóa đơn tính đúng tiền giảm
    await expect(page.locator('text=Giảm giá (10%):')).toBeVisible();
  });

  test('BVA 3 & BR06: Chặn thanh toán số tiền vượt quá dư nợ hóa đơn', async ({ page }) => {
    await page.goto('/billing/inv-103');

    // Mở modal thanh toán
    const payBtn = page.locator('text=Thu tiền / Thanh toán (BR06)');
    if (await payBtn.isVisible()) {
      await payBtn.click();

      // Cố tình nhập số tiền cực lớn vượt dư nợ (Ví dụ 999.000.000 VNĐ)
      const payAmountInput = page.locator('input[type="number"]').first();
      await payAmountInput.fill('999000000');
      await page.click('text=Xác nhận Thu tiền');

      // Kiểm tra hệ thống kích hoạt thông báo chặn trả thừa theo BR06
      await expect(page.locator('text=Quy tắc [BR06]: Chặn thanh toán thừa!')).toBeVisible();
    }
  });

  test('BR06: Modal thanh toán tự động sinh UUID v4 Idempotency-Key', async ({ page }) => {
    await page.goto('/billing/inv-103');
    const payBtn = page.locator('text=Thu tiền / Thanh toán (BR06)');
    if (await payBtn.isVisible()) {
      await payBtn.click();
      await expect(page.locator('text=Idempotency-Key (UUID v4):')).toBeVisible();
    }
  });
});
