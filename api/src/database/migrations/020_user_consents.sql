-- Migration: User Consents for Cookie and Marketing Preferences
-- Purpose: Track user consent for cookies, analytics, marketing (GDPR, CCPA, Privacy Act compliance)
-- Author: System
-- Date: 2025-11-08

-- Create user_consents table
CREATE TABLE IF NOT EXISTS user_consents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  consented BOOLEAN DEFAULT false,
  consented_at TIMESTAMP,
  ip_address_hash VARCHAR(64),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ensure one consent record per user per type
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_consent
  ON user_consents(user_id, consent_type);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_consent_user ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_type ON user_consents(consent_type, consented);

-- Add constraint: consented_at must be set if consented is true
ALTER TABLE user_consents ADD CONSTRAINT check_user_consented_at
  CHECK ((consented = true AND consented_at IS NOT NULL) OR consented = false);

-- Comment the table
COMMENT ON TABLE user_consents IS 'User consent preferences for cookies, analytics, marketing (GDPR, CCPA, Privacy Act)';
COMMENT ON COLUMN user_consents.user_id IS 'User providing consent';
COMMENT ON COLUMN user_consents.consent_type IS 'Type of consent: essential_cookies, analytics_cookies, marketing_cookies, marketing_emails, third_party_sharing, data_processing';
COMMENT ON COLUMN user_consents.consented IS 'Whether user consented (true) or opted out (false)';
COMMENT ON COLUMN user_consents.consented_at IS 'Timestamp when consent was given or revoked';
COMMENT ON COLUMN user_consents.ip_address_hash IS 'SHA-256 hashed IP address for audit trail';
COMMENT ON COLUMN user_consents.user_agent IS 'Browser user agent for audit trail';
COMMENT ON COLUMN user_consents.updated_at IS 'Last time consent was modified';

-- Consent types explained:
-- 'essential_cookies' - Required cookies for site functionality (usually no consent needed, but tracked)
-- 'analytics_cookies' - Google Analytics, usage tracking (requires consent)
-- 'marketing_cookies' - Advertising, retargeting cookies (requires consent)
-- 'marketing_emails' - Promotional emails (requires opt-in)
-- 'third_party_sharing' - Sharing data with partners (requires consent)
-- 'data_processing' - General data processing for service delivery (usually covered in ToS, but can be tracked)

-- Insert default essential consent for existing users (retrospective)
-- This assumes existing users implicitly consented by using the service
INSERT INTO user_consents (user_id, consent_type, consented, consented_at, created_at)
SELECT
  id,
  'essential_cookies',
  true,
  created_at,
  NOW()
FROM users
ON CONFLICT (user_id, consent_type) DO NOTHING;
