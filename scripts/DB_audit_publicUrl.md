# DB Audit: Find non-canonical publicUrl values

この SQL は、DB 内に `?` や `#` を含む `publicUrl`（または同等のカラム）が保存されていないかを検出するためのサンプルです。

注意: 実際のテーブル名／カラム名はプロジェクトのスキーマに合わせて変更してください。

-- 例: images テーブルで public_url カラムを検索
SELECT id, public_url
FROM images
WHERE public_url LIKE '%?%'
   OR public_url LIKE '%#%'
LIMIT 100;

-- 例: users テーブルで profile_image が問題ないか確認
SELECT id, profile_image
FROM users
WHERE profile_image LIKE '%?%'
   OR profile_image LIKE '%#%'
LIMIT 100;

-- 一括で修正する場合（注意: 実行前にバックアップ必須）
-- 下のクエリは `?` と `#` 以降を削除して更新します（Postgres の例）
-- UPDATE images
-- SET public_url = regexp_replace(public_url, '[?#].*$', '')
-- WHERE public_url ~ '[?#]';

実行手順:
1. Supabase SQL エディタ (または使用中の DB 管理ツール) に上記クエリを貼り付けて実行。
2. 検出されたレコードをレビューし、必要ならバックアップを取ってから一括更新を実施。

> 注: 自動更新を行う場合は、まず少数のレコードでテストしてから全件更新してください。
