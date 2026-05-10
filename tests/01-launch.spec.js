import { test, expect } from '@playwright/test';
import { launchApp } from './helpers.js';

let app, page;
test.beforeAll(async () => { ({ app, page } = await launchApp()); });
test.afterAll(async () => { await app.close(); });

test('window title contains Typora', async () => {
  const title = await app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].getTitle()
  );
  expect(title).toContain('Typora');
});

test('welcome content is displayed', async () => {
  await expect(page.locator('.vditor-ir')).toBeVisible();
  const html = await page.locator('.vditor-ir [contenteditable="true"]').innerHTML();
  expect(html.length).toBeGreaterThan(100);
});

test('sidebar is visible by default', async () => {
  await expect(page.locator('.sidebar')).toBeVisible();
});

test('status bar is visible', async () => {
  await expect(page.locator('.status-bar')).toBeVisible();
});

test('status bar shows word count', async () => {
  const text = await page.locator('.status-bar').textContent();
  expect(text).toMatch(/\d+\s*words/);
});
