-- Download history tracking for analytics and user history
CREATE TABLE IF NOT EXISTS user_downloads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id VARCHAR(255) NOT NULL,
  downloaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  file_size INTEGER,
  download_duration_ms INTEGER
);

-- Indexes for performance
CREATE INDEX idx_user_downloads_user ON user_downloads(user_id);
CREATE INDEX idx_user_downloads_resource ON user_downloads(resource_id);
CREATE INDEX idx_user_downloads_date ON user_downloads(downloaded_at DESC);

-- Composite index for user's recent downloads
CREATE INDEX idx_user_downloads_user_date ON user_downloads(user_id, downloaded_at DESC);

-- View for popular downloads (most downloaded resources)
CREATE OR REPLACE VIEW popular_downloads AS
SELECT
  sr.id,
  sr.subject,
  sr.title,
  sr.description,
  sr.topic_name,
  sr.topic_icon,
  sr.resource_type,
  sr.grade_level,
  COUNT(ud.id) as download_count,
  COUNT(DISTINCT ud.user_id) as unique_users,
  MAX(ud.downloaded_at) as last_downloaded
FROM subject_resources sr
LEFT JOIN user_downloads ud ON sr.id = ud.resource_id
WHERE sr.visible = true
GROUP BY sr.id, sr.subject, sr.title, sr.description, sr.topic_name, sr.topic_icon, sr.resource_type, sr.grade_level
HAVING COUNT(ud.id) > 0
ORDER BY download_count DESC;

-- View for recent downloads (last 7 days)
CREATE OR REPLACE VIEW recent_popular_downloads AS
SELECT
  sr.id,
  sr.subject,
  sr.title,
  sr.description,
  sr.topic_name,
  sr.topic_icon,
  sr.resource_type,
  sr.grade_level,
  COUNT(ud.id) as download_count,
  COUNT(DISTINCT ud.user_id) as unique_users
FROM subject_resources sr
LEFT JOIN user_downloads ud ON sr.id = ud.resource_id
WHERE sr.visible = true
  AND ud.downloaded_at > NOW() - INTERVAL '7 days'
GROUP BY sr.id, sr.subject, sr.title, sr.description, sr.topic_name, sr.topic_icon, sr.resource_type, sr.grade_level
HAVING COUNT(ud.id) > 0
ORDER BY download_count DESC;

COMMENT ON TABLE user_downloads IS 'Tracks individual download events for analytics and user history';
COMMENT ON VIEW popular_downloads IS 'Most downloaded resources of all time';
COMMENT ON VIEW recent_popular_downloads IS 'Most downloaded resources in the last 7 days';
