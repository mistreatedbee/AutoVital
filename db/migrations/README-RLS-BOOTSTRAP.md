# Fix "new row violates row-level security policy for table accounts"

Apply the RLS migration so authenticated users can create their own account.

## Option 1: CLI (if supported)

From project root:

```powershell
insforge db import db/migrations/2026-03-15-ensure-accounts-bootstrap-rls.sql
```

If your CLI does not have `db import`, use Option 2.

## Option 2: InsForge Dashboard SQL Editor

1. Open your project: https://4bta783b.us-east.insforge.app (or your OSS Host from `insforge current`).
2. Go to **Database** (or **SQL** / **Query**).
3. Open `db/migrations/2026-03-15-ensure-accounts-bootstrap-rls.sql` in your editor, copy its **entire contents** (including all `CREATE` and `DROP POLICY` statements).
4. Paste into the SQL editor and run.

After it runs successfully, reload the app and sign in again; account creation should succeed.

## Function deploy (ensure-account)

If `insforge functions deploy ensure-account` returns `INVALID_INPUT`, deploy the function from the InsForge dashboard (Functions → create/upload) or try a different CLI version. The source is in `insforge/functions/ensure-account/index.ts`. You must set the secret `INSFORGE_SERVICE_ROLE_KEY` (or `INSFORGE_SERVICE_KEY`) for the function to work.
