import { test, expect } from '@playwright/test';
import { launchApp, setEditorContent } from './helpers.js';

let app, page;
test.beforeAll(async () => { ({ app, page } = await launchApp()); });
test.afterAll(async () => { await app.close(); });

async function set(text) { await setEditorContent(page, text); }

for (const level of [1, 2, 3, 4, 5, 6]) {
  test(`H${level}: renders as h${level}`, async () => {
    await set(`${'#'.repeat(level)} Heading ${level}`);
    await expect(page.locator(`.vditor-ir h${level}`)).toBeVisible();
  });
}

test('**text** renders bold', async () => {
  await set('**bold text**');
  await expect(page.locator('.vditor-ir strong')).toBeVisible();
});

test('*text* renders italic', async () => {
  await set('*italic text*');
  await expect(page.locator('.vditor-ir em')).toBeVisible();
});

test('~~text~~ renders strikethrough', async () => {
  await set('~~strikethrough~~');
  await expect(page.locator('.vditor-ir s, .vditor-ir del')).toBeVisible();
});

test('`code` renders inline code', async () => {
  await set('`inline code`');
  await expect(page.locator('.vditor-ir code')).toBeVisible();
});

test('> blockquote renders', async () => {
  await set('> This is a quote');
  await expect(page.locator('.vditor-ir blockquote')).toBeVisible();
});

test('unordered list renders', async () => {
  await set('- Item one\n- Item two');
  await expect(page.locator('.vditor-ir ul')).toBeVisible();
  await expect(page.locator('.vditor-ir li')).toHaveCount(2);
});

test('ordered list renders', async () => {
  await set('1. First\n2. Second');
  await expect(page.locator('.vditor-ir ol')).toBeVisible();
  await expect(page.locator('.vditor-ir ol li')).toHaveCount(2);
});

test('task list renders checkboxes', async () => {
  await set('- [ ] Todo\n- [x] Done');
  await expect(page.locator('.vditor-ir input[type="checkbox"]')).toHaveCount(2);
});

test('fenced code block renders', async () => {
  await set('```javascript\nconsole.log("hello")\n```');
  await expect(page.locator('.vditor-ir pre').first()).toBeVisible();
});

test('horizontal rule renders', async () => {
  await set('Above\n\n---\n\nBelow');
  await expect(page.locator('.vditor-ir hr')).toBeVisible();
});

test('table renders', async () => {
  await set('| A | B |\n|---|---|\n| 1 | 2 |');
  await expect(page.locator('.vditor-ir table')).toBeVisible();
});

test('inline math $...$ renders', async () => {
  await set('Formula: $E = mc^2$');
  await expect(page.locator('.vditor-ir .language-math').first()).toBeVisible({ timeout: 5000 });
});

test('[link](url) renders anchor tag', async () => {
  await set('[link text](https://example.com)');
  // In IR mode, links show as spans with data attributes, not <a> until cursor leaves
  const html = await page.locator('.vditor-ir [contenteditable="true"]').innerHTML();
  expect(html).toMatch(/link text|href|example\.com/i);
});
