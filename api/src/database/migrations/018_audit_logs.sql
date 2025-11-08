-- Migration: Audit Logs for Compliance and Security Tracking
-- Purpose: Track all data access, modifications, and user actions for GDPR, COPPA, Privacy Act compliance
-- Author: System
-- Date: 2025-11-08

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  ip_address_hash VARCHAR(64),
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_user_time ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action_time ON audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- Comment the table
COMMENT ON TABLE audit_logs IS 'Audit trail for compliance (GDPR, COPPA, Privacy Act) - tracks user actions and data access';
COMMENT ON COLUMN audit_logs.user_id IS 'User who performed the action (NULL for system actions or deleted users)';
COMMENT ON COLUMN audit_logs.action IS 'Action performed (e.g., user.login, content.create, purchase.success)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (e.g., user, content, purchase)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN audit_logs.ip_address_hash IS 'SHA-256 hashed IP address for privacy';
COMMENT ON COLUMN audit_logs.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context (JSON) - e.g., transaction amounts, file sizes';

-- Example actions to log:
-- Authentication: user.login, user.logout, user.login_failed, user.register
-- Data access: user.data_export, user.view_profile, content.download
-- Modifications: user.update, content.create, content.update, content.delete
-- Purchases: purchase.attempt, purchase.success, purchase.refund
-- Admin: admin.approve_tutor, admin.delete_user, admin.moderate_content
