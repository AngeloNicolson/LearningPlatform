-- Migration: Create site_data table for aggregate site statistics
-- This stores cached counts that are updated when resources/tutors change
-- Avoids expensive COUNT(*) queries on every page load

CREATE TABLE IF NOT EXISTS site_data (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initialize with current counts
INSERT INTO site_data (key, value) VALUES
  ('total_resources', (SELECT COUNT(*) FROM subject_resources WHERE visible = true)),
  ('total_tutors', (SELECT COUNT(*) FROM tutors WHERE approval_status = 'approved')),
  ('total_downloads', (SELECT COUNT(*) FROM user_downloads)),
  ('total_users', (SELECT COUNT(*) FROM users))
ON CONFLICT (key) DO NOTHING;

-- Create function to update timestamp on value change
CREATE OR REPLACE FUNCTION update_site_data_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS site_data_update_timestamp ON site_data;
CREATE TRIGGER site_data_update_timestamp
  BEFORE UPDATE ON site_data
  FOR EACH ROW
  EXECUTE FUNCTION update_site_data_timestamp();
