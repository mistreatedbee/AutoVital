-- Phase 7: Add province and postal_code to profiles for richer SA localization
-- These fields support South African address capture (e.g. province codes, postal codes).
-- Run after schema.sql. Update OnboardingFlow.tsx and ProfileSettings.tsx to include these fields.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Optional: Add check constraint for SA provinces (EC, FS, GP, KZN, LP, MP, NC, NW, WC)
-- Uncomment when ready to enforce:
-- DO $$
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_province_check') THEN
--     ALTER TABLE profiles ADD CONSTRAINT profiles_province_check
--     CHECK (province IS NULL OR province IN ('EC','FS','GP','KZN','LP','MP','NC','NW','WC'));
--   END IF;
-- END $$;
