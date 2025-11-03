-- Allow anonymous download tracking
-- Make user_id nullable and add ip_address for anonymous users

ALTER TABLE user_downloads
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN ip_address VARCHAR(45);

-- Add index for IP-based queries
CREATE INDEX idx_user_downloads_ip ON user_downloads(ip_address);

-- Add check constraint: must have either user_id or ip_address
ALTER TABLE user_downloads
  ADD CONSTRAINT check_user_or_ip CHECK (
    (user_id IS NOT NULL) OR (ip_address IS NOT NULL)
  );

COMMENT ON COLUMN user_downloads.ip_address IS 'IP address for anonymous downloads (when user_id is NULL)';
