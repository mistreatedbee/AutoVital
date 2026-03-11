# Phase D: POPIA, Security, and Consent

This document describes the Phase D implementation and backend requirements.

## Implemented Features

### Consent Logging (POPIA)

- **`consents` table**: Stores terms, privacy, and marketing consent with timestamps, `user_agent`, and optional `ip_address`
- **On signup**: Consents recorded after account bootstrap via `recordConsents()` in `src/services/consents.ts`
- **Settings**: Users can view consent history and toggle marketing in Profile & Settings → Privacy & Consent

### Security (OWASP-Aligned)

- **Password strength meter**: Already in place (`src/lib/passwordStrength.ts`); no arbitrary forced changes
- **Email verification gate**: `RequireEmailVerified` route redirects unverified users to `/verify-email`
- **Reauth for high-risk changes**: Change Email and Change Password require current password verification via `ReauthModal`
- **Session security**: See backend requirements below

---

## Backend Requirements

### Rate Limiting / Anti-Bot

Rate limiting must be configured on the **InsForge backend** (not in this frontend repo). Configure via:

1. **InsForge project dashboard / Admin API** (if available) for auth endpoint limits
2. **Edge functions** that proxy signup/login and enforce limits

**Recommended limits (OWASP-aligned):**

| Endpoint     | Limit                         |
|-------------|-------------------------------|
| Signup      | 5 attempts per 15 min per IP |
| Login       | 10 attempts per 15 min per IP|
| Password reset | 5 per 15 min per IP       |

**Example edge function approach:**

1. Create `signup-with-rate-limit` function that checks IP/count before delegating to auth
2. Frontend calls the function instead of direct auth signup when rate limiting is needed
3. Or configure at API gateway / InsForge project level if supported

### Session Security Best Practices

Configure the following on the InsForge project:

- **Secure, HTTP-only cookies** for refresh/session storage (if using cookie-based auth)
- **Short-lived access tokens** with refresh token rotation
- **Session invalidation** on password change (InsForge may handle this; verify)
- **CSRF protection** for state-changing requests when using cookies

### Change Password / Change Email

The frontend calls these InsForge edge functions:

- **`change-password`** (POST): `{ currentPassword, newPassword }`
- **`change-email`** (POST): `{ currentPassword, newEmail }`

**Deploy these functions** to enable in-session password/email changes. Each function should:

1. Verify the request is authenticated
2. Verify `currentPassword` via sign-in or internal API
3. Update the user record and invalidate sessions if needed (e.g., on email change)

Until deployed, users can use **Forgot password** for password reset.

---

## Schema Migration

Apply the consent table and RLS from `db/schema.sql`:

```bash
insforge db query "$(cat db/schema.sql | grep -A 50 'Phase D: Consent')"
```

Or run the full schema if not yet applied.
