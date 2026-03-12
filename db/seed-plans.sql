-- Seed pricing plans for AutoVital (ZAR)
-- Run after schema.sql. Uses ON CONFLICT for idempotency (plans.code is UNIQUE).

INSERT INTO plans (code, name, price_monthly_cents, vehicle_limit, features) VALUES
  (
    'starter',
    'Starter',
    0,
    1,
    '{"basic_maintenance": true, "standard_reminders": true, "email_support": true}'::jsonb
  ),
  (
    'pro',
    'Pro',
    9900,
    5,
    '{"advanced_health": true, "expense_tracking": true, "document_storage_gb": 10, "priority_support": true}'::jsonb
  ),
  (
    'fleet',
    'Fleet',
    39900,
    NULL,
    '{"fleet_dashboard": true, "custom_schedules": true, "data_export": true, "phone_support": true}'::jsonb
  )
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly_cents = EXCLUDED.price_monthly_cents,
  vehicle_limit = EXCLUDED.vehicle_limit,
  features = EXCLUDED.features;
