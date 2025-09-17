-- Simplified tutor update for testing
-- Update existing tutors with subject data

UPDATE tutors 
SET subjects = jsonb_build_object(
    'math_topics', ARRAY['Calculus I', 'Calculus II', 'Linear Algebra', 'Statistics'],
    'science_subjects', ARRAY[]::text[]
)
WHERE display_name = 'Dr. Sarah Chen';

UPDATE tutors 
SET subjects = jsonb_build_object(
    'math_topics', ARRAY['Algebra I', 'Algebra II', 'Geometry', 'Pre-Calculus'],
    'science_subjects', ARRAY[]::text[]
)
WHERE display_name = 'Michael Rodriguez';

UPDATE tutors 
SET subjects = jsonb_build_object(
    'math_topics', ARRAY['Basic Arithmetic', 'Fractions & Decimals', 'Basic Geometry'],
    'science_subjects', ARRAY[]::text[]
)
WHERE display_name = 'Emily Watson';

-- Insert 2 sample math tutors
INSERT INTO users (email, email_verified, password_hash, first_name, last_name, role, account_status) VALUES
('math.tutor1@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Jennifer', 'Martinez', 'tutor', 'active'),
('math.tutor2@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Robert', 'Taylor', 'tutor', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO tutors (user_id, display_name, bio, subjects, grades, hourly_rate, accepts_group_sessions, min_group_size, max_group_size, rating, total_sessions, approval_status) 
SELECT 
  u.id, 
  'Jennifer Martinez', 
  'Elementary math specialist with 8 years experience',
  jsonb_build_object('math_topics', ARRAY['Basic Arithmetic', 'Addition', 'Subtraction'], 'science_subjects', ARRAY[]::text[]),
  ARRAY['elementary'],
  40.00, true, 2, 4, 4.85, 189, 'approved'
FROM users u WHERE u.email = 'math.tutor1@tutors.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO tutors (user_id, display_name, bio, subjects, grades, hourly_rate, accepts_group_sessions, min_group_size, max_group_size, rating, total_sessions, approval_status) 
SELECT 
  u.id, 
  'Robert Taylor', 
  'High school algebra and geometry expert',
  jsonb_build_object('math_topics', ARRAY['Algebra I', 'Algebra II', 'Geometry'], 'science_subjects', ARRAY[]::text[]),
  ARRAY['high_school'],
  55.00, true, 2, 3, 4.78, 156, 'approved'
FROM users u WHERE u.email = 'math.tutor2@tutors.com'
ON CONFLICT (user_id) DO NOTHING;

-- Insert 2 sample science tutors
INSERT INTO users (email, email_verified, password_hash, first_name, last_name, role, account_status) VALUES
('physics.tutor@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Alan', 'Peterson', 'tutor', 'active'),
('chemistry.tutor@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Maria', 'Rodriguez', 'tutor', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO tutors (user_id, display_name, bio, subjects, grades, hourly_rate, accepts_group_sessions, min_group_size, max_group_size, rating, total_sessions, approval_status) 
SELECT 
  u.id, 
  'Dr. Alan Peterson', 
  'Physics professor specializing in mechanics and electromagnetism',
  jsonb_build_object('math_topics', ARRAY[]::text[], 'science_subjects', ARRAY['Physics', 'AP Physics', 'Mechanics']),
  ARRAY['high_school', 'college'],
  95.00, true, 2, 4, 4.92, 312, 'approved'
FROM users u WHERE u.email = 'physics.tutor@tutors.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO tutors (user_id, display_name, bio, subjects, grades, hourly_rate, accepts_group_sessions, min_group_size, max_group_size, rating, total_sessions, approval_status) 
SELECT 
  u.id, 
  'Maria Rodriguez', 
  'Organic chemistry specialist for pre-med students',
  jsonb_build_object('math_topics', ARRAY[]::text[], 'science_subjects', ARRAY['Chemistry', 'Organic Chemistry', 'AP Chemistry']),
  ARRAY['high_school', 'college'],
  85.00, true, 2, 3, 4.88, 234, 'approved'
FROM users u WHERE u.email = 'chemistry.tutor@tutors.com'
ON CONFLICT (user_id) DO NOTHING;