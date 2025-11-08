-- Migration: Seed Tutor Marketplace Data
-- Purpose: Add sample Stripe Connect and earnings data to existing tutors for testing
-- Author: System
-- Date: 2025-11-08

-- Note: In production, tutors would set up Stripe Connect themselves
-- This seed data simulates tutors at different stages of the marketplace

-- Give some tutors mock Stripe Connect accounts (for testing payment flows)
-- These are fake account IDs - in production, these would be real Stripe Connect IDs
UPDATE tutors SET
  stripe_connect_account_id = 'acct_test_sarah_math',
  payout_enabled = true,
  stripe_onboarding_completed = true,
  total_earnings = 1250.00,
  pending_payout = 350.00,
  lifetime_payouts = 900.00,
  last_payout_at = NOW() - INTERVAL '7 days',
  content_count = 5,
  total_sales = 42
WHERE user_id = (SELECT id FROM users WHERE email = 'sarah.math@tutorplatform.com');

UPDATE tutors SET
  stripe_connect_account_id = 'acct_test_emma_algebra',
  payout_enabled = true,
  stripe_onboarding_completed = true,
  total_earnings = 890.00,
  pending_payout = 190.00,
  lifetime_payouts = 700.00,
  last_payout_at = NOW() - INTERVAL '14 days',
  content_count = 3,
  total_sales = 28
WHERE user_id = (SELECT id FROM users WHERE email = 'emma.algebra@tutorplatform.com');

UPDATE tutors SET
  stripe_connect_account_id = 'acct_test_james_calc',
  payout_enabled = true,
  stripe_onboarding_completed = true,
  total_earnings = 2340.00,
  pending_payout = 540.00,
  lifetime_payouts = 1800.00,
  last_payout_at = NOW() - INTERVAL '5 days',
  content_count = 8,
  total_sales = 67
WHERE user_id = (SELECT id FROM users WHERE email = 'james.calc@tutorplatform.com');

-- Tutor who has completed onboarding but hasn't sold anything yet
UPDATE tutors SET
  stripe_connect_account_id = 'acct_test_kevin_stats',
  payout_enabled = true,
  stripe_onboarding_completed = true,
  total_earnings = 0.00,
  pending_payout = 0.00,
  lifetime_payouts = 0.00,
  last_payout_at = NULL,
  content_count = 2,
  total_sales = 0
WHERE user_id = (SELECT id FROM users WHERE email = 'kevin.stats@tutorplatform.com');

-- Science tutors with varying marketplace activity
UPDATE tutors SET
  stripe_connect_account_id = 'acct_test_mike_science',
  payout_enabled = true,
  stripe_onboarding_completed = true,
  total_earnings = 675.00,
  pending_payout = 225.00,
  lifetime_payouts = 450.00,
  last_payout_at = NOW() - INTERVAL '10 days',
  content_count = 4,
  total_sales = 31
WHERE user_id = (SELECT id FROM users WHERE email = 'mike.science@tutorplatform.com');

UPDATE tutors SET
  stripe_connect_account_id = 'acct_test_david_physics',
  payout_enabled = true,
  stripe_onboarding_completed = true,
  total_earnings = 1580.00,
  pending_payout = 380.00,
  lifetime_payouts = 1200.00,
  last_payout_at = NOW() - INTERVAL '3 days',
  content_count = 6,
  total_sales = 52
WHERE user_id = (SELECT id FROM users WHERE email = 'david.physics@tutorplatform.com');

-- Tutor who hasn't completed Stripe onboarding yet (can't receive payouts)
UPDATE tutors SET
  stripe_connect_account_id = NULL,
  payout_enabled = false,
  stripe_onboarding_completed = false,
  total_earnings = 0.00,
  pending_payout = 0.00,
  lifetime_payouts = 0.00,
  last_payout_at = NULL,
  content_count = 1,
  total_sales = 0
WHERE user_id = (SELECT id FROM users WHERE email = 'lisa.bio@tutorplatform.com');

UPDATE tutors SET
  stripe_connect_account_id = 'acct_test_rachel_chem',
  payout_enabled = true,
  stripe_onboarding_completed = true,
  total_earnings = 1120.00,
  pending_payout = 320.00,
  lifetime_payouts = 800.00,
  last_payout_at = NOW() - INTERVAL '6 days',
  content_count = 5,
  total_sales = 39
WHERE user_id = (SELECT id FROM users WHERE email = 'rachel.chem@tutorplatform.com');

-- Summary of seed data:
-- Sarah (Math): Active seller, good earnings, pending payout
-- Emma (Algebra): Moderate activity
-- James (Calculus): Top seller, highest earnings
-- Kevin (Stats): Onboarded but no sales yet
-- Mike (Science): Moderate activity
-- David (Physics): High activity, recent payout
-- Lisa (Biology): NOT onboarded yet (can create content but can't get paid)
-- Rachel (Chemistry): Active seller

COMMENT ON TABLE tutors IS 'Tutor profiles with Stripe Connect integration and marketplace earnings tracking';
