# Phase F: Activation and Polish

Implementation notes and backend setup for Phase F features.

## 1. Document Expiry Alerts

### Schema Migration

Apply the documents expiry column:

```bash
insforge db query "ALTER TABLE documents ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;"
```

### Edge Function Deploy

```bash
insforge functions deploy check-document-expiry
```

### Schedule (Daily Check)

Create a daily schedule to run the document expiry check. Replace `YOUR_PROJECT` and `region` with your InsForge project values:

```bash
insforge schedules create \
  --name "Document Expiry Check" \
  --cron "0 9 * * *" \
  --url "https://YOUR_PROJECT.region.insforge.app/functions/check-document-expiry" \
  --method POST \
  --headers '{"Authorization": "Bearer ${{secrets.CRON_SECRET}}"}'
```

Ensure `CRON_SECRET` is set (or use `INSFORGE_SERVICE_ROLE_KEY` as a secret) and the function has access to it. The function also accepts `INSFORGE_SERVICE_ROLE_KEY` from environment for bypassing RLS.

### Secrets

Add if using cron Bearer token:

```bash
insforge secrets add CRON_SECRET "your-secure-token"
```

## 2. Progress Saving and Onboarding Recovery

### Schema Migration

```bash
insforge db query "ALTER TABLE onboarding_progress ADD COLUMN IF NOT EXISTS step_data JSONB;"
```

## 3. Onboarding Analytics

### Schema Migration

Run the Phase F section of `db/schema.sql` for `onboarding_events` and `get_onboarding_funnel` RPC:

```bash
insforge db query "$(grep -A 30 'Phase F: Onboarding analytics' db/schema.sql)"
```

## 4. Welcome Email Series

### Schema Migration

```bash
insforge db query "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;"
```

### Secrets

```bash
insforge secrets add SENDGRID_API_KEY "your-sendgrid-api-key"
```

### Deploy Edge Function

```bash
insforge functions deploy send-welcome-email
```

### Schedule

```bash
insforge schedules create \
  --name "Welcome Emails" \
  --cron "*/15 * * * *" \
  --url "https://YOUR_PROJECT.region.insforge.app/functions/send-welcome-email" \
  --method POST
```

The function sends a welcome email to users who completed onboarding but have not yet received one (`welcome_email_sent_at` is null).

## 5. MFA for Admins

Implemented. Requires InsForge/Supabase auth with MFA support (`auth.mfa.enroll`, `auth.mfa.challenge`, `auth.mfa.verify`, `auth.mfa.listFactors`). Admins are prompted to set up TOTP on first admin visit; subsequent visits require verification (session valid for 12 hours). Clear MFA verification on sign out.
