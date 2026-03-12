-- Fix: Create admin_role if missing (required for admin RPCs and views)
-- Run this if you see "role admin_role does not exist" when applying schema.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_role') THEN
    CREATE ROLE admin_role;
  END IF;
END $$;
