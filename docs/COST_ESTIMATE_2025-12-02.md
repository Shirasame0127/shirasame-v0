# コスト試算メモ (2025-12-02)

本ドキュメントは、現時点の各サービス公式価格に基づく月額の概算です。前提は公開ページの SSG 維持＋データは CSR で Fetch（商品/コレクション/プロフィール/レシピ）という構成です。

## 前提条件（利用想定）
- 月間 PV: 6,000〜8,000
- 1 PV あたり API リクエスト: 平均 5 → 合計 30,000〜40,000 リクエスト/月
- 商品 ~120、画像 ~600（R2保管）
- R2 保存量: ~0.2GB、月間 GET: 80k〜100k
- Supabase DB: 数百 MB 未満（Free 500MB 枠を意識）

## サービス別 現行プラン要点（抜粋）
- Cloudflare Workers Free: 100,000 req/日、1 invocation あたり CPU 10ms 上限
- Cloudflare Workers Paid (Standard): $5/月＋1,000万 req/月＋3,000万 CPU ms/月含む（超過: $0.30/百万 req, $0.02/百万 ms）
- Cloudflare R2 Free: 10GB-month, Class A 100万/月, Class B 1,000万/月, Egress 無料（超過: Storage $0.015/GB, Class A $4.5/百万, Class B $0.36/百万）
- Cloudflare Pages Free: 月 500 ビルド、Functions は Workers Free のリミットに従う
- Supabase Free: $0/月、DB 500MB、File 1GB、Egress 5GB、50k MAU

## 月間利用量と無料枠比較（概算）
| 項目 | 想定利用 | 無料枠 | 超過 | 追加費用 |
|---|---:|---:|:---:|---:|
| Workers Requests | 30k〜40k/月 | 100k/日 | なし | $0.00 |
| Workers CPU | 40k×7ms ≈ 0.28M ms | 無料枠は課金対象外 | なし | $0.00 |
| R2 Storage | ~0.2GB | 10GB | なし | $0.00 |
| R2 Class A | ~1k/月 | 1,000,000/月 | なし | $0.00 |
| R2 Class B | 80k〜100k/月 | 10,000,000/月 | なし | $0.00 |
| Supabase DB | 0.3〜0.5GB | 0.5GB | 境界 | $0.00 |
| Supabase File | ~0.2GB | 1GB | なし | $0.00 |
| Supabase Egress | ~2GB/月 | 5GB/月 | なし | $0.00 |
| Pages Builds | <100/月 | 500/月 | なし | $0.00 |

## 選択肢別 月額試算（USD）
| 選択肢 | 構成概要 | Workers 有料化 | 推定追加 | 推定合計 |
|---|---|:---:|---:|---:|
| A Static Shell + CSR | Pages + Workers Free + Supabase Free + R2 Free | 不要 | $0.00 | $0.00 |
| B SSG + 静的JSON | Pages Free + Supabase Free + R2 Free | 不要 | $0.00 | $0.00 |
| C Hybrid（部分動的） | Workers Free（軽負荷） | 不要 | $0.00 | $0.00 |
| D Astro SSG + Islands | Pages Free + Supabase Free + R2 Free | 不要 | $0.00 | $0.00 |
| 予備: Workers Paid | 大規模/拡張時 | 必要 | $5.00 | $5.00 |
| 予備: Supabase Pro | DB>500MB 等 | 必要 | $25.00 | $25.00 |

## 超過トリガー目安と対応
- Supabase DB 容量: 450MB 警戒、500MB 超で Pro 移行（$25/月）
- R2 Storage: 8GB 警戒、10GB 超過で従量課金
- Workers Requests: 日次 80k 以上のスパイクで注意、100k/日で制限
- Pages Builds: 400/月 警戒、500/月 超でプラン見直し

## 備考
- 画像は R2 に保存する前提のため DB 容量はテキスト主体。Base64 などの大きな文字列を DB に多数格納すると 500MB 到達が早まる可能性あり。
- 実際の為替・消費税・各社価格改定で金額は変動します。