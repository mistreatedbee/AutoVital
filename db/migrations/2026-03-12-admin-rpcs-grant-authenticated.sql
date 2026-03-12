-- Grant admin RPCs to authenticated so platform admins can call them via SDK.
-- The RPCs enforce platform-admin checks internally via current_user_is_platform_admin().
-- Without this, JWT connections (role=authenticated) get 403 when calling admin_role-only functions.

GRANT EXECUTE ON FUNCTION admin_dashboard_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_platform_health() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_revenue_by_month(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_signups_by_day(INT) TO authenticated;
