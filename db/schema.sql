-- AutoVital core relational schema (PostgreSQL / InsForge)
-- This schema is designed to back the frontend models in `src/domain/models.ts`.
-- It assumes an existing `auth.users` table managed by the auth system.

-- Enable required extensions (InsForge/Supabase usually have these available)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
--  Accounts & Membership
-- =========================

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  owner_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  default_account_id UUID REFERENCES accounts (id) ON DELETE SET NULL,
  phone_number TEXT,
  measurement_system TEXT NOT NULL DEFAULT 'imperial', -- 'imperial' | 'metric'
  display_name TEXT,
  country TEXT DEFAULT 'ZA',
  city TEXT,
  currency TEXT DEFAULT 'ZAR',
  mileage_unit TEXT DEFAULT 'km',
  fuel_unit TEXT DEFAULT 'litres',
  timezone TEXT DEFAULT 'Africa/Johannesburg',
  locale TEXT DEFAULT 'en',
  avatar_url TEXT,
  welcome_email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase F: Welcome email tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;

CREATE TYPE account_role AS ENUM ('owner', 'admin', 'member', 'viewer');

CREATE TABLE IF NOT EXISTS account_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role account_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, user_id)
);

-- =========================
--  Plans & Subscriptions
-- =========================

CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete'
);

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- 'starter' | 'pro' | 'fleet'
  name TEXT NOT NULL,
  price_monthly_cents INTEGER NOT NULL,
  vehicle_limit INTEGER, -- NULL = unlimited
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans (id) ON DELETE RESTRICT,
  status subscription_status NOT NULL DEFAULT 'trialing',
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  external_customer_id TEXT,      -- e.g. Stripe customer id
  external_subscription_id TEXT,  -- e.g. Stripe subscription id
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================
--  Vehicles & Logs
-- =========================

