-- Migration: Data Retention Log for Compliance
-- Purpose: Track data deletion and retention for audit trail (GDPR right to erasure, legal holds)
-- Author: System
-- Date: 2025-11-08

-- Create data_retention_log table
CREATE TABLE IF NOT EXISTS data_retention_log (
  id BIGSERIAL PRIMARY KEY,
  data_type VARCHAR(100) NOT NULL,
  record_id VARCHAR(255) NOT NULL,
  deletion_type VARCHAR(50) DEFAULT 'soft_delete',
  deleted_at TIMESTAMP DEFAULT NOW(),
  deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  deletion_reason VARCHAR(100),
  retention_until TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for querying
CREATE INDEX IF NOT EXISTS idx_retention_data_type ON data_retention_log(data_type, deleted_at DESC);
CREATE INDEX IF NOT EXISTS idx_retention_record ON data_retention_log(data_type, record_id);
CREATE INDEX IF NOT EXISTS idx_retention_deleted_by ON data_retention_log(deleted_by);
CREATE INDEX IF NOT EXISTS idx_retention_until ON data_retention_log(retention_until);

-- Comment the table
COMMENT ON TABLE data_retention_log IS 'Audit log for data deletion and retention policies';
COMMENT ON COLUMN data_retention_log.data_type IS 'Type of data deleted: user, content, transaction, audit_log, etc.';
COMMENT ON COLUMN data_retention_log.record_id IS 'ID of the deleted record (as string for flexibility)';
COMMENT ON COLUMN data_retention_log.deletion_type IS 'How data was deleted: soft_delete (anonymized), hard_delete (purged), archived';
COMMENT ON COLUMN data_retention_log.deleted_at IS 'When the data was deleted';
COMMENT ON COLUMN data_retention_log.deleted_by IS 'User who initiated deletion (NULL for system/automated cleanup)';
COMMENT ON COLUMN data_retention_log.deletion_reason IS 'Why deleted: user_request, legal_requirement, retention_policy, admin_action, coppa_compliance';
COMMENT ON COLUMN data_retention_log.retention_until IS 'Date when data can be permanently purged (NULL if indefinite or already purged)';
COMMENT ON COLUMN data_retention_log.metadata IS 'Additional context: original_email, anonymized_values, legal_hold_info';

-- Deletion types:
-- 'soft_delete' - Data anonymized but structure kept (e.g., email → deleted_user_123@anonymized.local)
-- 'hard_delete' - Data permanently removed from database
-- 'archived' - Data moved to archive storage (cold storage, backups)
-- 'obfuscated' - Data scrambled but recoverable (for legal holds)

-- Deletion reasons:
-- 'user_request' - User exercised right to erasure
-- 'legal_requirement' - Legal obligation to delete (e.g., COPPA child data)
-- 'retention_policy' - Automated cleanup per retention policy
-- 'admin_action' - Admin/moderator deleted content or user
-- 'coppa_compliance' - Child account deletion
-- 'gdpr_compliance' - GDPR right to be forgotten
-- 'business_decision' - Voluntary business decision

-- Retention periods (examples):
-- Financial records: 7 years (tax/accounting law)
-- Audit logs: 3 years (security/compliance)
-- User accounts (deleted): 7 years anonymized (legal holds)
-- Child data (deleted): Immediate purge (COPPA)
-- Session logs: 90 days
