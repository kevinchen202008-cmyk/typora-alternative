const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Invoke (request → response)
  getConfig:        ()               => ipcRenderer.invoke('get-config'),
  updateConfig:     (updates)        => ipcRenderer.invoke('update-config', updates),
  readFile:         (filePath)       => ipcRenderer.invoke('read-file', filePath),
  writeFile:        (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  saveDialog:       (name)           => ipcRenderer.invoke('save-dialog', name),
  openFolderDialog: ()               => ipcRenderer.invoke('open-folder-dialog'),
  readDirectory:    (dirPath)        => ipcRenderer.invoke('read-directory', dirPath),
  showInFolder:     (filePath)       => ipcRenderer.invoke('show-in-folder', filePath),
  setTitle:         (title)          => ipcRenderer.invoke('set-title', title),
  exportHtml:       (html, name)     => ipcRenderer.invoke('export-html', html, name),
  printToPdf:       (opts)           => ipcRenderer.invoke('print-to-pdf', opts),

  // F01: Image save
  saveImage:        (data)           => ipcRenderer.invoke('save-image', data),

  // F05: Sidebar file ops
  fsRename:         (oldPath, name)  => ipcRenderer.invoke('fs-rename', oldPath, name),
  fsDelete:         (filePath)       => ipcRenderer.invoke('fs-delete', filePath),
  fsMkdir:          (parent, name)   => ipcRenderer.invoke('fs-mkdir', parent, name),
  fsNewFile:        (parent, name)   => ipcRenderer.invoke('fs-new-file', parent, name),

  // F08: Word export
  exportDocx:       (md, name)       => ipcRenderer.invoke('export-docx', md, name),

  // F09: Custom CSS
  pickCssFile:      ()               => ipcRenderer.invoke('pick-css-file'),

  // Window controls
  minimize: () => ipcRenderer.send('win-minimize'),
  maximize: () => ipcRenderer.send('win-maximize'),
  close:    () => ipcRenderer.send('win-close'),

  rendererReady: () => ipcRenderer.send('renderer-ready'),

  // Menu → renderer events (each returns a cleanup fn)
  onFileOpened:          (cb) => on('file-opened',           (_, d) => cb(d)),
  onMenuNewFile:         (cb) => on('menu-new-file',         ()     => cb()),
  onMenuSave:            (cb) => on('menu-save',             ()     => cb()),
  onMenuSaveAs:          (cb) => on('menu-save-as',          ()     => cb()),
  onMenuOpenFolder:      (cb) => on('menu-open-folder',      (_, p) => cb(p)),
  onMenuToggleSource:    (cb) => on('menu-toggle-source',    ()     => cb()),
  onMenuToggleSidebar:   (cb) => on('menu-toggle-sidebar',   ()     => cb()),
  onMenuToggleOutline:   (cb) => on('menu-toggle-outline',   ()     => cb()),
  onMenuSetTheme:        (cb) => on('menu-set-theme',        (_, t) => cb(t)),
  onMenuExport:          (cb) => on('menu-export',           (_, f) => cb(f)),
  onMenuFormat:          (cb) => on('menu-format',           (_, c) => cb(c)),
  onMenuFind:            (cb) => on('menu-find',             (_, r) => cb(r)),
  onMenuToggleFocus:     (cb) => on('menu-toggle-focus',     ()     => cb()),
  onMenuToggleTypewriter:(cb) => on('menu-toggle-typewriter',()     => cb()),
  onMenuSettings:        (cb) => on('menu-settings',         ()     => cb()),
});

function on(channel, handler) {
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}
