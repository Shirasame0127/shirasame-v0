import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const appDir = path.join(projectRoot, 'app');
const adminDir = path.join(appDir, 'admin');
const disabledDir = path.join(appDir, '__admin_disabled');

const shouldDisable = process.env.NEXT_OUTPUT_EXPORT === '1' || process.env.NEXT_OUTPUT_EXPORT === 'true';

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

if (!shouldDisable) {
  console.log('[disable-admin-for-export] NEXT_OUTPUT_EXPORT is not enabled. Skipping.');
  process.exit(0);
}

if (!exists(adminDir)) {
  console.log('[disable-admin-for-export] No app/admin directory found. Nothing to disable.');
  process.exit(0);
}

if (exists(disabledDir)) {
  console.log('[disable-admin-for-export] Disabled directory already exists. Removing it first.');
  fs.rmSync(disabledDir, { recursive: true, force: true });
}

console.log('[disable-admin-for-export] Temporarily moving app/admin -> app/__admin_disabled for static export');
fs.renameSync(adminDir, disabledDir);
console.log('[disable-admin-for-export] Done.');
