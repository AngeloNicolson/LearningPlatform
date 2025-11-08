-- Migration: Content Purchases
-- Purpose: Track who purchased what content (purchase history)
-- Author: System
-- Date: 2025-11-08

-- Create content_purchases table
CREATE TABLE IF NOT EXISTS content_purchases (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id VARCHAR(255) NOT NULL REFERENCES tutor_content(id) ON DELETE CASCADE,
  pricing_id INTEGER REFERENCES content_pricing(id) ON DELETE SET NULL,
  transaction_id INTEGER REFERENCES payment_transactions(id) ON DELETE SET NULL,
  purchase_type VARCHAR(50) NOT NULL CHECK (purchase_type IN ('direct', 'subscription_access', 'bundle', 'free')),
  price_paid DECIMAL(10, 2),
  purchased_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  UNIQUE(buyer_id, content_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_purchase_buyer ON content_purchases(buyer_id, purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_content ON content_purchases(content_id, purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_type ON content_purchases(purchase_type);
CREATE INDEX IF NOT EXISTS idx_purchase_expires ON content_purchases(expires_at) WHERE expires_at IS NOT NULL;

-- Comment the table
COMMENT ON TABLE content_purchases IS 'Content purchase history (who bought what)';
COMMENT ON COLUMN content_purchases.buyer_id IS 'User who purchased the content (parent or student)';
COMMENT ON COLUMN content_purchases.content_id IS 'Content that was purchased';
COMMENT ON COLUMN content_purchases.pricing_id IS 'Pricing option used (NULL if deleted)';
COMMENT ON COLUMN content_purchases.transaction_id IS 'Payment transaction (NULL for free content)';
COMMENT ON COLUMN content_purchases.purchase_type IS 'How acquired: direct, subscription_access, bundle, free';
COMMENT ON COLUMN content_purchases.price_paid IS 'Actual price paid (may differ from current price)';
COMMENT ON COLUMN content_purchases.purchased_at IS 'When purchase was made';
COMMENT ON COLUMN content_purchases.expires_at IS 'When access expires (NULL for lifetime access)';

-- Purchase types:
-- 'direct' - Direct one-time purchase of this specific content
-- 'subscription_access' - Access granted via tutor subscription
-- 'bundle' - Acquired as part of a bundle purchase
-- 'free' - Free content claimed by user

-- Unique constraint explanation:
-- A user can only purchase the same content once
-- If they already own it, they can't buy it again
-- Exception: If subscription expires and they buy one-time, we delete old record and create new one

-- Example queries:
-- Get all purchases by user: SELECT * FROM content_purchases WHERE buyer_id = 123
-- Get all buyers of content: SELECT * FROM content_purchases WHERE content_id = 'course-abc'
-- Check if user owns content: SELECT 1 FROM content_purchases WHERE buyer_id = 123 AND content_id = 'course-abc' AND (expires_at IS NULL OR expires_at > NOW())
