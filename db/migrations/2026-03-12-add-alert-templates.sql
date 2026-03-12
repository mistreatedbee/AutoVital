-- Alert templates for email and in-app notifications
-- Used by AlertsControl admin page

CREATE TABLE IF NOT EXISTS alert_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_text TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alert_in_app_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Warning' CHECK (type IN ('Warning', 'Alert', 'Info')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: authenticated users can read; only platform admins can write (via service role or admin RPC)
ALTER TABLE alert_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_in_app_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'alert_templates' AND policyname = 'authenticated_read_alert_templates') THEN
    CREATE POLICY "authenticated_read_alert_templates" ON alert_templates FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'alert_templates' AND policyname = 'authenticated_all_alert_templates') THEN
    CREATE POLICY "authenticated_all_alert_templates" ON alert_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'alert_in_app_templates' AND policyname = 'authenticated_read_alert_in_app_templates') THEN
    CREATE POLICY "authenticated_read_alert_in_app_templates" ON alert_in_app_templates FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'alert_in_app_templates' AND policyname = 'authenticated_all_alert_in_app_templates') THEN
    CREATE POLICY "authenticated_all_alert_in_app_templates" ON alert_in_app_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Seed default email templates (only if not already present)
INSERT INTO alert_templates (name, subject, status)
SELECT 'Service Due Reminder', 'Your {{vehicle_name}} needs service soon', 'active'
WHERE NOT EXISTS (SELECT 1 FROM alert_templates WHERE name = 'Service Due Reminder');

INSERT INTO alert_templates (name, subject, status)
SELECT 'Health Score Drop Alert', 'Alert: {{vehicle_name}} health score decreased', 'active'
WHERE NOT EXISTS (SELECT 1 FROM alert_templates WHERE name = 'Health Score Drop Alert');

INSERT INTO alert_templates (name, subject, status)
SELECT 'Welcome Email', 'Welcome to AutoVital!', 'active'
WHERE NOT EXISTS (SELECT 1 FROM alert_templates WHERE name = 'Welcome Email');

INSERT INTO alert_templates (name, subject, status)
SELECT 'Subscription Renewal', 'Your AutoVital subscription is renewing', 'draft'
WHERE NOT EXISTS (SELECT 1 FROM alert_templates WHERE name = 'Subscription Renewal');

-- Seed default in-app templates (only if not already present)
INSERT INTO alert_in_app_templates (name, message, type)
SELECT 'Upcoming Service', 'Service due for {{vehicle_name}} in {{days}} days.', 'Warning'
WHERE NOT EXISTS (SELECT 1 FROM alert_in_app_templates WHERE name = 'Upcoming Service');

INSERT INTO alert_in_app_templates (name, message, type)
SELECT 'Document Expiring', 'Your {{doc_type}} is expiring soon.', 'Alert'
WHERE NOT EXISTS (SELECT 1 FROM alert_in_app_templates WHERE name = 'Document Expiring');
