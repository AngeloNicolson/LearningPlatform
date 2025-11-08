-- Migration: Content Pricing
-- Purpose: Flexible pricing models for tutor content (one-time, subscription, free, bundles)
-- Author: System
-- Date: 2025-11-08

-- Create content_pricing table
CREATE TABLE IF NOT EXISTS content_pricing (
  id SERIAL PRIMARY KEY,
  content_id VARCHAR(255) NOT NULL REFERENCES tutor_content(id) ON DELETE CASCADE,
  pricing_model VARCHAR(50) NOT NULL CHECK (pricing_model IN ('one_time', 'subscription', 'free', 'bundle', 'session_package')),
  price_amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  billing_interval VARCHAR(20),
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_pricing_content ON content_pricing(content_id, is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_model ON content_pricing(pricing_model, is_active);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_pricing_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_pricing_updated_at
  BEFORE UPDATE ON content_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_content_pricing_timestamp();

-- Add constraint: free content must have price_amount = 0 or NULL
ALTER TABLE content_pricing ADD CONSTRAINT check_free_pricing
  CHECK ((pricing_model = 'free' AND (price_amount = 0 OR price_amount IS NULL)) OR pricing_model != 'free');

-- Add constraint: subscription must have billing_interval
ALTER TABLE content_pricing ADD CONSTRAINT check_subscription_interval
  CHECK ((pricing_model = 'subscription' AND billing_interval IS NOT NULL) OR pricing_model != 'subscription');

-- Comment the table
COMMENT ON TABLE content_pricing IS 'Flexible pricing models for tutor content';
COMMENT ON COLUMN content_pricing.content_id IS 'Content being priced';
COMMENT ON COLUMN content_pricing.pricing_model IS 'Pricing model: one_time, subscription, free, bundle, session_package';
COMMENT ON COLUMN content_pricing.price_amount IS 'Price in currency units (e.g., 29.99 USD)';
COMMENT ON COLUMN content_pricing.currency IS 'Currency code (USD, NZD, AUD, etc.)';
COMMENT ON COLUMN content_pricing.billing_interval IS 'For subscriptions: monthly, yearly, quarterly';
COMMENT ON COLUMN content_pricing.config IS 'Model-specific configuration (JSONB for flexibility)';
COMMENT ON COLUMN content_pricing.is_active IS 'Whether this pricing option is currently available';

-- Pricing models explained:
-- 'one_time' - Pay once, lifetime access
--   Example: { price_amount: 29.99, config: {} }
--
-- 'subscription' - Recurring access to tutor's content library
--   Example: { price_amount: 19.99, billing_interval: 'monthly', config: { "access_all": true } }
--
-- 'free' - Free content (lead magnets, promotional)
--   Example: { price_amount: 0, config: { "requires_email": true } }
--
-- 'bundle' - Multiple content items packaged together
--   Example: { price_amount: 99.99, config: { "included_content": ["lesson-1", "lesson-2"], "discount": 20 } }
--
-- 'session_package' - Content + tutoring sessions bundled
--   Example: { price_amount: 150.00, config: { "session_count": 3, "session_duration": 60 } }

-- A single content item can have multiple pricing options
-- Example: Course available as one-time purchase ($50) OR via tutor's monthly subscription ($20/mo)
