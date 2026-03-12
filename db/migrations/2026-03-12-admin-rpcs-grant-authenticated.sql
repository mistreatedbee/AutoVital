-- Grant admin RPCs to authenticated (for direct SDK calls) and project_admin (for service-key calls).
-- The RPCs enforce platform-admin checks internally via current_user_is_platform_admin().
-- project_admin is used when edge functions call with INSFORGE_SERVICE_ROLE_KEY.
-- Note: project_admin may not exist in all InsForge setups; ignore errors if it fails.

GRANT EXECUTE ON FUNCTION admin_dashboard_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_platform_health() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_revenue_by_month(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_signups_by_day(INT) TO authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'project_admin') THEN
    GRANT EXECUTE ON FUNCTION admin_dashboard_metrics() TO project_admin;
    GRANT EXECUTE ON FUNCTION admin_platform_health() TO project_admin;
    GRANT EXECUTE ON FUNCTION admin_revenue_by_month(INT) TO project_admin;
    GRANT EXECUTE ON FUNCTION admin_signups_by_day(INT) TO project_admin;
  END IF;
END $$;
