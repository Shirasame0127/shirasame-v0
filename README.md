# ガジェット紹介サイト

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/tenshos-projects/v0--fq)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/v50zmafc2aW)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/tenshos-projects/v0--fq](https://vercel.com/tenshos-projects/v0--fq)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/v50zmafc2aW](https://v0.app/chat/v50zmafc2aW)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## 画像保存方式

このプロジェクトでは、画像を localStorage のマップ（キー: `mock_image_uploads`）に保存します。

### 保存API
- `db.images.saveUpload(key: string, url: string)`: 画像を保存
- `db.images.getUpload(key: string)`: 画像を取得

### 実装例

**ユーザープロフィールアイコン:**
- 保存時: `profileImageKey` をユーザー情報に格納
- 表示時: `db.images.getUpload(user.profileImageKey)` で取得

**ヘッダー画像（複数対応）:**
- 保存時: `headerImageKeys[]` 配列をユーザー情報に格納
- 表示時: キー配列をマップして各画像を取得し、スライドショー表示

**背景画像:**
- 保存時: `backgroundImageKey` をユーザー情報に格納
- 表示時: `db.images.getUpload(user.backgroundImageKey)` で取得

### 影響範囲
- `lib/db/storage.ts`: `imageUploadStorage` API
- `lib/db/schema.ts`: `User` 型に `*Key` フィールド追加
- `app/admin/settings/page.tsx`: 画像アップロード処理
- `components/profile-header.tsx`: ヘッダー画像表示

### ローカル動作確認手順
1. 管理画面 `/admin/settings` にアクセス
2. プロフィール画像、ヘッダー画像、背景画像をアップロード
3. 「保存」をクリック
4. ブラウザの開発者ツール → Application → Local Storage で `mock_image_uploads` を確認
5. 公開ページ `/` でヘッダー画像のスライドショーとプロフィール画像が正しく表示されることを確認
