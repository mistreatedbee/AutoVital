-- Fix auth_users_view (compatible with InsForge auth.users schema)
-- InsForge auth.users may not have email_confirmed_at/confirmed_at; use NULL placeholder

CREATE OR REPLACE VIEW auth_users_view AS
SELECT
  u.id,
  u.email,
  COALESCE(p.display_name, u.email) AS full_name,
  u.created_at,
  a_def.name AS default_account_name,
  NULL::timestamptz AS email_confirmed_at,
  (SELECT c.granted FROM consents c WHERE c.user_id = u.id AND c.consent_type = 'marketing' ORDER BY c.created_at DESC LIMIT 1) AS marketing_consent,
  (op.completed_at IS NOT NULL) AS onboarding_completed,
  (SELECT COUNT(*)::INT FROM vehicles v JOIN accounts a ON v.account_id = a.id WHERE a.owner_user_id = u.id AND v.archived_at IS NULL) AS vehicle_count,
  (SELECT pl.code FROM subscriptions sub JOIN plans pl ON pl.id = sub.plan_id WHERE sub.account_id = a_def.id AND sub.status IN ('active','trialing') ORDER BY sub.current_period_end DESC NULLS LAST LIMIT 1) AS plan_code,
  COALESCE(p.account_status, 'active') AS account_status,
  p.flagged_at,
  p.flagged_reason
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
LEFT JOIN accounts a_def ON a_def.id = p.default_account_id
LEFT JOIN onboarding_progress op ON op.user_id = u.id;
