const { app, BrowserWindow, Menu, dialog, ipcMain, shell, net } = require('electron');
const path = require('path');
const fs   = require('fs');
const { spawn } = require('child_process');

const isDev      = !app.isPackaged;
const configPath = path.join(app.getPath('userData'), 'config.json');

// ── Menu i18n ──────────────────────────────────────────────────────────────────
const MENU_I18N = {
  en: {
    file: 'File', new: 'New', newTab: 'New Tab', closeTab: 'Close Tab',
    open: 'Open...', openFolder: 'Open Folder...', openRecent: 'Open Recent',
    noRecentFiles: 'No recent files', save: 'Save', saveAs: 'Save As...',
    export: 'Export', exportHtml: 'HTML...', exportPdf: 'PDF...', exportDocx: 'Word (.docx)...',
    settings: 'Settings...', exit: 'Exit',
    edit: 'Edit', find: 'Find', replace: 'Replace',
    paragraph: 'Paragraph',
    h1: 'Heading 1', h2: 'Heading 2', h3: 'Heading 3',
    h4: 'Heading 4', h5: 'Heading 5', h6: 'Heading 6',
    normal: 'Normal', quote: 'Quote', codeBlock: 'Code Block',
    orderedList: 'Ordered List', unorderedList: 'Unordered List',
    taskList: 'Task List', hr: 'Horizontal Rule', table: 'Table', mathBlock: 'Math Block',
    format: 'Format', bold: 'Bold', italic: 'Italic',
    strikethrough: 'Strikethrough', inlineCode: 'Inline Code',
    inlineMath: 'Inline Math', link: 'Link',
    view: 'View', sourceMode: 'Source Mode', toggleSidebar: 'Toggle Sidebar',
    showOutline: 'Show Outline', focusMode: 'Focus Mode', typewriterMode: 'Typewriter Mode',
    theme: 'Theme', themeLight: 'Default (Light)', themeDark: 'Dark', themeGitHub: 'GitHub',
    devTools: 'Developer Tools',
    help: 'Help', about: 'About',
    aboutTitle: 'About', aboutMessage: 'Typora-like Markdown Editor',
    aboutDetail: 'Built with Electron + Vditor\nVersion 1.0.0',
    language: 'Language', langEnglish: 'English', langChinese: 'Chinese (中文)',
    cannotOpenFile: 'Cannot open file',
  },
  zh: {
    file: '文件', new: '新建', newTab: '新建标签', closeTab: '关闭标签',
    open: '打开...', openFolder: '打开文件夹...', openRecent: '最近打开',
    noRecentFiles: '无最近文件', save: '保存', saveAs: '另存为...',
    export: '导出', exportHtml: 'HTML...', exportPdf: 'PDF...', exportDocx: 'Word (.docx)...',
    settings: '设置...', exit: '退出',
    edit: '编辑', find: '查找', replace: '替换',
    paragraph: '段落',
    h1: '一级标题', h2: '二级标题', h3: '三级标题',
    h4: '四级标题', h5: '五级标题', h6: '六级标题',
    normal: '正文', quote: '引用', codeBlock: '代码块',
    orderedList: '有序列表', unorderedList: '无序列表',
    taskList: '任务列表', hr: '分割线', table: '表格', mathBlock: '数学公式块',
    format: '格式', bold: '粗体', italic: '斜体',
    strikethrough: '删除线', inlineCode: '行内代码',
    inlineMath: '行内公式', link: '链接',
    view: '视图', sourceMode: '源码模式', toggleSidebar: '切换侧栏',
    showOutline: '显示大纲', focusMode: '专注模式', typewriterMode: '打字机模式',
    theme: '主题', themeLight: '默认（浅色）', themeDark: '深色', themeGitHub: 'GitHub',
    devTools: '开发者工具',
    help: '帮助', about: '关于',
    aboutTitle: '关于', aboutMessage: 'Typora 风格 Markdown 编辑器',
    aboutDetail: '基于 Electron + Vditor 构建\n版本 1.0.0',
    language: '语言', langEnglish: 'English', langChinese: '中文',
    cannotOpenFile: '无法打开文件',
  },
};

