# Admin Account Setup

This document explains how to create and configure **System Admin** and **Company Admin** accounts for AutoVital.

## Roles

| Role | Access | Configuration |
|------|--------|---------------|
| **System Admin** | Full platform access; all companies, all admin features | `VITE_ADMIN_EMAILS` or `platform_admins` table |
| **Company Admin** | Company-scoped admin access for specific accounts | `platform_admins` table |

## Security

- **Passwords are never seeded or stored** in source code or SQL. InsForge Auth is the source of truth.
- **VITE_INSFORGE_ANON_KEY** is safe in frontend code (it is a public anon key).
- **INSFORGE_SERVICE_ROLE_KEY** must stay server-side only (edge functions). Never expose it in frontend or commit it to the repo.
- Admin routes require MFA after first login.

---

## Creating a System Admin

1. **Add the user's email to `VITE_ADMIN_EMAILS`** in your `.env`:
   ```
   VITE_ADMIN_EMAILS=system-admin@yourcompany.com,another-admin@yourcompany.com
   ```

2. **Have the user sign up** at `/signup` with that email. They will set their own password during signup.

3. After signup and email verification (if required), the user can log in and access `/admin/*`. They will be prompted to set up MFA on first admin access.

**Alternative (database-backed):** You can also add System Admins via the `platform_admins` table. See [Seeding Company Admins](#seeding-company-admins) for the SQL pattern. Use `role = 'system_admin'` and `account_id = NULL`.

---

## Creating a Company Admin

1. **The user must already exist** in `auth.users` (they have signed up at `/signup`).

2. **Identify the account** they should administer. Get the account UUID:
   ```bash
   insforge db query "SELECT id, name FROM accounts"
   ```

3. **Insert into `platform_admins`**:
   ```sql
   INSERT INTO platform_admins (user_id, role, account_id)
   SELECT u.id, 'company_admin', 'YOUR_ACCOUNT_UUID'::uuid
   FROM auth.users u
   WHERE u.email = 'company-admin@example.com';
   ```

   Or use the seed script template in [db/seed-platform-admins.sql](../db/seed-platform-admins.sql).

---

## Obtaining Backend Configuration

### URL and Anon Key

- **After `insforge link`:** Run `insforge metadata --json` to get your project's base URL and anon key.
- **From `.insforge/project.json`:** The `oss_host` field is your backend URL. The anon key may be in project metadata.
- **From InsForge dashboard:** Use the project settings to copy the URL and anon/public key.

### Edge Function Secrets

Edge functions need these secrets (set via `insforge secrets add`). **Without them, blog-posts-public and admin-dashboard-data return 502.**

| Secret | Description |
|--------|-------------|
| `INSFORGE_URL` | Same as `VITE_INSFORGE_URL` (e.g. `https://4bta783b.us-east.insforge.app`) |
| `INSFORGE_ANON_KEY` | Same as `VITE_INSFORGE_ANON_KEY` |
| `INSFORGE_SERVICE_ROLE_KEY` | Service role key; **never** expose in frontend. Get from InsForge dashboard or `insforge metadata --json` |
| `SENDGRID_API_KEY` | For send-welcome-email (optional) |

### Fix 502 / 403 on Production

Run these in order:

```bash
# 1. Add all three required secrets (use your actual values)
insforge secrets add INSFORGE_URL <your-VITE_INSFORGE_URL-value>
insforge secrets add INSFORGE_ANON_KEY <your-VITE_INSFORGE_ANON_KEY-value>
insforge secrets add INSFORGE_SERVICE_ROLE_KEY <your-service-role-key>

# 2. Apply migrations (fixes 403 on admin RPCs)
insforge db query --file db/migrations/2026-03-12-admin-allow-project-admin.sql
insforge db query --file db/migrations/2026-03-12-admin-rpcs-grant-authenticated.sql
insforge db query --file db/migrations/2026-03-12-admin-dashboard-metrics-security-definer.sql

# 3. Deploy edge functions
insforge functions deploy blog-posts-public
insforge functions deploy admin-dashboard-data
```

---

## Where Credentials Are Configured

| Credential | Where | Notes |
|------------|-------|-------|
| Backend URL | `.env` as `VITE_INSFORGE_URL`; InsForge secrets as `INSFORGE_URL` | Same value for frontend and edge functions |
| Anon key | `.env` as `VITE_INSFORGE_ANON_KEY`; InsForge secrets as `INSFORGE_ANON_KEY` | Safe to expose in frontend |
| System Admin emails | `.env` as `VITE_ADMIN_EMAILS` | Comma-separated list |
| Company Admins | `platform_admins` table | Insert via SQL or future admin UI |
| User passwords | InsForge Auth (`auth.users`) | Set by user at signup; never stored in app |

---

## Limitations

- **RLS on `platform_admins`:** All authenticated users can read `platform_admins` (needed for AdminRoute checks). Write operations should go through a protected RPC (e.g. `add_platform_admin`) that verifies the caller is a System Admin. A future phase can add this.
- **Company Admin scoping:** Initial implementation grants `/admin/*` access to Company Admins. Restricting admin UI and API responses to only their `account_id` is a future enhancement.
- **First System Admin:** Must be bootstrapped via `VITE_ADMIN_EMAILS` because the database may be empty at first deployment.
