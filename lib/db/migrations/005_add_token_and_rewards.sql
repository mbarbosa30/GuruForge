ALTER TABLE gurus ADD COLUMN IF NOT EXISTS token_address VARCHAR(255);
ALTER TABLE gurus ADD COLUMN IF NOT EXISTS token_symbol VARCHAR(50);
ALTER TABLE gurus ADD COLUMN IF NOT EXISTS token_chain VARCHAR(50) DEFAULT 'base';

CREATE TABLE IF NOT EXISTS reward_distributions (
  id SERIAL PRIMARY KEY,
  guru_id INTEGER NOT NULL REFERENCES gurus(id),
  initiated_by INTEGER NOT NULL REFERENCES users(id),
  token_address VARCHAR(255) NOT NULL,
  token_symbol VARCHAR(50) NOT NULL,
  chain VARCHAR(50) NOT NULL DEFAULT 'base',
  total_amount VARCHAR(255) NOT NULL,
  recipient_count INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  transaction_hashes TEXT,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reward_distributions_guru_id ON reward_distributions(guru_id);
CREATE INDEX IF NOT EXISTS idx_reward_distributions_initiated_by ON reward_distributions(initiated_by);
