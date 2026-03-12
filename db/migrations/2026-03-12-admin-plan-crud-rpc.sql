-- Admin RPCs for creating and updating plans
-- Only platform admins can execute

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_role') THEN
    CREATE ROLE admin_role;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION admin_create_plan(
  p_code TEXT,
  p_name TEXT,
  p_price_monthly_cents INTEGER,
  p_vehicle_limit INTEGER DEFAULT NULL,
  p_features JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF NOT current_user_is_platform_admin() THEN
    RAISE EXCEPTION 'admin_only' USING ERRCODE = '28000';
  END IF;

  INSERT INTO plans (code, name, price_monthly_cents, vehicle_limit, features)
  VALUES (p_code, p_name, p_price_monthly_cents, p_vehicle_limit, COALESCE(p_features, '{}'::jsonb))
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION admin_update_plan(
  p_id UUID,
  p_name TEXT DEFAULT NULL,
  p_price_monthly_cents INTEGER DEFAULT NULL,
  p_vehicle_limit INTEGER DEFAULT NULL,
  p_features JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT current_user_is_platform_admin() THEN
    RAISE EXCEPTION 'admin_only' USING ERRCODE = '28000';
  END IF;

  UPDATE plans SET
    name = COALESCE(p_name, name),
    price_monthly_cents = COALESCE(p_price_monthly_cents, price_monthly_cents),
    vehicle_limit = COALESCE(p_vehicle_limit, vehicle_limit),
    features = COALESCE(p_features, features)
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan not found: %', p_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION admin_create_plan(TEXT, TEXT, INTEGER, INTEGER, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_create_plan(TEXT, TEXT, INTEGER, INTEGER, JSONB) TO admin_role;
GRANT EXECUTE ON FUNCTION admin_create_plan(TEXT, TEXT, INTEGER, INTEGER, JSONB) TO authenticated;

REVOKE ALL ON FUNCTION admin_update_plan(UUID, TEXT, INTEGER, INTEGER, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_update_plan(UUID, TEXT, INTEGER, INTEGER, JSONB) TO admin_role;
GRANT EXECUTE ON FUNCTION admin_update_plan(UUID, TEXT, INTEGER, INTEGER, JSONB) TO authenticated;
