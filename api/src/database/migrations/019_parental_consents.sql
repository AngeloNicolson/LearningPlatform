-- Migration: Parental Consents for COPPA Compliance
-- Purpose: Track parental consent for children under 13 (COPPA) and general child account management
-- Author: System
-- Date: 2025-11-08

-- Create parental_consents table
CREATE TABLE IF NOT EXISTS parental_consents (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  consented BOOLEAN DEFAULT false,
  consent_method VARCHAR(50),
  consented_at TIMESTAMP,
  revoked_at TIMESTAMP,
  ip_address_hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Prevent duplicate consents for same parent-child-type combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_consent
  ON parental_consents(parent_id, child_id, consent_type)
  WHERE revoked_at IS NULL;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_consent_child ON parental_consents(child_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_parent ON parental_consents(parent_id);
CREATE INDEX IF NOT EXISTS idx_consent_active ON parental_consents(consented, revoked_at);

-- Add constraint: consent_at must be set if consented is true
ALTER TABLE parental_consents ADD CONSTRAINT check_consented_at
  CHECK ((consented = true AND consented_at IS NOT NULL) OR consented = false);

-- Comment the table
COMMENT ON TABLE parental_consents IS 'Parental consent records for COPPA compliance (USA) and child account management';
COMMENT ON COLUMN parental_consents.parent_id IS 'Parent account providing consent';
COMMENT ON COLUMN parental_consents.child_id IS 'Child account receiving consent';
COMMENT ON COLUMN parental_consents.consent_type IS 'Type of consent: account_creation, data_collection, third_party_sharing, marketing_emails';
COMMENT ON COLUMN parental_consents.consented IS 'Whether parent consented (true) or denied (false)';
COMMENT ON COLUMN parental_consents.consent_method IS 'How consent was obtained: electronic_signature, credit_card_verification, email_confirmation';
COMMENT ON COLUMN parental_consents.consented_at IS 'Timestamp when consent was given';
COMMENT ON COLUMN parental_consents.revoked_at IS 'Timestamp when consent was revoked (NULL if still active)';
COMMENT ON COLUMN parental_consents.ip_address_hash IS 'SHA-256 hashed IP address of consent action for audit trail';

-- Example consent types:
-- 'account_creation' - Parent consents to creating child account
-- 'data_collection' - Parent consents to collecting child's personal information
-- 'third_party_sharing' - Parent consents to sharing data with third parties (e.g., payment processors)
-- 'marketing_emails' - Parent consents to sending marketing emails to child
-- 'content_purchases' - Parent consents to child requesting content purchases
