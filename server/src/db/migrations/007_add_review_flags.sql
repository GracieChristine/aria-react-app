ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS status      VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'flagged', 'removed')),
  ADD COLUMN IF NOT EXISTS flag_reason TEXT,
  ADD COLUMN IF NOT EXISTS flagged_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS flagged_by  UUID REFERENCES users(id);