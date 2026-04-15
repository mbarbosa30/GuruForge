ALTER TABLE gurus ADD COLUMN IF NOT EXISTS proactive_cadence VARCHAR(20) NOT NULL DEFAULT 'none';

ALTER TABLE telegram_connections ADD COLUMN IF NOT EXISTS last_proactive_at TIMESTAMPTZ;
