**Images table: Dedupe & Unique Index — Runbook**

- **Purpose**: Ensure `images.key` is unique and enforceable so `ON CONFLICT (key)` upserts work atomically.

Pre-steps (must do before modifying data):
- Backup the database. Example with `pg_dump`:

```powershell
# On your DB host or via psql host access
pg_dump -h <host> -U <user> -d <db> -Fc -f images_backup_$(Get-Date -Format "yyyyMMddHHmmss").dump
```

- Or use Supabase snapshot feature via console.

Run dedupe & index steps:
1) Run the dedupe part (keeps earliest `created_at`):
   - Execute `images_dedupe_and_index.sql` up to and including the `COMMIT;` block.
2) After dedupe completes, create the unique index concurrently:
   - `CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS images_key_unique ON public.images (key);`
   - NOTE: `CONCURRENTLY` must be run outside a transaction. If your SQL client wraps commands in a transaction, run this separately.

Verification:
- `SELECT key, COUNT(*) FROM public.images GROUP BY key HAVING COUNT(*) > 1;` should return zero rows.
- `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'images';` should show `images_key_unique`.

Rollback (if needed):
- Restore from the dump created earlier:

```powershell
pg_restore -h <host> -U <user> -d <db> -c <path-to-dumpfile.dump>
```

Execution logs to collect and provide:
- Start timestamp and end timestamp for the dedupe run.
- Output of the duplicate-detection query before and after dedupe.
- Output of the `CREATE INDEX CONCURRENTLY` command (success/failure).

Notes & recommendations:
- Prefer taking a snapshot in Supabase console for easier rollback.
- Do not run `CREATE UNIQUE INDEX CONCURRENTLY` while heavy write load is occurring; schedule brief maintenance if needed.
- After index creation, re-run the application tests for `images/complete` upsert behavior.
