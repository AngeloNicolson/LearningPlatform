-- Migration: Add Stripe Connect and Earnings Fields to Tutors Table
-- Purpose: Support tutor payouts via Stripe Connect and earnings tracking
-- Author: System
-- Date: 2025-11-08

-- Add Stripe Connect fields
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS stripe_connect_account_id VARCHAR(255) UNIQUE;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS payout_enabled BOOLEAN DEFAULT false;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT false;

-- Add earnings tracking fields
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS pending_payout DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS lifetime_payouts DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS last_payout_at TIMESTAMP;

-- Add content statistics fields
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS content_count INTEGER DEFAULT 0;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_tutors_stripe_account ON tutors(stripe_connect_account_id);
CREATE INDEX IF NOT EXISTS idx_tutors_payout_enabled ON tutors(payout_enabled) WHERE payout_enabled = true;
CREATE INDEX IF NOT EXISTS idx_tutors_pending_payout ON tutors(pending_payout) WHERE pending_payout > 0;

-- Add constraints for data integrity
ALTER TABLE tutors ADD CONSTRAINT check_earnings_non_negative
  CHECK (total_earnings >= 0 AND pending_payout >= 0 AND lifetime_payouts >= 0);

-- Comment new columns
COMMENT ON COLUMN tutors.stripe_connect_account_id IS 'Stripe Connect account ID for receiving payouts (e.g., acct_xxxxx)';
COMMENT ON COLUMN tutors.payout_enabled IS 'Whether tutor has completed Stripe onboarding and can receive payouts';
COMMENT ON COLUMN tutors.stripe_onboarding_completed IS 'Whether tutor has completed Stripe Connect onboarding flow';
COMMENT ON COLUMN tutors.total_earnings IS 'Total amount earned from content sales (before payouts)';
COMMENT ON COLUMN tutors.pending_payout IS 'Amount available for payout (not yet transferred)';
COMMENT ON COLUMN tutors.lifetime_payouts IS 'Total amount paid out to tutor (cumulative)';
COMMENT ON COLUMN tutors.last_payout_at IS 'Timestamp of most recent payout';
COMMENT ON COLUMN tutors.content_count IS 'Number of published content items created by tutor';
COMMENT ON COLUMN tutors.total_sales IS 'Total number of content purchases (all time)';

-- Stripe Connect workflow:
-- 1. Tutor signs up → stripe_connect_account_id = NULL, payout_enabled = false
-- 2. Tutor clicks "Setup Payouts" → Create Stripe Connect account → store account ID
-- 3. Tutor completes Stripe onboarding → stripe_onboarding_completed = true, payout_enabled = true
-- 4. Sales occur → total_earnings increases, pending_payout increases
-- 5. Payout requested → transfer pending_payout to Stripe account
-- 6. Payout complete → pending_payout decreases, lifetime_payouts increases, last_payout_at updated
