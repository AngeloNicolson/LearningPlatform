/**
 * Migration: Tutor Availability Management System
 * Description: Allows tutors to set weekly schedules, block dates, and automatically
 * calculates available time slots based on bookings and availability settings.
 */

-- Enable btree_gist extension for advanced constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Weekly recurring availability schedule
CREATE TABLE IF NOT EXISTS tutor_availability (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL CHECK (end_time > start_time),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exceptions: Vacations, holidays, one-off unavailability or custom hours
CREATE TABLE IF NOT EXISTS tutor_availability_exceptions (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  exception_type VARCHAR(20) NOT NULL CHECK (exception_type IN ('unavailable', 'custom_hours')),

  -- For custom_hours type, specify available times on this date
  start_time TIME,
  end_time TIME,

  reason TEXT, -- Optional reason (e.g., "Vacation", "Conference", "Holiday")

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- One exception per tutor per date
  CONSTRAINT unique_tutor_date UNIQUE (tutor_id, exception_date),

  -- Custom hours must have times
  CONSTRAINT custom_hours_times CHECK (
    (exception_type = 'unavailable') OR
    (exception_type = 'custom_hours' AND start_time IS NOT NULL AND end_time IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX idx_tutor_availability_tutor ON tutor_availability(tutor_id);
CREATE INDEX idx_tutor_availability_day ON tutor_availability(tutor_id, day_of_week) WHERE is_active = true;
CREATE INDEX idx_availability_exceptions_tutor ON tutor_availability_exceptions(tutor_id);
CREATE INDEX idx_availability_exceptions_date ON tutor_availability_exceptions(tutor_id, exception_date);

-- Function to check for overlapping availability slots
CREATE OR REPLACE FUNCTION check_availability_overlap()
RETURNS TRIGGER AS $$
DECLARE
  overlap_count INTEGER;
BEGIN
  -- Only check if this is an active availability record
  IF NEW.is_active = true THEN
    SELECT COUNT(*) INTO overlap_count
    FROM tutor_availability
    WHERE id != COALESCE(NEW.id, -1)
      AND tutor_id = NEW.tutor_id
      AND day_of_week = NEW.day_of_week
      AND is_active = true
      AND (start_time, end_time) OVERLAPS (NEW.start_time, NEW.end_time);

    IF overlap_count > 0 THEN
      RAISE EXCEPTION 'Overlapping availability time slot for this day';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent overlapping availability
CREATE TRIGGER trigger_check_availability_overlap
  BEFORE INSERT OR UPDATE ON tutor_availability
  FOR EACH ROW
  EXECUTE FUNCTION check_availability_overlap();

-- Function to get available time slots for a tutor on a specific date
CREATE OR REPLACE FUNCTION get_available_slots(
  p_tutor_id INTEGER,
  p_date DATE,
  p_duration_minutes INTEGER DEFAULT 60,
  p_slot_interval_minutes INTEGER DEFAULT 30
)
RETURNS TABLE (
  slot_time TIME,
  slot_end_time TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  v_day_of_week INTEGER;
  v_has_exception BOOLEAN;
  v_exception_type VARCHAR(20);
  v_start_time TIME;
  v_end_time TIME;
  v_current_time TIME;
  v_slot_duration INTERVAL;
  v_slot_interval INTERVAL;
BEGIN
  -- Get day of week (0 = Sunday)
  v_day_of_week := EXTRACT(DOW FROM p_date);

  -- Convert minutes to intervals
  v_slot_duration := (p_duration_minutes || ' minutes')::INTERVAL;
  v_slot_interval := (p_slot_interval_minutes || ' minutes')::INTERVAL;

  -- Check for exceptions on this date
  SELECT
    true,
    exception_type,
    COALESCE(start_time, '00:00:00'::TIME),
    COALESCE(end_time, '23:59:59'::TIME)
  INTO
    v_has_exception,
    v_exception_type,
    v_start_time,
    v_end_time
  FROM tutor_availability_exceptions
  WHERE tutor_id = p_tutor_id AND exception_date = p_date;

  -- If tutor is unavailable on this date, return empty
  IF v_has_exception AND v_exception_type = 'unavailable' THEN
    RETURN;
  END IF;

  -- Use exception times if custom_hours, otherwise use weekly schedule
  IF v_has_exception AND v_exception_type = 'custom_hours' THEN
    -- Use exception times
    v_current_time := v_start_time;

    -- Generate slots from exception times
    WHILE v_current_time + v_slot_duration <= v_end_time LOOP
      -- Check if this slot conflicts with any booking
      RETURN QUERY
      SELECT
        v_current_time,
        v_current_time + v_slot_duration,
        NOT EXISTS (
          SELECT 1 FROM bookings
          WHERE tutor_id = p_tutor_id
            AND session_date = p_date
            AND status IN ('confirmed', 'pending')
            AND (start_time, end_time) OVERLAPS (v_current_time, v_current_time + v_slot_duration)
        );

      v_current_time := v_current_time + v_slot_interval;
    END LOOP;
  ELSE
    -- Use weekly schedule
    FOR v_start_time, v_end_time IN
      SELECT ta.start_time, ta.end_time
      FROM tutor_availability ta
      WHERE ta.tutor_id = p_tutor_id
        AND ta.day_of_week = v_day_of_week
        AND ta.is_active = true
      ORDER BY ta.start_time
    LOOP
      v_current_time := v_start_time;

      -- Generate slots within this availability block
      WHILE v_current_time + v_slot_duration <= v_end_time LOOP
        -- Check if this slot conflicts with any booking
        RETURN QUERY
        SELECT
          v_current_time,
          v_current_time + v_slot_duration,
          NOT EXISTS (
            SELECT 1 FROM bookings
            WHERE tutor_id = p_tutor_id
              AND session_date = p_date
              AND status IN ('confirmed', 'pending')
              AND (start_time, end_time) OVERLAPS (v_current_time, v_current_time + v_slot_duration)
          );

        v_current_time := v_current_time + v_slot_interval;
      END LOOP;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Seed default availability for existing tutors (Mon-Fri 9am-5pm)
INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time)
SELECT
  t.id,
  day_num,
  '09:00:00'::TIME,
  '17:00:00'::TIME
FROM tutors t
CROSS JOIN generate_series(1, 5) AS day_num -- Monday (1) to Friday (5)
WHERE NOT EXISTS (
  SELECT 1 FROM tutor_availability ta
  WHERE ta.tutor_id = t.id AND ta.day_of_week = day_num
)
AND t.is_active = true
AND t.approval_status = 'approved';

-- Summary
SELECT
  'Availability system created!' as status,
  COUNT(DISTINCT tutor_id) as tutors_with_availability,
  COUNT(*) as total_availability_blocks
FROM tutor_availability;
