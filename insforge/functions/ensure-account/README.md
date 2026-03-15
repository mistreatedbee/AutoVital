# ensure-account

Creates an account (and profile/membership) for the authenticated user when missing. Uses the service key so it works even when client requests get 401/403 or RLS blocks client-side inserts.

**Deploy** (run from project root, where `insforge/functions` lives):

```bash
insforge functions deploy ensure-account
```

**Secrets:** Set `INSFORGE_SERVICE_ROLE_KEY` or `INSFORGE_SERVICE_KEY` in your InsForge project so the function can bypass RLS.

**Invoke:** `POST` to `{VITE_INSFORGE_URL}/functions/ensure-account` with `Authorization: Bearer <user access token>`.
