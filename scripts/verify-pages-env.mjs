#!/usr/bin/env node
const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PUBLIC_PROFILE_EMAIL',
  'NEXT_PUBLIC_R2_PUBLIC_URL',
  'CLOUDFLARE_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
];

const missing = required.filter((k) => !process.env[k] || String(process.env[k]).length === 0);

if (missing.length) {
  console.error('[verify-pages-env] 必須の環境変数が不足しています:\n', missing.map((k) => `- ${k}`).join('\n'));
  console.error('\n設定場所の例:');
  console.error('- Cloudflare Pages を使う場合: Pages プロジェクトの Environment Variables');
  console.error('- GitHub Actions を使う場合: リポジトリ Secrets and variables > Actions');
  process.exit(1);
}

console.log('[verify-pages-env] OK: 必須の環境変数は揃っています。');
