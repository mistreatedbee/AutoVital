-- Phase 2: Unify currency defaults to ZAR for SA deployment
-- This migration backfills existing data where currency is NULL or still 'USD'.

UPDATE maintenance_logs
SET currency = 'ZAR'
WHERE currency IS NULL OR currency = 'USD';

UPDATE fuel_logs
SET currency = 'ZAR'
WHERE currency IS NULL OR currency = 'USD';

