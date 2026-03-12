-- admin_dashboard_metrics runs as INVOKER but reads auth_users_view (granted only to admin_role).
-- Authenticated platform admins lack SELECT on auth_users_view. Change to SECURITY DEFINER
-- so the function runs with owner privileges while still enforcing platform admin check.
CREATE OR REPLACE FUNCTION admin_dashboard_metrics()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  IF NOT current_user_is_platform_admin() THEN
    RAISE EXCEPTION 'admin_only' USING ERRCODE = '28000';
  END IF;

  SELECT jsonb_build_object(
    'newRegistrationsThisWeek', (SELECT COUNT(*)::INT FROM auth_users_view uv WHERE uv.created_at >= date_trunc('week', now())),
    'verifiedCount', (SELECT COUNT(*)::INT FROM auth_users_view uv WHERE uv.email_confirmed_at IS NOT NULL),
    'unverifiedCount', (SELECT COUNT(*)::INT FROM auth_users_view uv WHERE uv.email_confirmed_at IS NULL),
    'totalUsers', (SELECT COUNT(*)::INT FROM auth_users_view),
    'onboardingCompletedCount', (SELECT COUNT(*)::INT FROM auth_users_view uv WHERE uv.onboarding_completed = true),
    'vehiclesPerUser', (SELECT COALESCE(AVG(uv.vehicle_count), 0)::NUMERIC(10,2) FROM auth_users_view uv),
    'upcomingReminderCount', (SELECT COUNT(*)::INT FROM alerts a WHERE a.status = 'pending' AND a.kind IN ('maintenance_due', 'document_expiring', 'subscription_renewal')),
    'overdueReminderCount', (SELECT COUNT(*)::INT FROM alerts a WHERE a.status = 'pending' AND a.kind = 'maintenance_overdue'),
    'totalVehicles', (SELECT COUNT(*)::INT FROM vehicles v WHERE v.archived_at IS NULL)
  )
  INTO result;

  RETURN result;
END;
$$;