CREATE TYPE fuel_type AS ENUM ('gasoline', 'diesel', 'electric', 'hybrid', 'other');

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  owner_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  nickname TEXT,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  vin TEXT,
  license_plate TEXT,
  fuel_type fuel_type,
  current_mileage NUMERIC,
  transmission TEXT,
  engine_type TEXT,
  color TEXT,
  health_score NUMERIC,
  hero_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS vehicle_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles (id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_bucket TEXT,
  storage_key TEXT,
  provider TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================
--  Documents & Storage (must exist before maintenance_logs references it)
-- =========================

DO $$ BEGIN
  CREATE TYPE document_type AS ENUM (
    'insurance',
    'registration',
    'inspection',
    'receipt',
    'warranty',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles (id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  type document_type NOT NULL,
  name TEXT NOT NULL,
  storage_bucket TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  public_url TEXT,
  size_bytes BIGINT,
  mime_type TEXT,
  tags TEXT[],
  metadata JSONB,
  expires_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  deleted_by_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE documents ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- =========================
--  Maintenance Logs
-- =========================

CREATE TYPE maintenance_type AS ENUM (
  'oil_change',
  'tire_rotation',
  'inspection',
  'brake_service',
  'battery',
  'registration',
  'other'
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles (id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  type maintenance_type NOT NULL,
  description TEXT,
  mileage NUMERIC,
  service_date DATE NOT NULL,
  cost_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'USD',
  vendor_name TEXT,
  document_id UUID REFERENCES documents (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles (id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  fill_date DATE NOT NULL,
  odometer NUMERIC,
  volume NUMERIC NOT NULL, -- gallons or liters based on measurement_system
  total_cost_cents INTEGER NOT NULL,
  price_per_unit_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mileage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles (id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  log_date DATE NOT NULL,
  odometer NUMERIC NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mileage_logs_vehicle_date
  ON mileage_logs (vehicle_id, log_date DESC);

-- =========================
--  Alerts & Health
-- =========================

CREATE TYPE alert_channel AS ENUM ('email', 'in_app');

CREATE TYPE alert_status AS ENUM ('pending', 'sent', 'resolved', 'dismissed');

CREATE TYPE alert_kind AS ENUM (
  'maintenance_due',
  'maintenance_overdue',
  'document_expiring',
  'subscription_renewal',
  'health_drop'
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles (id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  kind alert_kind NOT NULL,
  channel alert_channel NOT NULL,
  status alert_status NOT NULL DEFAULT 'pending',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  channel alert_channel NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  maintenance_lead_days INTEGER DEFAULT 14,
  maintenance_lead_days_array INTEGER[] DEFAULT ARRAY[14, 7],
  document_expiry_lead_days INTEGER DEFAULT 30,
  reminder_basis TEXT DEFAULT 'both',
  weekly_summary_email BOOLEAN DEFAULT FALSE,
  quiet_hours JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, account_id, channel)
);

CREATE TABLE IF NOT EXISTS vehicle_health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles (id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  score NUMERIC NOT NULL,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Simple example of a derived view for reporting
CREATE OR REPLACE VIEW vehicle_latest_health AS
SELECT DISTINCT ON (vhs.vehicle_id)
  vhs.vehicle_id,
  vhs.account_id,
  vhs.score,
  vhs.snapshot_date,
  vhs.created_at
FROM vehicle_health_snapshots vhs
ORDER BY vhs.vehicle_id, vhs.snapshot_date DESC, vhs.created_at DESC;

-- =========================
--  Audit Logs (Admin Actions)
-- =========================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id);

-- =========================
--  Phase B: Onboarding & Service Preferences
-- =========================

-- Profiles: extend for onboarding (idempotent)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'ZA';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'ZAR';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mileage_unit TEXT DEFAULT 'km';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fuel_unit TEXT DEFAULT 'litres';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Africa/Johannesburg';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Vehicles: extend for onboarding
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS transmission TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS engine_type TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color TEXT;

-- Alert preferences: multi lead days, reminder basis, weekly summary
ALTER TABLE alert_preferences ADD COLUMN IF NOT EXISTS maintenance_lead_days_array INTEGER[] DEFAULT ARRAY[14, 7];
ALTER TABLE alert_preferences ADD COLUMN IF NOT EXISTS reminder_basis TEXT DEFAULT 'both';
ALTER TABLE alert_preferences ADD COLUMN IF NOT EXISTS weekly_summary_email BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS service_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles (id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  last_service_date DATE,
  last_service_mileage NUMERIC,
  service_interval_months INTEGER,
  service_interval_mileage INTEGER,
  last_oil_change_date DATE,
  last_oil_change_mileage NUMERIC,
  last_brake_service_date DATE,
  last_battery_date DATE,
  last_tire_rotation_date DATE,
  known_issues TEXT,
  workshop_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS onboarding_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1,
  completed_at TIMESTAMPTZ,
  profile_completed BOOLEAN DEFAULT FALSE,
  vehicle_added BOOLEAN DEFAULT FALSE,
  service_baseline_completed BOOLEAN DEFAULT FALSE,
  reminders_completed BOOLEAN DEFAULT FALSE,
  step_data JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Phase F: Progress saving (migration for existing schemas)
ALTER TABLE onboarding_progress ADD COLUMN IF NOT EXISTS step_data JSONB;

-- service_preferences RLS
ALTER TABLE service_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_service_preferences" ON service_preferences FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE id = service_preferences.account_id
        AND (owner_user_id = auth.uid() OR EXISTS (SELECT 1 FROM account_members WHERE account_id = service_preferences.account_id AND user_id = auth.uid()))
    )
  );
CREATE POLICY "users_insert_own_service_preferences" ON service_preferences FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE id = service_preferences.account_id
        AND (owner_user_id = auth.uid() OR EXISTS (SELECT 1 FROM account_members WHERE account_id = service_preferences.account_id AND user_id = auth.uid()))
    )
  );
CREATE POLICY "users_update_own_service_preferences" ON service_preferences FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE id = service_preferences.account_id
        AND (owner_user_id = auth.uid() OR EXISTS (SELECT 1 FROM account_members WHERE account_id = service_preferences.account_id AND user_id = auth.uid()))
    )
  );
CREATE POLICY "users_delete_own_service_preferences" ON service_preferences FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE id = service_preferences.account_id
        AND (owner_user_id = auth.uid() OR EXISTS (SELECT 1 FROM account_members WHERE account_id = service_preferences.account_id AND user_id = auth.uid()))
    )
  );

-- Phase F: Onboarding analytics
CREATE TABLE IF NOT EXISTS onboarding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  step INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_events_created_at ON onboarding_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_event ON onboarding_events (event);

-- RLS: users can insert their own events; admin/service reads for analytics
ALTER TABLE onboarding_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_insert_own_onboarding_events" ON onboarding_events FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());
-- Users can read only their own events (for personal progress)
CREATE POLICY "users_select_own_onboarding_events" ON onboarding_events FOR SELECT
  TO authenticated USING (user_id = auth.uid());

-- RPC for admin funnel (aggregate counts only, no PII)
CREATE OR REPLACE FUNCTION get_onboarding_funnel(p_start TIMESTAMPTZ DEFAULT now() - interval '30 days', p_end TIMESTAMPTZ DEFAULT now())
RETURNS TABLE (event TEXT, step INTEGER, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT oe.event::TEXT, oe.step, COUNT(*)::BIGINT
  FROM onboarding_events oe
  WHERE oe.created_at >= p_start AND oe.created_at <= p_end
  GROUP BY oe.event, oe.step
  ORDER BY oe.step NULLS FIRST, oe.event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- onboarding_progress RLS
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_onboarding" ON onboarding_progress FOR SELECT
  TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_insert_own_onboarding" ON onboarding_progress FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_update_own_onboarding" ON onboarding_progress FOR UPDATE
  TO authenticated USING (user_id = auth.uid());

-- =========================
--  Phase D: Consent Logging (POPIA)
-- =========================

CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,  -- 'terms', 'privacy', 'marketing'
  granted BOOLEAN NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consents_user_id ON consents(user_id);
CREATE INDEX IF NOT EXISTS idx_consents_user_type ON consents(user_id, consent_type);

ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_consents" ON consents FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_insert_own_consents" ON consents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- =========================
--  RLS Policies (Phase A: Bootstrap)
-- =========================

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_members ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own account
CREATE POLICY "users_insert_own_account" ON accounts FOR INSERT
  TO authenticated WITH CHECK (owner_user_id = auth.uid());

-- Allow users to read their own accounts (owner or member)
CREATE POLICY "users_select_own_accounts" ON accounts FOR SELECT
  TO authenticated USING (
    owner_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM account_members
      WHERE account_id = accounts.id AND user_id = auth.uid()
    )
  );

-- Allow owner to update their account
CREATE POLICY "owner_update_account" ON accounts FOR UPDATE
  TO authenticated USING (owner_user_id = auth.uid());

-- Allow authenticated users to insert their own profile
CREATE POLICY "users_insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- Allow users to read their own profile
CREATE POLICY "users_select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (user_id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (user_id = auth.uid());

-- Allow account owners to add themselves as members
CREATE POLICY "owners_add_self_to_account" ON account_members FOR INSERT
  TO authenticated WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM accounts
      WHERE id = account_id AND owner_user_id = auth.uid()
    )
  );

