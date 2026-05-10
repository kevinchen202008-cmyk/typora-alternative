/**
 * Assembles a portable (green) Typora package.
 *
 * Output structure:
 *   release/Typora/
 *     Typora.exe          ← renamed electron.exe
 *     resources/app/      ← our app code + built renderer
 *     locales/ + *.dll/pak/... ← Chromium runtime files
 */

const fs   = require('fs');
const path = require('path');

const root      = path.join(__dirname, '..');
const electronDist = path.join(root, 'node_modules', 'electron', 'dist');
const outDir    = path.join(root, 'release', 'Typora');
const appDir    = path.join(outDir, 'resources', 'app');

// ── helpers ────────────────────────────────────────────────────────────────────
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function step(msg) { process.stdout.write(`\n  ${msg} ...`); }
function done()    { process.stdout.write(' done'); }

// ── main ───────────────────────────────────────────────────────────────────────
console.log('\nBuilding portable Typora package\n' + '='.repeat(40));

// 1. Clean output
step('Cleaning release/Typora');
if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(appDir, { recursive: true });
done();

// 2. Copy Electron runtime (all files in electron/dist except resources/)
step('Copying Electron runtime');
for (const entry of fs.readdirSync(electronDist, { withFileTypes: true })) {
  const src = path.join(electronDist, entry.name);
  const dst = path.join(outDir, entry.name);
  if (entry.name === 'resources') continue;   // we'll handle this separately
  if (entry.isDirectory()) copyDir(src, dst);
  else fs.copyFileSync(src, dst);
}
done();

// 3. Rename electron.exe → Typora.exe
step('Renaming electron.exe → Typora.exe');
fs.renameSync(path.join(outDir, 'electron.exe'), path.join(outDir, 'Typora.exe'));
done();

// 4. Copy Electron's built-in resources (icudtl already copied; copy resources/* except app/)
step('Copying Electron built-in resources');
const elResources = path.join(electronDist, 'resources');
const outResources = path.join(outDir, 'resources');
fs.mkdirSync(outResources, { recursive: true });
for (const entry of fs.readdirSync(elResources, { withFileTypes: true })) {
  if (entry.name === 'app' || entry.name === 'app.asar') continue;
  const src = path.join(elResources, entry.name);
  const dst = path.join(outResources, entry.name);
  if (entry.isDirectory()) copyDir(src, dst);
  else fs.copyFileSync(src, dst);
}
done();

// 5. Write minimal package.json for the app
step('Writing app package.json');
fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify({
  name: 'typora-alternative',
  version: '1.0.0',
  main: 'electron/main.js',
}, null, 2), 'utf8');
done();

// 6. Copy main + preload
step('Copying electron/ sources');
copyDir(path.join(root, 'electron'), path.join(appDir, 'electron'));
done();

// 7. Copy Vite build output (includes vditor assets)
step('Copying dist/ (renderer build)');
const distSrc = path.join(root, 'dist');
if (!fs.existsSync(distSrc)) {
  console.error('\n\n  ERROR: dist/ not found — run "npm run build" first\n');
  process.exit(1);
}
copyDir(distSrc, path.join(appDir, 'dist'));
done();

// 8. Print summary
const sizeMB = dirSizeMB(outDir);
console.log(`\n\n${'='.repeat(40)}`);
console.log(`Package ready: release/Typora/  (${sizeMB} MB)`);
console.log(`Entry point:   release/Typora/Typora.exe`);
console.log(`\nZip the release/Typora/ folder to share.\n`);

function dirSizeMB(dir) {
  let total = 0;
  function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else total += fs.statSync(p).size;
    }
  }
  walk(dir);
  return (total / 1024 / 1024).toFixed(1);
}
