-- Token blacklist for logout/revocation
CREATE TABLE IF NOT EXISTS token_blacklist (
  id SERIAL PRIMARY KEY,
  token_jti VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  revoked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  reason VARCHAR(50) DEFAULT 'logout'
);

-- Index for fast lookups
CREATE INDEX idx_token_blacklist_jti ON token_blacklist(token_jti);
CREATE INDEX idx_token_blacklist_expires ON token_blacklist(expires_at);

-- Cleanup job: Delete expired tokens (run periodically)
-- This keeps the table from growing indefinitely
COMMENT ON TABLE token_blacklist IS 'Stores revoked JWT tokens to prevent reuse after logout';
