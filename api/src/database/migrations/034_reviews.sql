-- Reviews table for tutor ratings and feedback
-- Supports both verified reviews (from completed bookings) and general reviews

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
  comment TEXT NOT NULL,
  subject VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Ensure one review per booking
  UNIQUE(booking_id),

  -- Prevent duplicate reviews from same student for same tutor (unless from booking)
  UNIQUE(tutor_id, student_id, booking_id)
);

-- Indexes for performance
CREATE INDEX idx_reviews_tutor_id ON reviews(tutor_id);
CREATE INDEX idx_reviews_student_id ON reviews(student_id);
CREATE INDEX idx_reviews_visible ON reviews(tutor_id, is_visible);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Trigger to update tutor rating when reviews are added/updated/deleted
CREATE OR REPLACE FUNCTION update_tutor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tutors
  SET rating = (
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0.0)
    FROM reviews
    WHERE tutor_id = COALESCE(NEW.tutor_id, OLD.tutor_id)
      AND is_visible = true
  ),
  updated_at = CURRENT_TIMESTAMP
  WHERE id = COALESCE(NEW.tutor_id, OLD.tutor_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tutor_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_tutor_rating();

-- Comment
COMMENT ON TABLE reviews IS 'Student reviews and ratings for tutors. Includes both verified reviews from completed bookings and general feedback.';
COMMENT ON COLUMN reviews.is_verified IS 'True if review is from a completed booking, false for general reviews';
COMMENT ON COLUMN reviews.is_visible IS 'Admin can hide inappropriate reviews without deleting them';
