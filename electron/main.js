const { app, BrowserWindow, Menu, dialog, ipcMain, shell, net } = require('electron');
const path = require('path');
const fs   = require('fs');
const { spawn } = require('child_process');

const isDev      = !app.isPackaged;
const configPath = path.join(app.getPath('userData'), 'config.json');

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
      label: 'File',
      submenu: [
        { label: 'New',            accelerator: 'CmdOrCtrl+N',        click: () => send('menu-new-file') },
        { label: 'New Tab',        accelerator: 'CmdOrCtrl+T',        click: () => send('menu-new-tab') },
        { label: 'Close Tab',      accelerator: 'CmdOrCtrl+W',        click: () => send('menu-close-tab') },
        { type: 'separator' },
        { label: 'Open...',        accelerator: 'CmdOrCtrl+O',        click: cmdOpen },
        { label: 'Open Folder...', accelerator: 'CmdOrCtrl+Shift+O',  click: cmdOpenFolder },
        {
          label: 'Open Recent',
          submenu: recent.length
            ? recent.map(f => ({ label: path.basename(f), click: () => openFile(f) }))
            : [{ label: 'No recent files', enabled: false }],
        },
        { type: 'separator' },
        { label: 'Save',           accelerator: 'CmdOrCtrl+S',        click: () => send('menu-save') },
        { label: 'Save As...',     accelerator: 'CmdOrCtrl+Shift+S',  click: () => send('menu-save-as') },
        { type: 'separator' },
        {
          label: 'Export',
          submenu: [
            { label: 'HTML...',        click: () => send('menu-export', 'html') },
            { label: 'PDF...',         click: () => send('menu-export', 'pdf')  },
            { label: 'Word (.docx)...', click: () => send('menu-export', 'docx') },
          ],
        },
        { type: 'separator' },
        { label: 'Settings...', accelerator: 'CmdOrCtrl+,', click: () => send('menu-settings') },
        { type: 'separator' },
        { role: 'quit', label: 'Exit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
        { type: 'separator' },
        { label: 'Find',    accelerator: 'CmdOrCtrl+F', click: () => send('menu-find') },
        { label: 'Replace', accelerator: 'CmdOrCtrl+H', click: () => send('menu-find', true) },
      ],
    },
    {
      label: 'Paragraph',
      submenu: [
        { label: 'Heading 1',       accelerator: 'CmdOrCtrl+1',       click: () => send('menu-format', 'h1') },
        { label: 'Heading 2',       accelerator: 'CmdOrCtrl+2',       click: () => send('menu-format', 'h2') },
        { label: 'Heading 3',       accelerator: 'CmdOrCtrl+3',       click: () => send('menu-format', 'h3') },
        { label: 'Heading 4',       accelerator: 'CmdOrCtrl+4',       click: () => send('menu-format', 'h4') },
        { label: 'Heading 5',       accelerator: 'CmdOrCtrl+5',       click: () => send('menu-format', 'h5') },
        { label: 'Heading 6',       accelerator: 'CmdOrCtrl+6',       click: () => send('menu-format', 'h6') },
        { label: 'Normal',          accelerator: 'CmdOrCtrl+0',       click: () => send('menu-format', 'p') },
        { type: 'separator' },
        { label: 'Quote',           accelerator: 'CmdOrCtrl+Shift+Q', click: () => send('menu-format', 'quote') },
        { label: 'Code Block',      accelerator: 'CmdOrCtrl+Shift+K', click: () => send('menu-format', 'code-block') },
        { label: 'Ordered List',                                       click: () => send('menu-format', 'ordered-list') },
        { label: 'Unordered List',                                     click: () => send('menu-format', 'list') },
        { label: 'Task List',                                          click: () => send('menu-format', 'check') },
        { label: 'Horizontal Rule',                                    click: () => send('menu-format', 'line') },
        { label: 'Table',           accelerator: 'CmdOrCtrl+Shift+T', click: () => send('menu-format', 'table') },
        { label: 'Math Block',                                         click: () => send('menu-format', 'math-block') },
      ],
    },
    {
      label: 'Format',
      submenu: [
        { label: 'Bold',          accelerator: 'CmdOrCtrl+B',        click: () => send('menu-format', 'bold') },
        { label: 'Italic',        accelerator: 'CmdOrCtrl+I',        click: () => send('menu-format', 'italic') },
        { label: 'Strikethrough', accelerator: 'CmdOrCtrl+Shift+S',  click: () => send('menu-format', 'strike') },
        { label: 'Inline Code',   accelerator: 'CmdOrCtrl+`',        click: () => send('menu-format', 'inline-code') },
        { label: 'Inline Math',   accelerator: 'CmdOrCtrl+Shift+M',  click: () => send('menu-format', 'inline-math') },
        { label: 'Link',          accelerator: 'CmdOrCtrl+K',        click: () => send('menu-format', 'link') },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Source Mode',    accelerator: 'CmdOrCtrl+/',        click: () => send('menu-toggle-source') },
        { type: 'separator' },
        { label: 'Toggle Sidebar', accelerator: 'CmdOrCtrl+Shift+L', click: () => send('menu-toggle-sidebar') },
        { label: 'Show Outline',   accelerator: 'CmdOrCtrl+Shift+1', click: () => send('menu-toggle-outline') },
        { type: 'separator' },
        { label: 'Focus Mode',      accelerator: 'CmdOrCtrl+Shift+F', click: () => send('menu-toggle-focus') },
        { label: 'Typewriter Mode', accelerator: 'CmdOrCtrl+Shift+Y', click: () => send('menu-toggle-typewriter') },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        {
          label: 'Theme',
          submenu: [
            { label: 'Default (Light)', click: () => applyTheme('light')  },
            { label: 'Dark',            click: () => applyTheme('dark')   },
            { label: 'GitHub',          click: () => applyTheme('github') },
          ],
        },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { label: 'Developer Tools', accelerator: 'F12', click: () => win.webContents.toggleDevTools() },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => dialog.showMessageBox(win, {
            type: 'info', title: 'About',
            message: 'Typora-like Markdown Editor',
            detail: 'Built with Electron + Vditor\nVersion 0.2.0',
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
    dialog.showErrorBox('Cannot open file', err.message);
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
  Object.assign(config, updates);
  writeConfig(config);
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
