const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'node_modules', 'vditor', 'dist');
const dest = path.join(root, 'public', 'vditor', 'dist');

if (!fs.existsSync(src)) {
  console.warn('vditor not installed yet, skipping asset copy.');
  process.exit(0);
}

fs.mkdirSync(dest, { recursive: true });
fs.cpSync(src, dest, { recursive: true, force: true });
console.log('✓ Vditor assets copied → public/vditor/dist');
