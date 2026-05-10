import { _electron as electron } from 'playwright';

export async function launchApp() {
  const app = await electron.launch({ args: ['.'], cwd: process.cwd() });
  const page = await app.firstWindow();
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].maximize());
  await page.waitForSelector('.vditor-ir [contenteditable="true"]', { timeout: 15000 });
  await page.waitForTimeout(1500);
  return { app, page };
}

/** Set editor content — updates Vditor + contentRef + isDirty + wordCount */
export async function setEditorContent(page, text) {
  await page.evaluate((t) => window.__setContent?.(t), text);
  await page.waitForTimeout(500);
  await page.evaluate(() =>
    document.querySelector('.vditor-ir [contenteditable="true"]')?.focus()
  );
  await page.waitForTimeout(200);
}

/** Type additional text into a focused editor (for append/edit tests) */
export async function typeInEditor(page, text) {
  await page.evaluate(() =>
    document.querySelector('.vditor-ir [contenteditable="true"]')?.focus()
  );
  await page.waitForTimeout(150);
  await page.keyboard.type(text, { delay: 30 });
  await page.waitForTimeout(500);
}

/** Click a DOM element by CSS selector via JS (bypasses z-index / viewport checks) */
export async function jsClick(page, selector) {
  await page.evaluate((sel) => document.querySelector(sel)?.click(), selector);
  await page.waitForTimeout(400);
}

/** Send IPC to renderer — simulates a menu action */
export async function sendIPC(app, channel, ...args) {
  await app.evaluate(
    ({ BrowserWindow }, payload) =>
      BrowserWindow.getAllWindows()[0].webContents.send(payload[0], ...payload.slice(1)),
    [channel, ...args],
  );
}
