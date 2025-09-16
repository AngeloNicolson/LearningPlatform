-- Initial schema for tutoring platform

-- Enable UUID extension for better IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with proper constraints
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'tutor', 'parent', 'personal')),
  parent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'pending', 'suspended')),
  
  -- Security fields
  failed_login_attempts INTEGER DEFAULT 0,
  last_failed_attempt TIMESTAMP,
  account_locked_until TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_parent ON users(parent_id);
CREATE INDEX idx_users_role ON users(role);

-- Tutors with full availability system
CREATE TABLE IF NOT EXISTS tutors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(200) NOT NULL,
  bio TEXT,
  subjects JSONB NOT NULL DEFAULT '[]',
  grades VARCHAR(50)[] NOT NULL,
  
  -- Pricing
  hourly_rate DECIMAL(10,2) NOT NULL,
  accepts_group_sessions BOOLEAN DEFAULT TRUE,
  min_group_size INTEGER DEFAULT 2,
  max_group_size INTEGER DEFAULT 4,
  group_pricing JSONB DEFAULT '{"type": "per_student", "discount": 10}',
  
  -- Add constraint that only applies when accepting group sessions
  CONSTRAINT group_size_check CHECK (
    (accepts_group_sessions = false) OR 
    (accepts_group_sessions = true AND min_group_size >= 2 AND max_group_size <= 7 AND max_group_size >= min_group_size)
  ),
  
  -- Stats
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_sessions INTEGER DEFAULT 0,
  total_hours DECIMAL(10,1) DEFAULT 0.0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tutors_user ON tutors(user_id);
CREATE INDEX idx_tutors_status ON tutors(approval_status, is_active);

-- Weekly availability schedule (0 = Sunday, 6 = Saturday)
CREATE TABLE IF NOT EXISTS tutor_availability (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  UNIQUE(tutor_id, day_of_week, start_time)
);

CREATE INDEX idx_availability_tutor ON tutor_availability(tutor_id);
CREATE INDEX idx_availability_day ON tutor_availability(day_of_week);

-- Date-specific overrides (holidays, vacations)
CREATE TABLE IF NOT EXISTS tutor_availability_overrides (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  override_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT FALSE,
  reason VARCHAR(255),
  all_day BOOLEAN DEFAULT TRUE,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tutor_id, override_date, start_time)
);

CREATE INDEX idx_overrides_tutor_date ON tutor_availability_overrides(tutor_id, override_date);

-- Bookings with real-time constraints
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES tutors(id),
  booked_by INTEGER NOT NULL REFERENCES users(id),
  
  -- Session details
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  
  -- Group session support
  is_group_session BOOLEAN DEFAULT FALSE,
  total_participants INTEGER DEFAULT 1 CHECK (total_participants >= 1 AND total_participants <= 7),
  
  -- Status & payment
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  payment_intent_id VARCHAR(255),
  
  -- Metadata
  subject VARCHAR(100),
  notes TEXT,
  meeting_link VARCHAR(500),
  cancellation_reason TEXT,
  cancelled_by INTEGER REFERENCES users(id),
  cancelled_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Prevent double booking
  CONSTRAINT no_double_booking UNIQUE (tutor_id, session_date, start_time)
);

CREATE INDEX idx_bookings_tutor ON bookings(tutor_id);
CREATE INDEX idx_bookings_user ON bookings(booked_by);
CREATE INDEX idx_bookings_date ON bookings(session_date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Booking participants for group sessions
CREATE TABLE IF NOT EXISTS booking_participants (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id),
  added_by INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'declined')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(booking_id, student_id)
);

CREATE INDEX idx_participants_booking ON booking_participants(booking_id);
CREATE INDEX idx_participants_student ON booking_participants(student_id);

-- Parent groups for collaborative booking
CREATE TABLE IF NOT EXISTS parent_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  invite_code VARCHAR(20) UNIQUE,
  created_by INTEGER NOT NULL REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_groups_creator ON parent_groups(created_by);
CREATE INDEX idx_groups_code ON parent_groups(invite_code);

-- Parent group members
CREATE TABLE IF NOT EXISTS parent_group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES parent_groups(id) ON DELETE CASCADE,
  parent_id INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_by INTEGER REFERENCES users(id),
  joined_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, parent_id)
);

CREATE INDEX idx_group_members_group ON parent_group_members(group_id);
CREATE INDEX idx_group_members_parent ON parent_group_members(parent_id);

-- Group child permissions (which children are visible to the group)
CREATE TABLE IF NOT EXISTS group_child_permissions (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES parent_groups(id) ON DELETE CASCADE,
  child_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER NOT NULL REFERENCES users(id),
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, child_id)
);

CREATE INDEX idx_child_perms_group ON group_child_permissions(group_id);
CREATE INDEX idx_child_perms_parent ON group_child_permissions(parent_id);

-- Reviews and ratings
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id),
  tutor_id INTEGER NOT NULL REFERENCES tutors(id),
  reviewer_id INTEGER NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(booking_id, reviewer_id)
);

CREATE INDEX idx_reviews_tutor ON reviews(tutor_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON tutors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parent_groups_updated_at BEFORE UPDATE ON parent_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Security logs table
CREATE TABLE IF NOT EXISTS security_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_security_logs_user ON security_logs(user_id);
CREATE INDEX idx_security_logs_event ON security_logs(event_type);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_resets_token ON password_resets(token);