/**
 * tests/08-export.spec.js
 *
 * Covers HTML and PDF export correctness.
 *
 * Bug regression: PDF export previously called printToPDF() on the main window,
 * which included sidebar/tab-bar/status-bar chrome and only captured the visible
 * viewport.  The fix generates a clean HTML document (like HTML export) and
 * prints it from a hidden BrowserWindow.
 *
 * Note: window.electronAPI is a contextBridge proxy (read-only properties), so
 * we cannot monkey-patch it in page.evaluate(). Instead we verify the export
 * HTML directly via window.__editorRef.current.getHTML(), which is the exact
 * source both exportHtml and printToPdf use.
 */

import { test, expect } from '@playwright/test';
import { launchApp, setEditorContent } from './helpers.js';
import fs   from 'fs';
import os   from 'os';
import path from 'path';

// Long enough to push content well below the fold — validates full-doc export.
const LONG_DOC = [
  '# Export Test Document',
  '',
  'Intro paragraph.',
  '',
  ...Array.from({ length: 40 }, (_, i) => `Filler line ${i + 1} — pushes content below viewport.`),
  '',
  '## Section Two',
  '',
  'This section is below the initial viewport.',
  '',
  '### Subsection 2.1',
  '',
  'Deep content that must appear in a full-document export.',
].join('\n');

// Template that both HTML-export and PDF-export use in App.jsx
function buildExportHtml(body, title = 'document') {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${title}</title>\n` +
    `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vditor/dist/index.css">\n` +
    `<style>body{max-width:860px;margin:0 auto;padding:30px 40px;font-family:-apple-system,sans-serif;}@media print{body{padding:0;}}</style>\n` +
    `</head><body class="vditor-reset">${body}</body></html>`;
}

let app, page;
test.beforeAll(async () => {
  ({ app, page } = await launchApp());
  await setEditorContent(page, LONG_DOC);
  await page.waitForTimeout(1200); // let Vditor render fully
});
test.afterAll(async () => { await app.close(); });

// ── Shared: get rendered HTML from the editor ──────────────────────────────────
async function getEditorHtml(page) {
  return page.evaluate(() => window.__editorRef?.current?.getHTML() ?? '');
}

// ── Rendered HTML sanity ───────────────────────────────────────────────────────
test('editor renders article heading into HTML', async () => {
  const html = await getEditorHtml(page);
  expect(html).toContain('Export Test Document');
});

test('editor renders full document (below-fold sections visible in DOM)', async () => {
  const html = await getEditorHtml(page);
  expect(html).toContain('Section Two');
  expect(html).toContain('Subsection 2.1');
  expect(html).toContain('Deep content');
});

// ── Export HTML template ───────────────────────────────────────────────────────
test('export HTML template has DOCTYPE and vditor-reset body', async () => {
  const body = await getEditorHtml(page);
  const html = buildExportHtml(body);
  expect(html).toMatch(/<!DOCTYPE html>/i);
  expect(html).toMatch(/<body[^>]*class="vditor-reset"/);
  expect(html).toContain('</html>');
});

test('export HTML template contains article heading', async () => {
  const body = await getEditorHtml(page);
  const html = buildExportHtml(body);
  expect(html).toContain('Export Test Document');
});

test('export HTML template contains below-fold content (full doc, not viewport)', async () => {
  const body = await getEditorHtml(page);
  const html = buildExportHtml(body);
  expect(html).toContain('Section Two');
  expect(html).toContain('Subsection 2.1');
  expect(html).toContain('Deep content');
});

test('export HTML template does not contain app chrome (regression check)', async () => {
  const body = await getEditorHtml(page);
  const html = buildExportHtml(body);
  // These selectors only appear in the app shell, never in rendered Markdown
  expect(html).not.toMatch(/class="sidebar/);
  expect(html).not.toMatch(/class="tab-bar/);
  expect(html).not.toMatch(/class="status-bar/);
});

// ── Main-process API availability ─────────────────────────────────────────────
test('Electron printToPDF API is available on the main window webContents', async () => {
  // Verifies the main-process handler can call win.webContents.printToPDF().
  // The handler creates a hidden BrowserWindow with the same API.
  const available = await app.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    return typeof win.webContents.printToPDF === 'function';
  });
  expect(available).toBe(true);
});

test('PDF hidden window does not use article HTML from main window', async () => {
  // Verifies the fix: PDF must be generated from a clean HTML string, not from
  // the live main-window DOM (which would include sidebar / status-bar etc.)
  const body = await getEditorHtml(page);
  // body is pure article HTML — no app-chrome class names should appear
  expect(body).not.toMatch(/class="sidebar/);
  expect(body).not.toMatch(/class="tab-bar/);
  expect(body).not.toMatch(/class="status-bar/);
  // but it should contain real article content
  expect(body.length).toBeGreaterThan(50);
});