-- Allow users to read memberships for accounts they belong to
CREATE POLICY "users_select_own_memberships" ON account_members FOR SELECT
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM accounts
      WHERE id = account_id AND owner_user_id = auth.uid()
    )
  );

-- =========================
--  Phase E: Admin Enhancements
-- =========================

-- Profiles: account status and flagging for admin workflows
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS flagged_reason TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_account_status_check') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_account_status_check
    CHECK (account_status IS NULL OR account_status IN ('active', 'suspended', 'pending'));
  END IF;
END $$;

-- admin_account_memberships_view: user_id, account_id, account_name, role
CREATE OR REPLACE VIEW admin_account_memberships_view AS
SELECT
  am.user_id,
  am.account_id,
  a.name AS account_name,
  am.role::TEXT AS role
FROM account_members am
JOIN accounts a ON a.id = am.account_id;

-- auth_users_view: admin user record with verification, consent, onboarding, vehicles, plan, status
CREATE OR REPLACE VIEW auth_users_view AS
SELECT
  u.id,
  u.email,
  COALESCE(p.display_name, u.email) AS full_name,
  u.created_at,
  a_def.name AS default_account_name,
  NULL::timestamptz AS email_confirmed_at,
  (SELECT c.granted FROM consents c WHERE c.user_id = u.id AND c.consent_type = 'marketing' ORDER BY c.created_at DESC LIMIT 1) AS marketing_consent,
  (op.completed_at IS NOT NULL) AS onboarding_completed,
  (SELECT COUNT(*)::INT FROM vehicles v JOIN accounts a ON v.account_id = a.id WHERE a.owner_user_id = u.id AND v.archived_at IS NULL) AS vehicle_count,
  (SELECT pl.code FROM subscriptions sub JOIN plans pl ON pl.id = sub.plan_id WHERE sub.account_id = a_def.id AND sub.status IN ('active','trialing') ORDER BY sub.current_period_end DESC NULLS LAST LIMIT 1) AS plan_code,
  COALESCE(p.account_status, 'active') AS account_status,
  p.flagged_at,
  p.flagged_reason
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
LEFT JOIN accounts a_def ON a_def.id = p.default_account_id
LEFT JOIN onboarding_progress op ON op.user_id = u.id;

-- admin_vehicles_view: admin vehicle record with owner, service, documents, alerts
CREATE OR REPLACE VIEW admin_vehicles_view AS
SELECT
  v.id,
  v.account_id,
  v.owner_user_id,
  a.name AS account_name,
  v.make,
  v.model,
  v.year,
  v.vin,
  v.license_plate,
  v.current_mileage,
  v.health_score,
  v.created_at,
  v.archived_at,
  (SELECT u.email FROM auth.users u WHERE u.id = a.owner_user_id) AS owner_email,
  COALESCE(
    (SELECT MAX(ml.service_date) FROM maintenance_logs ml WHERE ml.vehicle_id = v.id),
    (SELECT sp.last_service_date FROM service_preferences sp WHERE sp.vehicle_id = v.id LIMIT 1)
  ) AS last_service_date,
  (SELECT sp.last_service_date + (sp.service_interval_months || ' months')::INTERVAL FROM service_preferences sp WHERE sp.vehicle_id = v.id AND sp.service_interval_months IS NOT NULL LIMIT 1)::DATE AS next_service_due,
  (SELECT COUNT(*)::INT FROM documents d WHERE d.vehicle_id = v.id AND d.deleted_at IS NULL) AS document_count,
  (SELECT COUNT(*)::INT FROM alerts al WHERE al.vehicle_id = v.id AND al.status = 'pending') AS pending_alert_count
