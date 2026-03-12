-- Admin RPCs for Revenue and Signups charts
-- Revenue: sum of plan prices for active/trialing subscriptions per month
-- Signups: count of auth.users created per day (last 7 days)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_role') THEN
    CREATE ROLE admin_role;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION admin_revenue_by_month(p_months INT DEFAULT 6)
RETURNS TABLE (month_key TEXT, revenue_cents BIGINT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT current_user_is_platform_admin() THEN
    RAISE EXCEPTION 'admin_only' USING ERRCODE = '28000';
  END IF;

  RETURN QUERY
  WITH months AS (
    SELECT
      (date_trunc('month', now()) - (n || ' months')::interval)::date AS month_start,
      to_char((date_trunc('month', now()) - (n || ' months')::interval), 'YYYY-MM') AS m
    FROM generate_series(0, p_months - 1) AS n
  ),
  mrr AS (
    SELECT
      to_char(m.month_start, 'YYYY-MM') AS month_key,
      COALESCE(SUM(p.price_monthly_cents), 0)::BIGINT AS revenue_cents
    FROM months m
    JOIN subscriptions s ON s.status IN ('active', 'trialing')
      AND s.created_at <= (m.month_start + interval '1 month - 1 day')::timestamp
      AND (s.current_period_end IS NULL OR s.current_period_end >= m.month_start)
    JOIN plans p ON p.id = s.plan_id
    GROUP BY m.month_start
  )
  SELECT
    months.m AS month_key,
    COALESCE(mrr.revenue_cents, 0)::BIGINT AS revenue_cents
  FROM months
  LEFT JOIN mrr ON mrr.month_key = months.m
  ORDER BY months.m;
END;
$$;

REVOKE ALL ON FUNCTION admin_revenue_by_month(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_revenue_by_month(INT) TO admin_role;
GRANT EXECUTE ON FUNCTION admin_revenue_by_month(INT) TO authenticated;

-- Signups by day (last 7 days) - requires SELECT on auth.users
CREATE OR REPLACE FUNCTION admin_signups_by_day(p_days INT DEFAULT 7)
RETURNS TABLE (day_key DATE, signup_count BIGINT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT current_user_is_platform_admin() THEN
    RAISE EXCEPTION 'admin_only' USING ERRCODE = '28000';
  END IF;

  RETURN QUERY
  SELECT
    u.created_at::DATE AS day_key,
    COUNT(*)::BIGINT AS signup_count
  FROM auth.users u
  WHERE u.created_at >= (CURRENT_DATE - (p_days || ' days')::interval)
  GROUP BY u.created_at::DATE
  ORDER BY day_key;
END;
$$;

REVOKE ALL ON FUNCTION admin_signups_by_day(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_signups_by_day(INT) TO admin_role;
GRANT EXECUTE ON FUNCTION admin_signups_by_day(INT) TO authenticated;
