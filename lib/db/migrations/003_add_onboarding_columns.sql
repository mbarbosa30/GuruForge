ALTER TABLE telegram_connections ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE telegram_connections ADD COLUMN onboarding_step INTEGER NOT NULL DEFAULT 0;

-- Backfill: mark all pre-existing connections as already onboarded so they skip the flow
UPDATE telegram_connections SET onboarding_completed = true;