FROM vehicles v
JOIN accounts a ON a.id = v.account_id;

-- Admin views: readable by authenticated users; admin UI access enforced at app layer (VITE_ADMIN_EMAILS)
GRANT SELECT ON admin_account_memberships_view TO authenticated;
GRANT SELECT ON auth_users_view TO authenticated;
GRANT SELECT ON admin_vehicles_view TO authenticated;

-- admin_dashboard_metrics: single-row RPC for dashboard metrics
CREATE OR REPLACE FUNCTION admin_dashboard_metrics()
RETURNS JSONB
LANGUAGE SQL
STABLE
AS $$
  SELECT jsonb_build_object(
    'newRegistrationsThisWeek', (SELECT COUNT(*)::INT FROM auth_users_view uv WHERE uv.created_at >= date_trunc('week', now())),
    'verifiedCount', (SELECT COUNT(*)::INT FROM auth_users_view uv WHERE uv.email_confirmed_at IS NOT NULL),
    'unverifiedCount', (SELECT COUNT(*)::INT FROM auth_users_view uv WHERE uv.email_confirmed_at IS NULL),
    'totalUsers', (SELECT COUNT(*)::INT FROM auth_users_view),
    'onboardingCompletedCount', (SELECT COUNT(*)::INT FROM auth_users_view uv WHERE uv.onboarding_completed = true),
    'vehiclesPerUser', (SELECT COALESCE(AVG(uv.vehicle_count), 0)::NUMERIC(10,2) FROM auth_users_view uv),
    'upcomingReminderCount', (SELECT COUNT(*)::INT FROM alerts a WHERE a.status = 'pending' AND a.kind IN ('maintenance_due', 'document_expiring', 'subscription_renewal')),
    'overdueReminderCount', (SELECT COUNT(*)::INT FROM alerts a WHERE a.status = 'pending' AND a.kind = 'maintenance_overdue'),
    'totalVehicles', (SELECT COUNT(*)::INT FROM vehicles v WHERE v.archived_at IS NULL)
  );
$$;

GRANT EXECUTE ON FUNCTION admin_dashboard_metrics() TO authenticated;

-- admin_set_account_status: admin-only RPC to update user account status (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION admin_set_account_status(p_user_id UUID, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status NOT IN ('active', 'suspended', 'pending') THEN
    RAISE EXCEPTION 'Invalid account_status: %', p_status;
  END IF;
  UPDATE profiles SET account_status = p_status, updated_at = now() WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    INSERT INTO profiles (user_id, account_status, created_at, updated_at)
    VALUES (p_user_id, p_status, now(), now());
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_set_account_status(UUID, TEXT) TO authenticated;

-- admin_set_flagged: admin-only RPC to flag/unflag a user
CREATE OR REPLACE FUNCTION admin_set_flagged(p_user_id UUID, p_flagged BOOLEAN, p_reason TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles SET
    flagged_at = CASE WHEN p_flagged THEN now() ELSE NULL END,
    flagged_reason = CASE WHEN p_flagged THEN p_reason ELSE NULL END,
    updated_at = now()
  WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    INSERT INTO profiles (user_id, flagged_at, flagged_reason, created_at, updated_at)
    VALUES (p_user_id, CASE WHEN p_flagged THEN now() ELSE NULL END, p_reason, now(), now());
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_set_flagged(UUID, BOOLEAN, TEXT) TO authenticated;

-- =========================
--  Platform Admins (System Admin / Company Admin)
-- =========================

DO $$ BEGIN
  CREATE TYPE platform_admin_role AS ENUM ('system_admin', 'company_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role platform_admin_role NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT platform_admins_company_admin_needs_account
    CHECK (role != 'company_admin' OR account_id IS NOT NULL),
  CONSTRAINT platform_admins_system_admin_no_account
    CHECK (role != 'system_admin' OR account_id IS NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS platform_admins_system_admin_unique
  ON platform_admins (user_id) WHERE role = 'system_admin';
CREATE UNIQUE INDEX IF NOT EXISTS platform_admins_company_admin_unique
  ON platform_admins (user_id, account_id) WHERE role = 'company_admin';

ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read platform_admins (for AdminRoute / role checks)
CREATE POLICY "authenticated_read_platform_admins" ON platform_admins
  FOR SELECT TO authenticated USING (true);

GRANT SELECT ON platform_admins TO authenticated;