function m(key) {
  const lang = config?.language || 'en';
  return (MENU_I18N[lang] || MENU_I18N.en)[key] ?? MENU_I18N.en[key] ?? key;
}

// ── Config helpers ─────────────────────────────────────────────────────────────
function readConfig() {
  try { return JSON.parse(fs.readFileSync(configPath, 'utf8')); }
  catch { return { recentFiles: [], theme: 'light', sidebarOpen: true }; }
}
function writeConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf8');
}

let win;
let config      = readConfig();
let pendingFile = null;

// ── Window creation ────────────────────────────────────────────────────────────
function createWindow() {
  const b = config.windowBounds || {};

  win = new BrowserWindow({
    width:           b.width  || 1200,
    height:          b.height || 800,
    x:               b.x,
    y:               b.y,
    minWidth:        720,
    minHeight:       500,
    show:            false,
    backgroundColor: config.theme === 'dark' ? '#1e1e1e' : '#ffffff',
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      webSecurity:      false,
    },
  });

  isDev
    ? win.loadURL('http://localhost:5173')
    : win.loadFile(path.join(__dirname, '../dist/index.html'));

  win.once('ready-to-show', () => win.show());

  win.on('close', () => {
    config.windowBounds = win.getBounds();
    writeConfig(config);
  });

  buildMenu();
}

