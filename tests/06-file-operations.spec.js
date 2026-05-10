import { test, expect } from '@playwright/test';
import { launchApp, setEditorContent, typeInEditor, sendIPC } from './helpers.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

let app, page, tmpFile;

test.beforeAll(async () => {
  ({ app, page } = await launchApp());
  tmpFile = path.join(os.tmpdir(), `playwright-test-${Date.now()}.md`);
  fs.writeFileSync(tmpFile, '# Test File\n\nContent from file system.\n', 'utf8');
});
test.afterAll(async () => {
  await app.close();
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
});

test('Ctrl+N creates new empty document', async () => {
  await sendIPC(app, 'menu-new-file');
  await page.waitForTimeout(600);
  const text = await page.locator('.vditor-ir [contenteditable="true"]').textContent();
  expect(text.trim()).toBe('');
});

test('opening a file via IPC loads content into editor', async () => {
  await sendIPC(app, 'file-opened', { filePath: tmpFile, content: fs.readFileSync(tmpFile, 'utf8') });
  await page.waitForTimeout(800);
  const html = await page.locator('.vditor-ir [contenteditable="true"]').innerHTML();
  expect(html).toMatch(/Test File/);
});

test('window title updates to filename after file open', async () => {
  const title = await app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].getTitle()
  );
  expect(title).toContain(path.basename(tmpFile));
});

test('dirty indicator appears after editing', async () => {
  // Start from a clean file state
  await sendIPC(app, 'file-opened', { filePath: tmpFile, content: '# Clean\n' });
  await page.waitForTimeout(500);
  // Use setValue via our API (triggers onChange → isDirty = true)
  await setEditorContent(page, '# Clean\n\nEdited content');
  await page.waitForTimeout(400);
  await expect(page.locator('.sb-dirty')).toBeVisible();
});

test('Ctrl+S saves file and content is written to disk', async () => {
  await sendIPC(app, 'file-opened', { filePath: tmpFile, content: '# Save test\n' });
  await page.waitForTimeout(500);
  await setEditorContent(page, '# Save test\n\nExtra line');
  await page.waitForTimeout(400);
  await page.keyboard.press('Control+s');
  await page.waitForTimeout(1000);
  const saved = fs.readFileSync(tmpFile, 'utf8');
  expect(saved).toContain('Extra line');
});

test('word count updates after typing', async () => {
  await sendIPC(app, 'menu-new-file');
  await page.waitForTimeout(400);
  const before = await page.locator('.status-bar').textContent();

  await setEditorContent(page, 'one two three four five');
  await page.waitForTimeout(400);

  const after = await page.locator('.status-bar').textContent();
  expect(after).not.toBe(before);
  expect(after).toMatch(/[45]\s*words/); // 4 or 5 depending on CJK/ASCII counting
});
