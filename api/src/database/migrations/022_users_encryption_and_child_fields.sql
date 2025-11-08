-- Migration: Add Encryption and Child Account Fields to Users Table
-- Purpose: Support email encryption, COPPA child accounts, and parent-child relationships
-- Author: System
-- Date: 2025-11-08

-- Add encryption fields for PII protection
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_encrypted BYTEA;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_hash VARCHAR(64);

-- Add child account support fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_child BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Create index for email hash lookups (since email will be encrypted)
CREATE INDEX IF NOT EXISTS idx_users_email_hash ON users(email_hash);

-- Create index for parent-child relationships
CREATE INDEX IF NOT EXISTS idx_users_parent ON users(parent_id);

-- Create index for child accounts
CREATE INDEX IF NOT EXISTS idx_users_is_child ON users(is_child) WHERE is_child = true;

-- Comment new columns
COMMENT ON COLUMN users.email_encrypted IS 'AES-256-GCM encrypted email address (for PII protection)';
COMMENT ON COLUMN users.email_hash IS 'SHA-256 hash of email for lookups without decryption';
COMMENT ON COLUMN users.date_of_birth IS 'Date of birth for age verification (COPPA compliance for children under 13)';
COMMENT ON COLUMN users.is_child IS 'Whether this is a child account (under 13) requiring parental consent';
COMMENT ON COLUMN users.parent_id IS 'Parent user ID if this is a child account';

-- NOTE: Existing email column will remain for backward compatibility during migration
-- Future: Populate email_encrypted and email_hash, then remove plain email column
-- For now, both email and email_encrypted/email_hash will coexist

-- Add constraint: child accounts must have a parent
ALTER TABLE users ADD CONSTRAINT check_child_has_parent
  CHECK ((is_child = true AND parent_id IS NOT NULL) OR is_child = false);

-- Add constraint: prevent circular parent relationships (basic check)
-- Note: More complex checks should be done in application logic
ALTER TABLE users ADD CONSTRAINT check_no_self_parent
  CHECK (parent_id IS NULL OR parent_id != id);
