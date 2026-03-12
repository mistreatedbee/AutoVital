-- Allow project_admin role (service key) to bypass platform-admin check.
-- Edge functions using INSFORGE_SERVICE_ROLE_KEY connect as project_admin.
-- They verify the caller is a platform admin before using the service key.
CREATE OR REPLACE FUNCTION current_user_is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT current_user = 'project_admin' OR is_platform_admin(auth.uid());
$$;
