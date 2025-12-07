# Migrate image URL -> key (key-only policy)

This folder contains a safe, opinionated migration template to convert stored full image URLs
in Supabase to the key-only format described in `docs/CASE_A_R2_IMAGE_RESIZING_PLAN_2025-12-03.md`.

Important: Always run on a staging copy or after taking a full backup. Test the statements and
adjust table/column names to match your schema before applying in production.

Files:
- `convert_image_urls_to_keys.sql` — SQL template with UPDATE statements for common URL patterns.

Recommended workflow
1. Dump a backup (pg_dump) or export the affected tables. Example (replace placeholders):

```powershell
# Example: using psql with Supabase connection string (PGSSLMODE=require may be needed)
# Get your Supabase DB URL from the dashboard (Pg connection string)
psql "postgresql://<db_user>:<db_pass>@<db_host>:5432/<db_name>?sslmode=require" -c "\copy (SELECT * FROM product_images LIMIT 1) TO STDOUT WITH CSV HEADER"
```

Or use `pg_dump` to snapshot the whole DB:

```powershell
pg_dump "postgresql://<db_user>:<db_pass>@<db_host>:5432/<db_name>?sslmode=require" -Fc -f backup_pre_migration.dump
```

2. Review `convert_image_urls_to_keys.sql` and adjust table/column names to your schema.

3. Perform a dry-run review:
   - Run SELECT verification queries to see which rows will be affected.
   - Example:

```sql
SELECT id, url FROM product_images WHERE url ~ '^https?://images\.shirasame\.com/' LIMIT 50;
SELECT id, url FROM images WHERE url ~ '^https?://images\.shirasame\.com/cdn-cgi/image/' LIMIT 50;
```

4. Run the migration in a transaction (the SQL file already wraps with BEGIN/COMMIT). Example using `psql`:

```powershell
psql "postgresql://<db_user>:<db_pass>@<db_host>:5432/<db_name>?sslmode=require" -f scripts/convert_image_urls_to_keys.sql
```

5. Verify the results:

```sql
SELECT id, key, url FROM product_images WHERE key IS NULL AND url IS NOT NULL LIMIT 50;
SELECT id, key, url FROM images WHERE key IS NULL AND url IS NOT NULL LIMIT 50;
```

6. If all is good, consider nullifying or removing the deprecated `url` columns after a retention period.

Notes & Caveats
- The migration uses several regex patterns. If your dataset contains other hosting domains or
  unusual paths, add/update the regex rules accordingly.
- The `convert_image_urls_to_keys.sql` file includes a conservative generic rule (pattern 4).
  Only enable that if you understand its effects — it strips leading host and optional bucket
  name, using the remaining path as the key.
- For complex cases, extract samples of `url` values (SELECT DISTINCT url FROM ... LIMIT 200)
  and add targeted rules.

Need help running this? I can:
- generate a tailored migration limited to the exact tables/columns in your schema, or
- create a small Node/Python script to preview and apply changes with a dry-run option.
