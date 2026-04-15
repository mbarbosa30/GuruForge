CREATE TABLE IF NOT EXISTS processed_telegram_updates (
  update_id BIGINT NOT NULL,
  guru_id INTEGER NOT NULL REFERENCES gurus(id),
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (guru_id, update_id)
);

CREATE INDEX IF NOT EXISTS processed_tg_updates_processed_at_idx
  ON processed_telegram_updates (processed_at);
