-- Migration: Enhanced Bookings with Payment Integration
-- Purpose: Upgrade bookings table for production-ready booking system with Stripe integration
-- Author: System
-- Date: 2025-11-25

-- Drop existing basic bookings table
DROP TABLE IF EXISTS bookings CASCADE;

-- Create enhanced bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,

  -- Core booking info
  tutor_id INTEGER NOT NULL REFERENCES tutors(id) ON DELETE RESTRICT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booked_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session details
  session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('30min', '60min', '90min', 'test-prep', 'custom')),
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,

  -- Recurring sessions
  is_recurring BOOLEAN DEFAULT false,
  recurring_weeks INTEGER,
  parent_booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE, -- Links recurring bookings
  recurrence_instance INTEGER DEFAULT 1, -- Which week in the series

  -- Group sessions
  is_group_session BOOLEAN DEFAULT false,
  group_size INTEGER DEFAULT 1,
  group_participants JSONB DEFAULT '[]'::jsonb, -- Array of participant emails

  -- Payment info
  payment_intent_id VARCHAR(255) UNIQUE,
  payment_transaction_id INTEGER REFERENCES payment_transactions(id) ON DELETE SET NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  platform_fee DECIMAL(10, 2),
  tutor_earnings DECIMAL(10, 2),

  -- Status and timestamps
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP,
  cancelled_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- Additional info
  notes TEXT,
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  parent_email VARCHAR(255),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Flexible field for additional data

  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Create comprehensive indexes for query optimization
CREATE INDEX idx_bookings_tutor_date ON bookings(tutor_id, session_date);
CREATE INDEX idx_bookings_student_date ON bookings(student_id, session_date DESC);
CREATE INDEX idx_bookings_booked_by ON bookings(booked_by_id, created_at DESC);
CREATE INDEX idx_bookings_status ON bookings(status, session_date);
CREATE INDEX idx_bookings_payment_intent ON bookings(payment_intent_id);
CREATE INDEX idx_bookings_recurring ON bookings(parent_booking_id, recurrence_instance);
CREATE INDEX idx_bookings_date_time ON bookings(session_date, start_time);

-- Create unique constraint to prevent double-booking
CREATE UNIQUE INDEX idx_unique_tutor_timeslot ON bookings(
  tutor_id,
  session_date,
  start_time
) WHERE status IN ('confirmed', 'pending');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bookings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_timestamp();

-- Add trigger to prevent booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflict()
RETURNS TRIGGER AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Only check for active bookings (not cancelled/completed)
  IF NEW.status IN ('pending', 'confirmed') THEN
    SELECT COUNT(*) INTO conflict_count
    FROM bookings
    WHERE tutor_id = NEW.tutor_id
      AND session_date = NEW.session_date
      AND status IN ('pending', 'confirmed')
      AND id != COALESCE(NEW.id, 0)
      AND (
        -- Check for time overlap
        (start_time, end_time) OVERLAPS (NEW.start_time, NEW.end_time)
      );

    IF conflict_count > 0 THEN
      RAISE EXCEPTION 'Time slot conflict: This time is already booked for this tutor';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_booking_conflict_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_conflict();

-- Add trigger to update tutor stats on booking completion
CREATE OR REPLACE FUNCTION update_tutor_stats_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE tutors
    SET
      total_sessions = total_sessions + 1,
      total_earnings = total_earnings + COALESCE(NEW.tutor_earnings, 0),
      pending_payout = pending_payout + COALESCE(NEW.tutor_earnings, 0),
      updated_at = NOW()
    WHERE id = NEW.tutor_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tutor_stats_trigger
  AFTER UPDATE ON bookings
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_tutor_stats_on_completion();

-- Add comments for documentation
COMMENT ON TABLE bookings IS 'Tutoring session bookings with full payment integration';
COMMENT ON COLUMN bookings.tutor_id IS 'Tutor providing the session';
COMMENT ON COLUMN bookings.student_id IS 'Student receiving the session (can be child account)';
COMMENT ON COLUMN bookings.booked_by_id IS 'User who made the booking (parent or student themselves)';
COMMENT ON COLUMN bookings.session_type IS 'Type of session: 30min, 60min, 90min, test-prep, custom';
COMMENT ON COLUMN bookings.is_recurring IS 'Whether this is part of a recurring series';
COMMENT ON COLUMN bookings.recurring_weeks IS 'Total number of weeks in recurring series';
COMMENT ON COLUMN bookings.parent_booking_id IS 'Links to original booking for recurring sessions';
COMMENT ON COLUMN bookings.recurrence_instance IS 'Week number in the recurring series (1-based)';
COMMENT ON COLUMN bookings.is_group_session IS 'Whether this is a group session';
COMMENT ON COLUMN bookings.group_size IS 'Number of participants in group session';
COMMENT ON COLUMN bookings.group_participants IS 'JSON array of participant emails';
COMMENT ON COLUMN bookings.payment_intent_id IS 'Stripe Payment Intent ID (pi_xxxxx)';
COMMENT ON COLUMN bookings.payment_transaction_id IS 'Link to payment_transactions table';
COMMENT ON COLUMN bookings.amount_paid IS 'Total amount paid by customer';
COMMENT ON COLUMN bookings.platform_fee IS 'Platform commission (typically 20%)';
COMMENT ON COLUMN bookings.tutor_earnings IS 'Amount tutor receives (amount - platform_fee - Stripe fees)';
COMMENT ON COLUMN bookings.status IS 'pending: awaiting payment | confirmed: paid | cancelled | completed | no_show';
COMMENT ON COLUMN bookings.metadata IS 'Flexible JSON field for additional data (video link, notes, etc.)';

-- Add constraint checks
ALTER TABLE bookings ADD CONSTRAINT check_duration_positive
  CHECK (duration_minutes > 0 AND duration_minutes <= 240);

ALTER TABLE bookings ADD CONSTRAINT check_group_size_valid
  CHECK (group_size >= 1 AND group_size <= 10);

ALTER TABLE bookings ADD CONSTRAINT check_recurring_weeks_valid
  CHECK (recurring_weeks IS NULL OR (recurring_weeks >= 1 AND recurring_weeks <= 52));

ALTER TABLE bookings ADD CONSTRAINT check_recurrence_instance_valid
  CHECK (recurrence_instance >= 1);

ALTER TABLE bookings ADD CONSTRAINT check_amount_positive
  CHECK (amount_paid >= 0);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON bookings TO authenticated_user;
GRANT SELECT, INSERT, UPDATE ON bookings TO tutor_user;
GRANT ALL ON bookings TO admin_user;
