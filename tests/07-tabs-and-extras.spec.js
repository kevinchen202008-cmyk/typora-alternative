import { test, expect } from '@playwright/test';
import { launchApp, sendIPC, jsClick } from './helpers.js';

let app, page;
test.beforeAll(async () => { ({ app, page } = await launchApp()); });
test.afterAll(async ()  => { await app.close(); });

// ── Tab bar visibility ─────────────────────────────────────────────────────────
test('tab bar is visible on launch', async () => {
  await expect(page.locator('.tab-bar')).toBeVisible();
});

test('one tab exists on launch', async () => {
  const count = await page.locator('.tab-item').count();
  expect(count).toBe(1);
});

test('first tab is active', async () => {
  await expect(page.locator('.tab-item.active')).toBeVisible();
});

// ── New tab ────────────────────────────────────────────────────────────────────
test('Ctrl+T opens a new tab', async () => {
  await page.keyboard.press('Control+t');
  await page.waitForTimeout(400);
  const count = await page.locator('.tab-item').count();
  expect(count).toBe(2);
});

test('new tab button (+) opens a new tab', async () => {
  await jsClick(page, '.tab-new');
  const count = await page.locator('.tab-item').count();
  expect(count).toBeGreaterThanOrEqual(3);
});

// ── Tab switching ──────────────────────────────────────────────────────────────
test('clicking a tab makes it active', async () => {
  // Click first tab
  await page.locator('.tab-item').first().click();
  await page.waitForTimeout(300);
  const activeText = await page.locator('.tab-item.active').textContent();
  expect(activeText).toBeTruthy();
});

test('Ctrl+Tab cycles to next tab', async () => {
  // Ensure at least 2 tabs
  while ((await page.locator('.tab-item').count()) < 2) {
    await page.keyboard.press('Control+t');
    await page.waitForTimeout(300);
  }
  // Go to first tab
  await page.locator('.tab-item').first().click();
  await page.waitForTimeout(200);
  const beforeIdx = await page.evaluate(() => {
    const items = [...document.querySelectorAll('.tab-item')];
    return items.findIndex(el => el.classList.contains('active'));
  });

  await page.keyboard.press('Control+Tab');
  await page.waitForTimeout(400);
  const afterIdx = await page.evaluate(() => {
    const items = [...document.querySelectorAll('.tab-item')];
    return items.findIndex(el => el.classList.contains('active'));
  });
  expect(afterIdx).not.toBe(beforeIdx);
});

// ── Close tab ─────────────────────────────────────────────────────────────────
test('close button removes a tab', async () => {
  // Ensure at least 2 tabs before closing
  while ((await page.locator('.tab-item').count()) < 2) {
    await page.keyboard.press('Control+t');
    await page.waitForTimeout(300);
  }
  const before = await page.locator('.tab-item').count();
  // Click the close button on the last tab (use JS to avoid confirm dialog)
  await page.evaluate(() => {
    const items = document.querySelectorAll('.tab-item');
    const last  = items[items.length - 1];
    last?.querySelector('.tab-close')?.click();
  });
  await page.waitForTimeout(400);
  const after = await page.locator('.tab-item').count();
  // Tab count decreases by 1, but never goes below 1
  expect(after).toBeLessThan(before);
  expect(after).toBeGreaterThanOrEqual(1);
});

test('Ctrl+W closes the active tab', async () => {
  // Open a fresh tab first
  await page.keyboard.press('Control+t');
  await page.waitForTimeout(300);
  const before = await page.locator('.tab-item').count();

  await page.keyboard.press('Control+w');
  await page.waitForTimeout(400);
  const after = await page.locator('.tab-item').count();
  expect(after).toBeLessThan(before);
});

// ── Last tab guard ─────────────────────────────────────────────────────────────
test('closing the last tab resets to empty rather than disappearing', async () => {
  // Close tabs until only 1 remains
  let count = await page.locator('.tab-item').count();
  while (count > 1) {
    await page.evaluate(() => {
      const items = document.querySelectorAll('.tab-item');
      items[items.length - 1]?.querySelector('.tab-close')?.click();
    });
    await page.waitForTimeout(300);
    count = await page.locator('.tab-item').count();
  }
  // Try to close the last one (no confirm for blank tab)
  await page.keyboard.press('Control+w');
  await page.waitForTimeout(400);
  expect(await page.locator('.tab-item').count()).toBe(1);
});

// ── IPC: menu-new-tab ──────────────────────────────────────────────────────────
test('menu-new-tab IPC opens a new tab', async () => {
  const before = await page.locator('.tab-item').count();
  await sendIPC(app, 'menu-new-tab');
  await page.waitForTimeout(400);
  const after = await page.locator('.tab-item').count();
  expect(after).toBe(before + 1);
});

// ── Find bar ───────────────────────────────────────────────────────────────────
test('Ctrl+F opens the find bar', async () => {
  await page.keyboard.press('Control+f');
  await page.waitForTimeout(300);
  await expect(page.locator('.find-bar')).toBeVisible();
});

test('Escape closes the find bar', async () => {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await expect(page.locator('.find-bar')).not.toBeVisible();
});

test('Ctrl+H opens find bar in replace mode', async () => {
  await page.keyboard.press('Control+h');
  await page.waitForTimeout(300);
  await expect(page.locator('.find-bar')).toBeVisible();
  // Replace input should be present
  const inputs = await page.locator('.find-bar input').count();
  expect(inputs).toBeGreaterThanOrEqual(2);
  await page.keyboard.press('Escape');
});

// ── Focus mode ─────────────────────────────────────────────────────────────────
test('status bar Focus button toggles focus-mode class on app', async () => {
  const hadFocus = await page.locator('.app').evaluate(el => el.classList.contains('focus-mode'));
  await jsClick(page, '.sb-focus');
  await page.waitForTimeout(200);
  const hasFocus = await page.locator('.app').evaluate(el => el.classList.contains('focus-mode'));
  expect(hasFocus).toBe(!hadFocus);
  // Toggle back
  await jsClick(page, '.sb-focus');
  await page.waitForTimeout(200);
});

// ── Update banner ──────────────────────────────────────────────────────────────
test('update-available IPC shows banner', async () => {
  await sendIPC(app, 'update-available', { version: '99.0.0', url: 'https://example.com' });
  await page.waitForTimeout(400);
  await expect(page.locator('.update-banner')).toBeVisible();
  const text = await page.locator('.update-banner').textContent();
  expect(text).toContain('99.0.0');
});

test('dismissing update banner hides it', async () => {
  await jsClick(page, '.update-banner button');
  await page.waitForTimeout(300);
  await expect(page.locator('.update-banner')).not.toBeVisible();
});
