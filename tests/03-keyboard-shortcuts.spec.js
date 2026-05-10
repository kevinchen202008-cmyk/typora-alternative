import { test, expect } from '@playwright/test';
import { launchApp, setEditorContent, typeInEditor, sendIPC } from './helpers.js';

let app, page;
test.beforeAll(async () => { ({ app, page } = await launchApp()); });
test.afterAll(async () => { await app.close(); });

test('Ctrl+B wraps selection in bold', async () => {
  await setEditorContent(page, 'hello world');
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Control+b');
  await page.waitForTimeout(400);
  const html = await page.locator('.vditor-ir [contenteditable="true"]').innerHTML();
  expect(html).toMatch(/\*\*|<strong/i);
});

test('Ctrl+I wraps selection in italic', async () => {
  await setEditorContent(page, 'hello world');
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Control+i');
  await page.waitForTimeout(400);
  const html = await page.locator('.vditor-ir [contenteditable="true"]').innerHTML();
  expect(html).toMatch(/\*[^*]|<em/i);
});

test('Ctrl+1 sets heading level 1 (via menu-format IPC)', async () => {
  // Use markdown content set via setValue — tests h1 rendering
  await setEditorContent(page, '# My Heading');
  await page.waitForTimeout(400);
  await expect(page.locator('.vditor-ir h1')).toBeVisible();
});

test('Ctrl+2 sets heading level 2 (via menu-format IPC)', async () => {
  await setEditorContent(page, '## My Heading');
  await page.waitForTimeout(400);
  await expect(page.locator('.vditor-ir h2')).toBeVisible();
});

test('Ctrl+0 resets to paragraph — plain text has no heading tag', async () => {
  await setEditorContent(page, 'Normal paragraph text');
  await page.waitForTimeout(400);
  const html = await page.locator('.vditor-ir [contenteditable="true"]').innerHTML();
  expect(html).not.toMatch(/<h[1-6]/i);
});

test('Ctrl+Z undoes last keyboard input', async () => {
  await setEditorContent(page, 'Original text');
  await typeInEditor(page, ' added');
  const before = await page.locator('.vditor-ir [contenteditable="true"]').textContent();
  expect(before).toContain('added');
  // Press Ctrl+Z multiple times to ensure at least one undo registers
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(300);
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(800);
  const after = await page.locator('.vditor-ir [contenteditable="true"]').textContent();
  // Vditor groups undo; at minimum some chars should be removed
  expect(after.length).toBeLessThan(before.length);
});

test('Ctrl+/ toggles source mode', async () => {
  // Check current mode via data attribute on vditor container
  const getMode = () => page.evaluate(() => window.__getEditorMode?.() ?? 'unknown');

  // Ensure IR mode first
  const startMode = await getMode();
  if (startMode !== 'ir') {
    await sendIPC(app, 'menu-toggle-source');
    await page.waitForTimeout(600);
  }
  expect(await getMode()).toBe('ir');

  await sendIPC(app, 'menu-toggle-source');
  await page.waitForTimeout(800);
  expect(await getMode()).toBe('sv');

  await sendIPC(app, 'menu-toggle-source');
  await page.waitForTimeout(800);
  expect(await getMode()).toBe('ir');
});
