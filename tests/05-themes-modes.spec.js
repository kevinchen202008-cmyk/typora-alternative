import { test, expect } from '@playwright/test';
import { launchApp, jsClick, sendIPC } from './helpers.js';

let app, page;
test.beforeAll(async () => { ({ app, page } = await launchApp()); });
test.afterAll(async () => { await app.close(); });

async function getTheme() {
  return page.evaluate(() => document.documentElement.getAttribute('data-theme'));
}

async function getVditorMode() {
  return page.evaluate(() => window.__getEditorMode?.() ?? 'unknown');
}

test('default theme is light', async () => {
  expect(await getTheme()).toBe('light');
});

test('IPC menu-set-theme dark applies dark theme', async () => {
  await sendIPC(app, 'menu-set-theme', 'dark');
  await page.waitForTimeout(300);
  expect(await getTheme()).toBe('dark');
});

test('IPC menu-set-theme github applies github theme', async () => {
  await sendIPC(app, 'menu-set-theme', 'github');
  await page.waitForTimeout(300);
  expect(await getTheme()).toBe('github');
});

test('IPC menu-set-theme light restores light theme', async () => {
  await sendIPC(app, 'menu-set-theme', 'light');
  await page.waitForTimeout(300);
  expect(await getTheme()).toBe('light');
});

test('sb-mode click toggles editor from IR to SV', async () => {
  expect(await getVditorMode()).toBe('ir');
  await jsClick(page, '.sb-mode');
  await page.waitForTimeout(800);
  expect(await getVditorMode()).toBe('sv');
});

test('sb-mode click toggles editor back from SV to IR', async () => {
  expect(await getVditorMode()).toBe('sv');
  await jsClick(page, '.sb-mode');
  await page.waitForTimeout(800);
  expect(await getVditorMode()).toBe('ir');
});