// ── Application menu ───────────────────────────────────────────────────────────
function buildMenu() {
  const recent = (config.recentFiles || []).slice(0, 10);

  const template = [
    {
      label: m('file'),
      submenu: [
        { label: m('new'),         accelerator: 'CmdOrCtrl+N',        click: () => send('menu-new-file') },
        { label: m('newTab'),      accelerator: 'CmdOrCtrl+T',        click: () => send('menu-new-tab') },
        { label: m('closeTab'),    accelerator: 'CmdOrCtrl+W',        click: () => send('menu-close-tab') },
        { type: 'separator' },
        { label: m('open'),        accelerator: 'CmdOrCtrl+O',        click: cmdOpen },
        { label: m('openFolder'),  accelerator: 'CmdOrCtrl+Shift+O',  click: cmdOpenFolder },
        {
          label: m('openRecent'),
          submenu: recent.length
            ? recent.map(f => ({ label: path.basename(f), click: () => openFile(f) }))
            : [{ label: m('noRecentFiles'), enabled: false }],
        },
        { type: 'separator' },
        { label: m('save'),        accelerator: 'CmdOrCtrl+S',        click: () => send('menu-save') },
        { label: m('saveAs'),      accelerator: 'CmdOrCtrl+Shift+S',  click: () => send('menu-save-as') },
        { type: 'separator' },
        {
          label: m('export'),
          submenu: [
            { label: m('exportHtml'),  click: () => send('menu-export', 'html') },
            { label: m('exportPdf'),   click: () => send('menu-export', 'pdf')  },
            { label: m('exportDocx'),  click: () => send('menu-export', 'docx') },
          ],
        },
        { type: 'separator' },
        { label: m('settings'), accelerator: 'CmdOrCtrl+,', click: () => send('menu-settings') },
        { type: 'separator' },
        { role: 'quit', label: m('exit') },
      ],
    },
    {
      label: m('edit'),
      submenu: [
        { role: 'undo' }, { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
        { type: 'separator' },
        { label: m('find'),    accelerator: 'CmdOrCtrl+F', click: () => send('menu-find') },
        { label: m('replace'), accelerator: 'CmdOrCtrl+H', click: () => send('menu-find', true) },
      ],
    },
    {
      label: m('paragraph'),
      submenu: [
        { label: m('h1'), accelerator: 'CmdOrCtrl+1', click: () => send('menu-format', 'h1') },
        { label: m('h2'), accelerator: 'CmdOrCtrl+2', click: () => send('menu-format', 'h2') },
        { label: m('h3'), accelerator: 'CmdOrCtrl+3', click: () => send('menu-format', 'h3') },
        { label: m('h4'), accelerator: 'CmdOrCtrl+4', click: () => send('menu-format', 'h4') },
        { label: m('h5'), accelerator: 'CmdOrCtrl+5', click: () => send('menu-format', 'h5') },
        { label: m('h6'), accelerator: 'CmdOrCtrl+6', click: () => send('menu-format', 'h6') },
        { label: m('normal'),       accelerator: 'CmdOrCtrl+0',       click: () => send('menu-format', 'p') },
        { type: 'separator' },
        { label: m('quote'),        accelerator: 'CmdOrCtrl+Shift+Q', click: () => send('menu-format', 'quote') },
        { label: m('codeBlock'),    accelerator: 'CmdOrCtrl+Shift+K', click: () => send('menu-format', 'code-block') },
        { label: m('orderedList'),                                     click: () => send('menu-format', 'ordered-list') },
        { label: m('unorderedList'),                                   click: () => send('menu-format', 'list') },
        { label: m('taskList'),                                        click: () => send('menu-format', 'check') },
        { label: m('hr'),                                              click: () => send('menu-format', 'line') },
        { label: m('table'),        accelerator: 'CmdOrCtrl+Shift+T', click: () => send('menu-format', 'table') },
        { label: m('mathBlock'),                                       click: () => send('menu-format', 'math-block') },
      ],
    },
    {
      label: m('format'),
      submenu: [
        { label: m('bold'),          accelerator: 'CmdOrCtrl+B',       click: () => send('menu-format', 'bold') },
        { label: m('italic'),        accelerator: 'CmdOrCtrl+I',       click: () => send('menu-format', 'italic') },
        { label: m('strikethrough'), accelerator: 'CmdOrCtrl+Shift+S', click: () => send('menu-format', 'strike') },
        { label: m('inlineCode'),    accelerator: 'CmdOrCtrl+`',       click: () => send('menu-format', 'inline-code') },
        { label: m('inlineMath'),    accelerator: 'CmdOrCtrl+Shift+M', click: () => send('menu-format', 'inline-math') },
        { label: m('link'),          accelerator: 'CmdOrCtrl+K',       click: () => send('menu-format', 'link') },
      ],
    },
    {
      label: m('view'),
      submenu: [
        { label: m('sourceMode'),    accelerator: 'CmdOrCtrl+/',        click: () => send('menu-toggle-source') },
        { type: 'separator' },
        { label: m('toggleSidebar'), accelerator: 'CmdOrCtrl+Shift+L', click: () => send('menu-toggle-sidebar') },
        { label: m('showOutline'),   accelerator: 'CmdOrCtrl+Shift+1', click: () => send('menu-toggle-outline') },
        { type: 'separator' },
        { label: m('focusMode'),      accelerator: 'CmdOrCtrl+Shift+F', click: () => send('menu-toggle-focus') },
        { label: m('typewriterMode'), accelerator: 'CmdOrCtrl+Shift+Y', click: () => send('menu-toggle-typewriter') },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        {
          label: m('theme'),
          submenu: [
            { label: m('themeLight'), click: () => applyTheme('light')  },
            { label: m('themeDark'),  click: () => applyTheme('dark')   },
            { label: m('themeGitHub'), click: () => applyTheme('github') },
          ],
        },
        { type: 'separator' },
        {
          label: m('language'),
          submenu: [
            { label: m('langEnglish'), click: () => applyLanguage('en') },
            { label: m('langChinese'), click: () => applyLanguage('zh') },
          ],
        },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { label: m('devTools'), accelerator: 'F12', click: () => win.webContents.toggleDevTools() },
      ],
    },
    {
      label: m('help'),
      submenu: [
        {
          label: m('about'),
          click: () => dialog.showMessageBox(win, {
            type: 'info', title: m('aboutTitle'),
            message: m('aboutMessage'),
            detail: m('aboutDetail'),
          }),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function send(channel, ...args) { win?.webContents.send(channel, ...args); }

function applyTheme(theme) {
  config.theme = theme;
  writeConfig(config);
  send('menu-set-theme', theme);
}

function applyLanguage(lang) {
  config.language = lang;
  writeConfig(config);
  buildMenu();
  send('menu-set-language', lang);
}

// ── File operations ────────────────────────────────────────────────────────────
function openFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    send('file-opened', { filePath, content });
    pushRecent(filePath);
    config.lastFile = filePath;
    writeConfig(config);
    win.setTitle(path.basename(filePath) + ' — Typora');
  } catch (err) {
    dialog.showErrorBox(m('cannotOpenFile'), err.message);
  }
}

function pushRecent(filePath) {
  config.recentFiles = [filePath, ...(config.recentFiles || []).filter(f => f !== filePath)].slice(0, 10);
  writeConfig(config);
  buildMenu();
}

async function cmdOpen() {
  const r = await dialog.showOpenDialog(win, {
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['openFile'],
  });
  if (!r.canceled && r.filePaths[0]) openFile(r.filePaths[0]);
}

async function cmdOpenFolder() {
  const r = await dialog.showOpenDialog(win, { properties: ['openDirectory'] });
  if (!r.canceled && r.filePaths[0]) {
    config.lastFolder = r.filePaths[0];
    writeConfig(config);
    send('menu-open-folder', r.filePaths[0]);
  }
}

// ── IPC handlers ───────────────────────────────────────────────────────────────
ipcMain.handle('get-config',    ()           => config);
ipcMain.handle('update-config', (_, updates) => {
  const langChanged = 'language' in updates && updates.language !== config.language;
  Object.assign(config, updates);
  writeConfig(config);
  if (langChanged) buildMenu();
});
ipcMain.handle('read-file',     (_, p)           => fs.readFileSync(p, 'utf8'));
ipcMain.handle('write-file',    (_, p, data)     => {
  fs.writeFileSync(p, data, 'utf8');
  config.lastFile = p;
  pushRecent(p);
});
ipcMain.handle('show-in-folder',(_, p)           => shell.showItemInFolder(p));
ipcMain.handle('set-title',     (_, title)       => win.setTitle(title));

ipcMain.handle('save-dialog', (_, name) =>
  dialog.showSaveDialog(win, {
    defaultPath: name || 'Untitled.md',
    filters: [
      { name: 'Markdown',  extensions: ['md', 'markdown'] },
      { name: 'Text',      extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  })
);

ipcMain.handle('open-folder-dialog', () =>
  dialog.showOpenDialog(win, { properties: ['openDirectory'] })
);

ipcMain.handle('read-directory', (_, dirPath) => {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  return items
    .map(item => ({
      name:        item.name,
      path:        path.join(dirPath, item.name),
      isDirectory: item.isDirectory(),
      ext:         item.isDirectory() ? '' : path.extname(item.name).toLowerCase(),
    }))
    .sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
});

ipcMain.handle('export-html', async (_, html, name) => {
  const r = await dialog.showSaveDialog(win, {
    defaultPath: (name || 'document') + '.html',
    filters: [{ name: 'HTML', extensions: ['html'] }],
  });
  if (!r.canceled) { fs.writeFileSync(r.filePath, html, 'utf8'); shell.openPath(r.filePath); return r.filePath; }
  return null;
});

ipcMain.handle('print-to-pdf', async (_, opts) => {
  const r = await dialog.showSaveDialog(win, {
    defaultPath: (opts?.name || 'document') + '.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });
  if (!r.canceled) {
    const data = await win.webContents.printToPDF({});
    fs.writeFileSync(r.filePath, data);
    shell.openPath(r.filePath);
    return r.filePath;
  }
  return null;
});

// ── Image save (F01) ───────────────────────────────────────────────────────────
ipcMain.handle('save-image', (_, { base64, ext, currentFile }) => {
  const dir = currentFile ? path.dirname(currentFile) : app.getPath('pictures');
  const assetsDir = path.join(dir, 'assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
  const name = `img-${Date.now()}${ext}`;
  fs.writeFileSync(path.join(assetsDir, name), Buffer.from(base64, 'base64'));
  return `assets/${name}`;
});

// ── File-system ops for sidebar context menu (F05) ────────────────────────────
ipcMain.handle('fs-rename', (_, oldPath, newName) => {
  const newPath = path.join(path.dirname(oldPath), newName);
  fs.renameSync(oldPath, newPath);
  return newPath;
});

ipcMain.handle('fs-delete', (_, fp) => shell.trashItem(fp));

ipcMain.handle('fs-mkdir', (_, parentDir, name) => {
  const newPath = path.join(parentDir, name);
  fs.mkdirSync(newPath, { recursive: true });
  return newPath;
});

ipcMain.handle('fs-new-file', (_, parentDir, name) => {
  const fp = path.join(parentDir, name);
  fs.writeFileSync(fp, '', 'utf8');
  return fp;
});

// ── Export Word via Pandoc (F08) ───────────────────────────────────────────────
ipcMain.handle('export-docx', async (_, mdContent, name) => {
  const r = await dialog.showSaveDialog(win, {
    defaultPath: (name || 'document') + '.docx',
    filters: [{ name: 'Word Document', extensions: ['docx'] }],
  });
  if (r.canceled) return { success: false };

  return new Promise(resolve => {
    const proc = spawn('pandoc', ['-f', 'markdown', '-t', 'docx', '-o', r.filePath]);
    proc.stdin.write(mdContent, 'utf8');
    proc.stdin.end();
    let stderr = '';
    proc.stderr?.on('data', d => { stderr += d.toString(); });
    proc.on('close', code => {
      if (code === 0) { shell.openPath(r.filePath); resolve({ success: true }); }
      else resolve({ success: false, error: stderr || 'pandoc conversion failed' });
    });
    proc.on('error', () =>
      resolve({ success: false, error: 'pandoc not found. Install from https://pandoc.org' })
    );
  });
});

// ── Pick CSS file (F09) ────────────────────────────────────────────────────────
ipcMain.handle('pick-css-file', async () => {
  const r = await dialog.showOpenDialog(win, {
    filters: [{ name: 'CSS', extensions: ['css'] }],
    properties: ['openFile'],
  });
  return r.canceled ? null : r.filePaths[0];
});

ipcMain.on('win-minimize', () => win.minimize());
ipcMain.on('win-maximize', () => win.isMaximized() ? win.unmaximize() : win.maximize());
ipcMain.on('win-close',    () => win.close());

// ── Session restore (F04) ──────────────────────────────────────────────────────
ipcMain.once('renderer-ready', () => {
  if (pendingFile) {
    openFile(pendingFile);
    pendingFile = null;
    return;
  }
  // Restore last session
  if (config.lastFile && fs.existsSync(config.lastFile)) {
    openFile(config.lastFile);
  }
  if (config.lastFolder && fs.existsSync(config.lastFolder)) {
    send('menu-open-folder', config.lastFolder);
  }

  // Update detection (F11)
  checkForUpdate();
});

// ── Update detection (F11) ────────────────────────────────────────────────────
const CURRENT_VERSION = '1.0.0';
const RELEASE_API     = 'https://api.github.com/repos/kevinchen202008-cmyk/typora-alternative/releases/latest';

function checkForUpdate() {
  try {
    const req = net.request({ url: RELEASE_API, method: 'GET' });
    req.setHeader('User-Agent', 'typora-alternative/' + CURRENT_VERSION);
    req.on('response', (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk.toString(); });
      res.on('end', () => {
        try {
          const data    = JSON.parse(body);
          const latest  = (data.tag_name || '').replace(/^v/, '');
          const current = CURRENT_VERSION.split('.').map(Number);
          const remote  = latest.split('.').map(Number);
          const isNewer = remote.some((n, i) => n > (current[i] || 0) && current.slice(0, i).every((c, j) => c === remote[j]));
          if (isNewer) send('update-available', { version: latest, url: data.html_url || '' });
        } catch {}
      });
    });
    req.on('error', () => {});
    req.end();
  } catch {}
}

// ── App lifecycle ──────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  const args = process.argv.slice(isDev ? 2 : 1);
  if (args[0] && fs.existsSync(args[0])) pendingFile = args[0];
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
