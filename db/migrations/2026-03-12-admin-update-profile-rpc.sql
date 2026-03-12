-- Admin RPC to update user profile (display_name, phone_number)
-- Only platform admins can update any user's profile

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_role') THEN
    CREATE ROLE admin_role;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION admin_update_profile(
  p_user_id UUID,
  p_display_name TEXT DEFAULT NULL,
  p_phone_number TEXT DEFAULT NULL
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

  UPDATE profiles SET
    display_name = COALESCE(p_display_name, display_name),
    phone_number = COALESCE(p_phone_number, phone_number),
    updated_at = now()
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user: %', p_user_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION admin_update_profile(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_update_profile(UUID, TEXT, TEXT) TO admin_role;
GRANT EXECUTE ON FUNCTION admin_update_profile(UUID, TEXT, TEXT) TO authenticated;
