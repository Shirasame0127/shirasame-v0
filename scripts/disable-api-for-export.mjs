import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const appDir = path.join(projectRoot, 'app');
const apiDir = path.join(appDir, 'api');
const disabledDir = path.join(appDir, '__api_disabled');

const shouldDisable = process.env.NEXT_OUTPUT_EXPORT === '1' || process.env.NEXT_OUTPUT_EXPORT === 'true';

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

if (!shouldDisable) {
  console.log('[disable-api-for-export] NEXT_OUTPUT_EXPORT is not enabled. Skipping.');
  process.exit(0);
}

if (!exists(apiDir)) {
  console.log('[disable-api-for-export] No app/api directory found. Nothing to disable.');
  process.exit(0);
}

if (exists(disabledDir)) {
  console.log('[disable-api-for-export] Disabled directory already exists. Removing it first.');
  fs.rmSync(disabledDir, { recursive: true, force: true });
}

console.log('[disable-api-for-export] Temporarily moving app/api -> app/__api_disabled for static export');
fs.renameSync(apiDir, disabledDir);
console.log('[disable-api-for-export] Done.');
