-- admin_platform_health: returns server-side metrics for Platform Health dashboard
-- Used with client-side health probes for live API uptime and response times.
CREATE OR REPLACE FUNCTION admin_platform_health()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  result JSONB;
  failed_24h INT;
  logins_24h INT;
  total_24h INT;
BEGIN
  IF NOT current_user_is_platform_admin() THEN
    RAISE EXCEPTION 'admin_only' USING ERRCODE = '28000';
  END IF;

  SELECT
    COALESCE((SELECT COUNT(*)::INT FROM audit_logs WHERE action = 'user.login_failed' AND created_at >= now() - interval '24 hours'), 0),
    COALESCE((SELECT COUNT(*)::INT FROM audit_logs WHERE action = 'user.login' AND created_at >= now() - interval '24 hours'), 0),
    COALESCE((SELECT COUNT(*)::INT FROM audit_logs WHERE created_at >= now() - interval '24 hours'), 0)
  INTO failed_24h, logins_24h, total_24h;

  SELECT jsonb_build_object(
    'failedLogins24h', failed_24h,
    'successfulLogins24h', logins_24h,
    'totalActions24h', total_24h,
    'loginErrorRatePct', CASE
      WHEN (failed_24h + logins_24h) > 0
      THEN ROUND((failed_24h::NUMERIC / NULLIF(failed_24h + logins_24h, 0)) * 100, 2)
      ELSE 0
    END
  )
  INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION admin_platform_health() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_platform_health() TO admin_role;
