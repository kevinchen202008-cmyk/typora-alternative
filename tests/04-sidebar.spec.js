import { test, expect } from '@playwright/test';
import { launchApp, setEditorContent, sendIPC } from './helpers.js';

let app, page;
test.beforeAll(async () => { ({ app, page } = await launchApp()); });
test.afterAll(async () => { await app.close(); });

test('sidebar shows Files and Outline tabs', async () => {
  await expect(page.locator('.stab', { hasText: 'Files' })).toBeVisible();
  await expect(page.locator('.stab', { hasText: 'Outline' })).toBeVisible();
});

test('outline tab reflects headings from editor content', async () => {
  // Set content via __setContent so contentRef is updated
  await setEditorContent(page, '# Title\n\n## Section A\n\n### Sub\n\n## Section B');
  await page.waitForTimeout(1200); // outline debounce 800ms

  await page.evaluate(() =>
    [...document.querySelectorAll('.stab')].find(b => b.textContent === 'Outline')?.click()
  );
  await page.waitForTimeout(300);

  const items = page.locator('.outline-item');
  const count = await items.count();
  expect(count).toBeGreaterThanOrEqual(4);

  const texts = await items.allTextContents();
  expect(texts.some(t => t.includes('Title'))).toBe(true);
  expect(texts.some(t => t.includes('Section A'))).toBe(true);
  expect(texts.some(t => t.includes('Sub'))).toBe(true);
  expect(texts.some(t => t.includes('Section B'))).toBe(true);
});

test('outline items use paddingLeft for indentation hierarchy', async () => {
  const items = await page.locator('.outline-item').all();
  expect(items.length).toBeGreaterThanOrEqual(4);
  // H1 should have less padding than H2; H2 less than H3
  const pl = async (el) => {
    const style = await el.getAttribute('style');
    return parseInt(style?.match(/padding-left:\s*(\d+)/)?.[1] ?? '0');
  };
  const paddings = await Promise.all(items.slice(0, 3).map(pl));
  expect(paddings[0]).toBeLessThan(paddings[1]); // H1 < H2
  expect(paddings[1]).toBeLessThan(paddings[2]); // H2 < H3
});

test('menu toggle sidebar hides and shows sidebar', async () => {
  await expect(page.locator('.sidebar')).toBeVisible();
  await sendIPC(app, 'menu-toggle-sidebar');
  await page.waitForTimeout(400);
  await expect(page.locator('.sidebar')).not.toBeVisible();
  await sendIPC(app, 'menu-toggle-sidebar');
  await page.waitForTimeout(400);
  await expect(page.locator('.sidebar')).toBeVisible();
});

test('Files tab shows empty state or file tree', async () => {
  await page.evaluate(() =>
    [...document.querySelectorAll('.stab')].find(b => b.textContent === 'Files')?.click()
  );
  await page.waitForTimeout(200);
  const emptyState = await page.locator('.sidebar-empty').isVisible().catch(() => false);
  const fileTree   = await page.locator('.file-tree').isVisible().catch(() => false);
  expect(emptyState || fileTree).toBe(true);
});
