-- Migration: Payment Transactions
-- Purpose: Track all payment transactions (purchases, subscriptions, refunds, payouts)
-- Author: System
-- Date: 2025-11-08

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('purchase', 'subscription', 'refund', 'payout')),
  payment_provider VARCHAR(50) DEFAULT 'stripe',
  provider_transaction_id VARCHAR(255) UNIQUE,
  payer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  tutor_id INTEGER REFERENCES tutors(id) ON DELETE SET NULL,
  amount_total DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2),
  tutor_earnings DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_transaction_payer ON payment_transactions(payer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_tutor ON payment_transactions(tutor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_provider ON payment_transactions(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_status ON payment_transactions(status, transaction_type);
CREATE INDEX IF NOT EXISTS idx_transaction_created ON payment_transactions(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_transactions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_transactions_timestamp();

-- Add constraint: platform_fee + tutor_earnings should equal amount_total (for purchases)
-- Note: This is a soft constraint - edge cases exist (refunds, rounding)
ALTER TABLE payment_transactions ADD CONSTRAINT check_amount_split
  CHECK (
    transaction_type = 'refund' OR
    transaction_type = 'payout' OR
    (platform_fee + tutor_earnings <= amount_total + 0.01 AND
     platform_fee + tutor_earnings >= amount_total - 0.01)
  );

-- Comment the table
COMMENT ON TABLE payment_transactions IS 'All payment transactions (purchases, subscriptions, refunds, payouts)';
COMMENT ON COLUMN payment_transactions.transaction_type IS 'Type: purchase, subscription, refund, payout';
COMMENT ON COLUMN payment_transactions.payment_provider IS 'Payment provider: stripe, paypal, mock (for testing)';
COMMENT ON COLUMN payment_transactions.provider_transaction_id IS 'External transaction ID (e.g., Stripe payment_intent_id)';
COMMENT ON COLUMN payment_transactions.payer_id IS 'User who made the payment (parent or student)';
COMMENT ON COLUMN payment_transactions.tutor_id IS 'Tutor receiving earnings (NULL for platform fees)';
COMMENT ON COLUMN payment_transactions.amount_total IS 'Total amount charged to customer';
COMMENT ON COLUMN payment_transactions.platform_fee IS 'Platform commission (e.g., 20% of total)';
COMMENT ON COLUMN payment_transactions.tutor_earnings IS 'Amount tutor receives (total - platform_fee)';
COMMENT ON COLUMN payment_transactions.currency IS 'Currency code (USD, NZD, AUD, etc.)';
COMMENT ON COLUMN payment_transactions.status IS 'Status: pending, completed, failed, refunded';
COMMENT ON COLUMN payment_transactions.failure_reason IS 'Reason for failure (if status=failed)';
COMMENT ON COLUMN payment_transactions.metadata IS 'Additional context: content_id, pricing_id, etc.';

-- Transaction types:
-- 'purchase' - One-time content purchase
-- 'subscription' - Recurring subscription payment
-- 'refund' - Refund of previous purchase
-- 'payout' - Platform paying tutor (Stripe Connect transfer)

-- Payment flow:
-- 1. User clicks "Purchase" → Create transaction (status='pending')
-- 2. Stripe processes payment → Webhook updates (status='completed' or 'failed')
-- 3. If completed → Trigger content assignment, update tutor earnings
-- 4. If failed → Log failure_reason, notify user

-- Revenue split example:
-- amount_total: $29.99
-- platform_fee: $6.00 (20%)
-- tutor_earnings: $23.99 (80%)
