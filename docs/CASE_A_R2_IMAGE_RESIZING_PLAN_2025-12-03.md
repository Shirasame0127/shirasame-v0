---
title: ケースA — R2 (オリジナル保存) + Cloudflare Image Resizing 運用ドキュメント
date: 2025-12-03
---

## 概要
このドキュメントは「ケース A：R2 にオリジナルのみ保存し、Cloudflare Image Resizing によるオンデマンド変換を使う」運用を正式にまとめたものです。
今後の実装・検証・監視はこのドキュメントを中心に進めます。

対象: v0-samehome プロジェクトの画像配信ワークフロー

目的:
- コスト最小化（R2 の無料枠 + Image Resizing 無料変換枠内運用）
- 表示速度の確保（Edge キャッシュ活用）
- 運用手順と検証方法の標準化

---

## 主要前提（本ドキュメントの想定）
- 月間 PV: **8,000**
- 最大登録商品: **500 件**
- 1 商品あたり平均画像数: **3.1 枚（70% が4枚、30% が1枚）**
- 合計保存画像数: **1,550 枚**
- 画像 variants: `200px`, `400px`, `800px`（代表的パラメータ）
- オリジナル平均サイズ: **600 KB**

これらの前提では:
- R2 保存容量 ≒ **0.93 GB**（無料枠 10 GB に収まる）
- unique transformations = **1,550 * 3 = 4,650**（Cloudflare Images の無料 5,000 に収まる）

---

## 画像バリアント（本運用で確定）
以下のバリアント幅を正式に採用します。これにより変換パラメータを固定し、ユニーク変換数の増加を抑えます。

- ヘッダー画像（大）: スマホ 800px / PC 800px（結果的に 800px のみ）
- 商品画像（一覧表示）: スマホ 200px / PC 400px
- 商品画像（詳細表示）: スマホ 400px / PC 400px（400px のみ）
- 添付画像（商品添付）: スマホ 200px / PC 400px
- ギャラリー表示（商品画像＋添付混合）: スマホ 200px / PC 400px
- レシピ画像: スマホ 400px / PC 800px
- プロフィールアイコン: スマホ 200px / PC 200px（200px のみ）
- ローディングアニメーション用 GIF: オリジナルのまま（変換しない）
- 他の公開ページに埋め込みの画像: オリジナルのまま

注: 実運用では `format=auto` と `quality` を併用します。実際に参照される幅は `200/400/800` に集約されるため、unique transformations は抑制されます。


## アーキテクチャ（要点）
1. クライアントは画像アップロードを `direct-upload` API 経由で R2 へ直接 PUT（presigned URL）する。
2. presigner はアップロード用の `uploadURL` に加え、オブジェクトの `publicUrl`（R2 の公開サブドメイン + オブジェクトキー）を返す。
3. 公開側（public-site）では、表示時に `publicUrl` を直接参照し、Image Resizing パラメータを URL 経由で付与して配信する。
   - 例: `https://<r2-subdomain>/cdn-cgi/image/width=400,format=auto/uploads/xxxxx.jpg`
4. Cloudflare エッジはオンデマンドで変換し、変換結果をエッジにキャッシュする（2 回目以降は高速）。

利点:
- サーバで `sharp` を常時動かす必要がなく Pages/Workers 上で軽量に運用できる。
- 変換ユニーク数が無料枠内であれば変換課金が発生しない。

---

## 実装ステップ（低リスク順・推奨）
1. presigner のレスポンスに `publicUrl` を追加する（サーバ側小変更）。
   - 目的: アップロード直後の即時プレビューや、クライアントで Image Resizing URL を素早く生成するため。
2. フロントエンド（`components/image-upload.tsx` など）を更新して `publicUrl` を優先して表示・参照する。
3. Image Resizing の代表的パラメータセットを決定する（例: `width=200,400,800; format=auto; quality=75`）。
4. Cloudflare ダッシュボードで Image Resizing を有効化し、必要なルール（サブドメイン、CORS、Cache Settings）を設定する。
5. 代表サンプル画像で HEAD/curl チェックを実行し `cf-cache-status`（MISS→HIT）とレスポンスタイムを確認する。
6. 1 週間のトラフィックで `Storage`、`Class A/B`、`unique transformations` を監視する。

---

## URL とサンプル（テンプレート）
- presigned upload の `publicUrl`（例）:
  - `https://pub-<ACCOUNT_HASH>.r2.dev/uploads/20251203-<id>.jpg`
- Image Resizing（例）:
  - 幅 400 の自動フォーマット: `https://pub-<ACCOUNT_HASH>.r2.dev/cdn-cgi/image/width=400,format=auto/uploads/20251203-<id>.jpg`
  - 幅 200（モバイル）: `https://.../cdn-cgi/image/width=200,format=auto/uploads/...` 

注: 実際のサブドメインとパスはアカウントの R2 サブドメイン設定に依存します。上記はテンプレートです。

---

## 検証手順（初心者向け・短い）
1. サンプル画像の HEAD チェック（PowerShell）:
```powershell
Invoke-WebRequest -Method Head "https://pub-<ACCOUNT_HASH>.r2.dev/uploads/<key>.jpg" -UseBasicParsing | Select-Object StatusCode,Headers
```
2. Image Resizing を使った HEAD（cf-cache-status を確認）:
```bash
curl -I "https://pub-<ACCOUNT_HASH>.r2.dev/cdn-cgi/image/width=400,format=auto/uploads/<key>.jpg"
# ヘッダ内 `cf-cache-status: MISS`（初回） → 再度実行で `HIT` になることを確認
```
3. 初回レスポンスタイムと 2 回目以降（HIT）の差を記録する（数値で比較する）。

---

## 監視・アラート（必須項目）
- Cloudflare ダッシュボード: `R2 Storage` 使用量（GB‑month）
- Cloudflare ダッシュボード: `Class A / Class B` 操作数（無料枠超過の監視）
- Cloudflare Images / Resizing: `unique transformations`（月間）
- アプリレベル: `cf-cache-status` のヒット率（目標: 80% 以上）
- しきい値アラート例:
  - Storage > 8 GB → アラート
  - Class B > 8,000,000 / 月 → アラート
  - unique transforms > 4,500 / 月 → ウォッチ（5,000 に近づいたら通知）

---

## 運用上のベストプラクティス（短期〜中期）
- 変換パラメータは出来るだけ固定し、ユニーク数を抑える。
- 人気コンテンツ（上位 10–20%）は事前生成して R2 に保存する（ハイブリッド）。
- 画像の `Cache-Control` を長め（例: 30 日）に設定し、更新時はバージョン（クエリ or ファイル名）で差し替える。
- 大量の一時処理やバッチ（sharp 等）が必要になったら、夜間バッチで R2 に variants を pre-generate する。

---

## フォールバック（トラブル時）
- もし Image Resizing のユニーク変換が想定を超えて課金される場合:
  1. 変換パラメータを減らす（例: 200/800 のみにする）。
  2. 人気画像を事前生成して R2 に保存する。 
  3. 必要なら Cloudflare Images の利用を検討（管理機能・品質面で有利）。

---

## 変更履歴
- 2025-12-03: 初版作成（ケース A の正式ドキュメント）

---

## 次のアクション（短期）
1. presigner に `publicUrl` を追加してデプロイ（軽微パッチ）。
2. フロントで `publicUrl` を優先する変更を実装。PR を作成してください。
3. Cloudflare 側で Image Resizing を有効化し、代表サンプルで検証を開始。
