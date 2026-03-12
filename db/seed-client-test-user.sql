-- Seed a client test user with Starter plan subscription
-- Run AFTER: 1) schema.sql, 2) seed-plans.sql, 3) User has signed up at /signup
--
-- Steps:
-- 1. Sign up at /signup with: client@autovital.co.za (or your preferred email)
-- 2. Complete email verification if required
-- 3. Complete onboarding (or skip if possible)
-- 4. Get the user_id and account_id:
--    insforge db query "SELECT u.id as user_id, p.default_account_id as account_id FROM auth.users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.email = 'client@autovital.co.za'"
-- 5. Run this script with the actual UUIDs, or use the query below:
--
-- Example (replace with actual UUIDs from step 4):
/*
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
*/

-- Client test user credentials (set at signup):
-- Email: client@autovital.co.za
-- Password: (choose a secure password at signup - e.g. ClientTest123!)
