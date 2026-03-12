-- Allow authenticated users to insert audit log entries
-- Admins can read via admin tools; service role has full access

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'authenticated_insert_audit_logs') THEN
    CREATE POLICY "authenticated_insert_audit_logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'authenticated_select_audit_logs') THEN
    CREATE POLICY "authenticated_select_audit_logs" ON audit_logs FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
