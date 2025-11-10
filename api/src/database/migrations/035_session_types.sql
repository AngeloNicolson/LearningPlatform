-- Session types table for tutor-defined session offerings
-- Allows tutors to offer different session durations and pricing

CREATE TABLE IF NOT EXISTS session_types (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Prevent duplicate session types for same tutor
  UNIQUE(tutor_id, name)
);

-- Indexes for performance
CREATE INDEX idx_session_types_tutor_id ON session_types(tutor_id);
CREATE INDEX idx_session_types_active ON session_types(tutor_id, is_active);
CREATE INDEX idx_session_types_display ON session_types(tutor_id, display_order);

-- Add session_type_id to bookings table to track which type was booked
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS session_type_id INTEGER REFERENCES session_types(id) ON DELETE SET NULL;

CREATE INDEX idx_bookings_session_type ON bookings(session_type_id);

-- Comment
COMMENT ON TABLE session_types IS 'Different session types offered by tutors (e.g., 30min, 60min, test prep packages)';
COMMENT ON COLUMN session_types.display_order IS 'Order in which session types should be displayed (lower numbers first)';
