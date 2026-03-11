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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
--  Documents & Storage
-- =========================

CREATE TYPE document_type AS ENUM (
  'insurance',
  'registration',
  'inspection',
  'receipt',
  'warranty',
  'other'
);

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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

