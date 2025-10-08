-- Refactor to industry-standard user relationships pattern
-- Replaces parent_id column with proper junction table

-- Create user_relationships table
CREATE TABLE IF NOT EXISTS user_relationships (
  id SERIAL PRIMARY KEY,
  parent_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) DEFAULT 'parent' CHECK (relationship_type IN ('parent', 'guardian')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(parent_user_id, child_user_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_relationships_parent ON user_relationships(parent_user_id);
CREATE INDEX idx_user_relationships_child ON user_relationships(child_user_id);

-- Note: parent_id column was already removed from 001_schema.sql
-- No data migration needed for fresh installs
