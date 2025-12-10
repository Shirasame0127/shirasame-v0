const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scanDir = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      scanDir(full);
    } else {
      checkFile(full);
    }
  }
};

const patterns = [
  'window.__env__.API_BASE',
  'FORCE_API_BASE',
  'PUBLIC_WORKER_API_BASE'
];

let found = [];

function checkFile(filePath) {
  // only check likely text files
  const ext = path.extname(filePath).toLowerCase();
  const textExts = ['.html', '.js', '.mjs', '.json', '.txt', '.map'];
  if (!textExts.includes(ext)) return;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const p of patterns) {
      if (content.includes(p)) {
        found.push({ file: filePath, pattern: p });
      }
    }
  } catch (e) {
    // ignore unreadable files
  }
}

// scan common Next.js output dirs
const candidates = [path.join(root, '.next'), path.join(root, 'out'), path.join(root, 'build')];
for (const c of candidates) {
  if (fs.existsSync(c)) scanDir(c);
}

if (found.length) {
  console.error('\nERROR: runtime API_BASE injection patterns found in build output:');
  for (const f of found) {
    console.error(` - ${f.file} (contains: ${f.pattern})`);
  }
  console.error('\nThis build will fail to avoid accidental public-worker direct calls from admin client.');
  process.exitCode = 2;
  process.exit(2);
}

console.log('OK: no runtime API_BASE injection patterns found in build output.');
