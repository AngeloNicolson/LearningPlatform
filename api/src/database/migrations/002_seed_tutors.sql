-- Seed Tutors Migration
-- Creates sample tutor users and tutor profiles for testing

-- Insert demo accounts (password is 'password123' hashed with bcrypt)
INSERT INTO users (email, password_hash, first_name, last_name, role, account_status, created_at) VALUES
  ('owner@tutorplatform.com', '$2b$10$D6NvakH8tMTVWLp6MD/ubOJzSaO6zgTrjrED88ETQAzCJZiwneWg6', 'Platform', 'Owner', 'admin', 'active', NOW()),
  ('admin@tutorplatform.com', '$2b$10$D6NvakH8tMTVWLp6MD/ubOJzSaO6zgTrjrED88ETQAzCJZiwneWg6', 'Admin', 'User', 'admin', 'active', NOW()),
  ('john.parent@email.com', '$2b$10$D6NvakH8tMTVWLp6MD/ubOJzSaO6zgTrjrED88ETQAzCJZiwneWg6', 'John', 'Parent', 'parent', 'active', NOW()),
  ('alex.student@email.com', '$2b$10$D6NvakH8tMTVWLp6MD/ubOJzSaO6zgTrjrED88ETQAzCJZiwneWg6', 'Alex', 'Student', 'student', 'active', NOW()),
  ('sarah.chen@tutors.com', '$2b$10$D6NvakH8tMTVWLp6MD/ubOJzSaO6zgTrjrED88ETQAzCJZiwneWg6', 'Sarah', 'Chen', 'tutor', 'active', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert sample tutor users (password is 'password123')
INSERT INTO users (email, password_hash, first_name, last_name, role, account_status, created_at) VALUES
  ('sarah.math@tutorplatform.com', '$2b$10$D6NvakH8tMTVWLp6MD/ubOJzSaO6zgTrjrED88ETQAzCJZiwneWg6', 'Sarah', 'Johnson', 'tutor', 'active', NOW()),
  ('mike.science@tutorplatform.com', '$2b$10$D6NvakH8tMTVWLp6MD/ubOJzSaO6zgTrjrED88ETQAzCJZiwneWg6', 'Mike', 'Chen', 'tutor', 'active', NOW()),
  ('emma.algebra@tutorplatform.com', '$2b$10$D6NvakH8tMTVWLp6MD/ubOJzSaO6zgTrjrED88ETQAzCJZiwneWg6', 'Emma', 'Williams', 'tutor', 'active', NOW()),
  ('david.physics@tutorplatform.com', '$2b$10$D6NvakH8tMTVWLp6MD/ubOJzSaO6zgTrjrED88ETQAzCJZiwneWg6', 'David', 'Martinez', 'tutor', 'active', NOW()),
  ('lisa.bio@tutorplatform.com', '$2b$10$D6NvakH8tMTVWLp6MD/ubOJzSaO6zgTrjrED88ETQAzCJZiwneWg6', 'Lisa', 'Anderson', 'tutor', 'active', NOW()),
  ('james.calc@tutorplatform.com', '$2b$10$D6NvakH8tMTVWLp6MD/ubOJzSaO6zgTrjrED88ETQAzCJZiwneWg6', 'James', 'Taylor', 'tutor', 'active', NOW()),
  ('rachel.chem@tutorplatform.com', '$2b$10$D6NvakH8tMTVWLp6MD/ubOJzSaO6zgTrjrED88ETQAzCJZiwneWg6', 'Rachel', 'Brown', 'tutor', 'active', NOW()),
  ('kevin.stats@tutorplatform.com', '$2b$10$D6NvakH8tMTVWLp6MD/ubOJzSaO6zgTrjrED88ETQAzCJZiwneWg6', 'Kevin', 'Lee', 'tutor', 'active', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert tutor profiles
-- Math Tutors
INSERT INTO tutors (
  user_id, display_name, bio, subjects, grades,
  hourly_rate, approval_status, is_active,
  rating, total_sessions, created_at
) VALUES
  (
    (SELECT id FROM users WHERE email = 'sarah.math@tutorplatform.com'),
    'Sarah J.',
    'Experienced math tutor specializing in algebra and geometry. I make complex concepts easy to understand!',
    '{"math_topics": ["Arithmetic", "Algebra", "Geometry"]}',
    ARRAY['Elementary', 'Middle School', 'High School'],
    45.00,
    'approved',
    true,
    4.9,
    127,
    NOW()
  ),
  (
    (SELECT id FROM users WHERE email = 'emma.algebra@tutorplatform.com'),
    'Emma W.',
    'Passionate about helping students build confidence in mathematics. Specializing in algebra through calculus.',
    '{"math_topics": ["Algebra", "Trigonometry", "Calculus"]}',
    ARRAY['High School', 'College'],
    55.00,
    'approved',
    true,
    4.8,
    95,
    NOW()
  ),
  (
    (SELECT id FROM users WHERE email = 'james.calc@tutorplatform.com'),
    'James T.',
    'Math PhD with 8 years teaching experience. Expert in calculus, linear algebra, and statistics.',
    '{"math_topics": ["Calculus", "Linear Algebra", "Statistics"]}',
    ARRAY['High School', 'College'],
    65.00,
    'approved',
    true,
    5.0,
    203,
    NOW()
  ),
  (
    (SELECT id FROM users WHERE email = 'kevin.stats@tutorplatform.com'),
    'Kevin L.',
    'Data scientist turned tutor. I help students understand statistics and probability through real-world examples.',
    '{"math_topics": ["Statistics", "Discrete Math"]}',
    ARRAY['High School', 'College'],
    50.00,
    'approved',
    true,
    4.7,
    78,
    NOW()
  );

-- Science Tutors
INSERT INTO tutors (
  user_id, display_name, bio, subjects, grades,
  hourly_rate, approval_status, is_active,
  rating, total_sessions, created_at
) VALUES
  (
    (SELECT id FROM users WHERE email = 'mike.science@tutorplatform.com'),
    'Mike C.',
    'Science enthusiast with expertise in physics and chemistry. Making science fun and accessible for all students!',
    '{"science_subjects": ["Physics", "Chemistry"]}',
    ARRAY['Middle School', 'High School'],
    48.00,
    'approved',
    true,
    4.8,
    112,
    NOW()
  ),
  (
    (SELECT id FROM users WHERE email = 'david.physics@tutorplatform.com'),
    'David M.',
    'Physics teacher with 10 years experience. I love helping students understand the laws that govern our universe.',
    '{"science_subjects": ["Physics"]}',
    ARRAY['High School', 'College'],
    60.00,
    'approved',
    true,
    4.9,
    156,
    NOW()
  ),
  (
    (SELECT id FROM users WHERE email = 'lisa.bio@tutorplatform.com'),
    'Lisa A.',
    'Biologist and educator. Passionate about teaching biology, environmental science, and life sciences.',
    '{"science_subjects": ["Biology", "Environmental Science"]}',
    ARRAY['Middle School', 'High School', 'College'],
    52.00,
    'approved',
    true,
    4.9,
    143,
    NOW()
  ),
  (
    (SELECT id FROM users WHERE email = 'rachel.chem@tutorplatform.com'),
    'Rachel B.',
    'Chemistry expert with a knack for making complex reactions simple. AP Chemistry specialist.',
    '{"science_subjects": ["Chemistry"]}',
    ARRAY['High School', 'College'],
    58.00,
    'approved',
    true,
    5.0,
    189,
    NOW()
  );

-- Add group session settings for some tutors
UPDATE tutors SET
  accepts_group_sessions = true,
  min_group_size = 2,
  max_group_size = 4,
  group_pricing = '{"2": 35.00, "3": 30.00, "4": 25.00}'::jsonb
WHERE user_id IN (
  SELECT id FROM users WHERE email IN ('sarah.math@tutorplatform.com', 'mike.science@tutorplatform.com', 'james.calc@tutorplatform.com')
);
