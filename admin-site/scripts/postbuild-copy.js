const fs = require('fs');
const path = require('path');

async function copyDir(src, dest) {
  try {
    await fs.promises.mkdir(dest, { recursive: true });
    // Node 16.7+ has fs.cp; fallback to manual copy
    if (fs.promises.cp) {
      await fs.promises.cp(src, dest, { recursive: true });
    } else {
      const entries = await fs.promises.readdir(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          await copyDir(srcPath, destPath);
        } else {
          await fs.promises.copyFile(srcPath, destPath);
        }
      }
    }
  } catch (err) {
    // ignore missing source
  }
}

(async () => {
  const root = path.resolve(__dirname, '..');
  const nextDir = path.join(root, '.next');
  const serverAppDir = path.join(nextDir, 'server', 'app');
  const staticDir = path.join(nextDir, 'static');
  const nextPrefixedStatic = path.join(nextDir, '_next', 'static');
  const publicDir = path.join(root, 'public');

  try {
    // 1) copy server app files into .next (mirrors previous cp -r .next/server/app/* .next/)
    await copyDir(serverAppDir, nextDir);
    // 2) ensure Next assets are available at /.next/_next/static when publish dir = .next
    await copyDir(staticDir, nextPrefixedStatic);
    // 3) include public assets (e.g., placeholder.svg) into publish directory `.next`
    await copyDir(publicDir, nextDir);
    console.log('postbuild-copy: done');
  } catch (err) {
    console.error('postbuild-copy: error', err);
    process.exitCode = 0; // do not fail build
  }
})();
