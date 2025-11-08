-- Migration: Purchase Requests
-- Purpose: Child requests for parent approval (COPPA compliance, parental control)
-- Author: System
-- Date: 2025-11-08

-- Create purchase_requests table
CREATE TABLE IF NOT EXISTS purchase_requests (
  id SERIAL PRIMARY KEY,
  child_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id VARCHAR(255) NOT NULL REFERENCES tutor_content(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  request_message TEXT,
  response_message TEXT,
  requested_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_request_parent_status ON purchase_requests(parent_id, status);
CREATE INDEX IF NOT EXISTS idx_request_child ON purchase_requests(child_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_content ON purchase_requests(content_id);
CREATE INDEX IF NOT EXISTS idx_request_pending ON purchase_requests(status, requested_at DESC) WHERE status = 'pending';

-- Comment the table
COMMENT ON TABLE purchase_requests IS 'Child content purchase requests pending parent approval';
COMMENT ON COLUMN purchase_requests.child_id IS 'Child requesting the content';
COMMENT ON COLUMN purchase_requests.parent_id IS 'Parent who must approve/deny';
COMMENT ON COLUMN purchase_requests.content_id IS 'Content being requested';
COMMENT ON COLUMN purchase_requests.status IS 'Status: pending, approved, denied, cancelled';
COMMENT ON COLUMN purchase_requests.request_message IS 'Optional message from child (e.g., why they want it)';
COMMENT ON COLUMN purchase_requests.response_message IS 'Optional message from parent (e.g., reason for denial)';
COMMENT ON COLUMN purchase_requests.requested_at IS 'When child made the request';
COMMENT ON COLUMN purchase_requests.responded_at IS 'When parent approved/denied';

-- Request flow:
-- 1. Child browses tutor profile, clicks "Request from Parent" on content
-- 2. System creates request (status='pending')
-- 3. Parent receives notification (email, in-app badge)
-- 4. Parent views request in dashboard
-- 5. Parent clicks "Approve" → triggers payment flow → on success, status='approved'
-- 6. Parent clicks "Deny" → status='denied', optional response_message
-- 7. Child can cancel pending request → status='cancelled'

-- Status transitions:
-- pending → approved (parent approves and payment succeeds)
-- pending → denied (parent denies)
-- pending → cancelled (child cancels before parent responds)

-- Parent dashboard query (get pending requests):
-- SELECT r.*, c.title, u.first_name as child_name
-- FROM purchase_requests r
-- JOIN tutor_content c ON r.content_id = c.id
-- JOIN users u ON r.child_id = u.id
-- WHERE r.parent_id = 123 AND r.status = 'pending'
-- ORDER BY r.requested_at DESC

-- Prevent duplicate requests for same content
CREATE UNIQUE INDEX idx_unique_pending_request
  ON purchase_requests(child_id, content_id, parent_id)
  WHERE status = 'pending';

COMMENT ON INDEX idx_unique_pending_request IS 'Prevent duplicate pending requests for same content';
