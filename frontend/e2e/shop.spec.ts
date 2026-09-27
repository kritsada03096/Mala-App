import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('button', { name: 'กรอกบัญชีทดลองให้ฉัน' }).click();
  await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'ภาพรวมร้าน', exact: true })).toBeVisible();
});

test('checkout, receipt, persistence, cancellation, product management and stock', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.getByRole('link', { name: 'สร้างออเดอร์ใหม่', exact: true }).click();
  await page.getByRole('combobox', { name: 'เลือกโต๊ะ', exact: true }).selectOption('3');
  await page.getByRole('button', { name: 'เพิ่ม เนื้อวัวเสียบไม้', exact: true }).click();
  await page.getByRole('button', { name: 'เพิ่มจำนวน เนื้อวัวเสียบไม้', exact: true }).click();
  await page.getByRole('button', { name: 'ยืนยันออเดอร์' }).click();
  await expect(page.getByRole('heading', { name: 'ชำระเงิน', exact: true })).toBeVisible();
  await expect(page.locator('.payment-amount')).toContainText('40');
  await page.getByRole('button', { name: 'จำลองชำระเงินสำเร็จ' }).click();
  await expect(page.locator('.receipt-paper')).toContainText('RC-0001');
  await page.reload();
  await expect(page.locator('.receipt-paper')).toContainText('RC-0001');
  await page.getByRole('link', { name: 'จัดการสต็อก', exact: true }).click();
  let row = page.getByRole('row').filter({ hasText: 'เนื้อวัวเสียบไม้' }).first();
  await expect(row.getByRole('cell').nth(1)).toHaveText('78');
  await page.getByRole('link', { name: 'สร้างออเดอร์', exact: true }).click();
  await page.getByRole('button', { name: 'กลับบ้าน', exact: true }).click();
  await page.getByRole('button', { name: 'เพิ่ม หมูสามชั้น', exact: true }).click();
  await page.getByRole('button', { name: 'ยืนยันออเดอร์' }).click();
  await page.getByRole('link', { name: 'กลับไปดูออเดอร์' }).click();
  await page.getByRole('button', { name: 'ยกเลิกออเดอร์', exact: true }).click();
  await page.getByRole('button', { name: 'ยืนยันยกเลิก' }).click();
  await expect(page.locator('.heading-actions .badge')).toHaveText('ยกเลิก');
  await page.getByRole('link', { name: 'เมนู / สินค้า', exact: true }).click();
  await page.getByRole('link', { name: 'เพิ่มเมนู', exact: true }).click();
  await page.getByLabel('ชื่อเมนู', { exact: true }).fill('เต้าหู้ทดสอบ');
  await page.getByLabel('ราคา (บาท)', { exact: true }).fill('19.99');
  await page.getByRole('button', { name: 'บันทึกเมนู' }).click();
  await expect(page.getByRole('row').filter({ hasText: 'เต้าหู้ทดสอบ' })).toBeVisible();
  await page.getByRole('link', { name: 'จัดการสต็อก', exact: true }).click();
  row = page.getByRole('row').filter({ hasText: 'เต้าหู้ทดสอบ' }).first();
  await row.getByRole('button', { name: 'ปรับสต็อก' }).click();
  await page.getByLabel('จำนวนที่ปรับ (+ / -)', { exact: true }).fill('20');
  await page.getByRole('button', { name: 'บันทึกสต็อก' }).click();
  await expect(row.getByRole('cell').nth(1)).toHaveText('20');
  await page.getByRole('button', { name: 'ออกจากระบบ' }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(errors).toEqual([]);
});

test('mobile navigation, responsive layout and cash checkout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/dashboard-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'เปิดเมนู' }).click();
  await page.getByRole('link', { name: 'สร้างออเดอร์', exact: true }).click();
  await page.getByRole('button', { name: 'กลับบ้าน', exact: true }).click();
  await page.getByRole('button', { name: 'เพิ่ม ไส้กรอกชีส', exact: true }).click();
  await page.screenshot({ path: 'test-results/order-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'ยืนยันออเดอร์' }).click();
  await page.getByRole('button', { name: 'เงินสดจำลอง' }).click();
  await page.getByRole('button', { name: 'จำลองชำระเงินสำเร็จ' }).click();
  await expect(page.locator('.receipt-paper')).toContainText('เงินสด (จำลอง)');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.sidebar')).toBeHidden();
  await expect(page.locator('.receipt-paper')).toBeVisible();
});

test('desktop dashboard and product browsing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'test-results/dashboard-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'สร้างออเดอร์ใหม่', exact: true }).click();
  await page.getByRole('button', { name: 'ผัก', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(2);
  await page.getByLabel('ค้นหาเมนู', { exact: true }).fill('บรอก');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.getByLabel('ค้นหาเมนู', { exact: true }).fill('');
  await page.getByRole('button', { name: 'ทั้งหมด', exact: true }).click();
  await page.screenshot({ path: 'test-results/order-desktop.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
