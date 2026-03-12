# Client Test Account

Use this account to test the client dashboard and all client-facing features.

## Creating the Client Test User

### 1. Sign Up

1. Go to `/signup`
2. Use these details:
   - **Email:** `client@autovital.co.za`
   - **Full name:** Thando Nkosi (or any SA-style name)
   - **Phone:** +27 73 153 1188 (optional)
   - **Password:** Choose a secure password (e.g. `ClientTest123!`)

3. Complete email verification if required
4. Complete onboarding (add a vehicle, set preferences)

### 2. Assign Starter Plan (Optional)

If you want the client to have an active subscription for testing billing:

1. Ensure `seed-plans.sql` has been run
2. Run the subscription seed:

```sql
INSERT INTO subscriptions (account_id, plan_id, status)
SELECT
  p.default_account_id,
  pl.id,
  'trialing'
FROM auth.users u
JOIN profiles p ON p.user_id = u.id
CROSS JOIN plans pl
WHERE u.email = 'client@autovital.co.za'
  AND pl.code = 'starter'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.account_id = p.default_account_id
      AND s.plan_id = pl.id
      AND s.status IN ('active', 'trialing')
  )
LIMIT 1;
```

Or use InsForge CLI:

```bash
insforge db query "INSERT INTO subscriptions (account_id, plan_id, status)
SELECT p.default_account_id, pl.id, 'trialing'
FROM auth.users u
JOIN profiles p ON p.user_id = u.id
CROSS JOIN plans pl
WHERE u.email = 'client@autovital.co.za' AND pl.code = 'starter'
LIMIT 1"
```

### 3. Login

- **URL:** `/login`
- **Email:** `client@autovital.co.za`
- **Password:** (the password you set at signup)

After login, you will be redirected to `/dashboard`.

## Test Credentials Summary

| Field    | Value                    |
|----------|--------------------------|
| Email    | client@autovital.co.za   |
| Password | (set at signup)          |
| Plan     | Starter (trialing)       |

**Note:** Passwords are never stored in seed files. You must set the password when signing up.
