-- Migration: Content Assignments
-- Purpose: Track who has access to what content (parent assigns to child, access control)
-- Author: System
-- Date: 2025-11-08

-- Create content_assignments table
CREATE TABLE IF NOT EXISTS content_assignments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id VARCHAR(255) NOT NULL REFERENCES tutor_content(id) ON DELETE CASCADE,
  assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  purchase_id INTEGER REFERENCES content_purchases(id) ON DELETE CASCADE,
  access_granted_at TIMESTAMP DEFAULT NOW(),
  access_expires_at TIMESTAMP,
  UNIQUE(user_id, content_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_assignment_user ON content_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_content ON content_assignments(content_id);
CREATE INDEX IF NOT EXISTS idx_assignment_assigned_by ON content_assignments(assigned_by);
CREATE INDEX IF NOT EXISTS idx_assignment_expires ON content_assignments(access_expires_at) WHERE access_expires_at IS NOT NULL;

-- Comment the table
COMMENT ON TABLE content_assignments IS 'Content access assignments (who can access what)';
COMMENT ON COLUMN content_assignments.user_id IS 'User who has access (student or child)';
COMMENT ON COLUMN content_assignments.content_id IS 'Content they can access';
COMMENT ON COLUMN content_assignments.assigned_by IS 'Who granted access (parent or admin, NULL if self-purchased)';
COMMENT ON COLUMN content_assignments.purchase_id IS 'Associated purchase record';
COMMENT ON COLUMN content_assignments.access_granted_at IS 'When access was granted';
COMMENT ON COLUMN content_assignments.access_expires_at IS 'When access expires (NULL for lifetime)';

-- Access scenarios:
-- 1. Adult student purchases content → assignment created for themselves (assigned_by = NULL)
-- 2. Parent purchases for child → assignment created for child (assigned_by = parent_id)
-- 3. Parent reassigns existing content between children → update user_id, keep purchase_id
-- 4. Subscription expires → access_expires_at set to expiration date

-- Example: Parent buys course for Child A
-- content_purchases: buyer_id=parent, content_id=course-123
-- content_assignments: user_id=child_a, content_id=course-123, assigned_by=parent, purchase_id=<purchase_id>

-- Example: Parent reassigns to Child B
-- UPDATE content_assignments SET user_id=child_b WHERE user_id=child_a AND content_id=course-123

-- Check access query:
-- SELECT 1 FROM content_assignments
-- WHERE user_id = 456 AND content_id = 'course-123'
-- AND (access_expires_at IS NULL OR access_expires_at > NOW())
