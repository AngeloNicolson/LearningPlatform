-- Seed data for tutoring platform
-- All users have password: password123
-- Hash generated with bcrypt salt rounds = 12 to match auth.ts

-- Insert owner account
INSERT INTO users (email, email_verified, password_hash, first_name, last_name, role, account_status)
VALUES ('owner@tutorplatform.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Platform', 'Owner', 'owner', 'active');

-- Insert admin account
INSERT INTO users (email, email_verified, password_hash, first_name, last_name, role, account_status)
VALUES ('admin@tutorplatform.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Admin', 'User', 'admin', 'active');

-- Insert tutors
INSERT INTO users (email, email_verified, password_hash, first_name, last_name, role, account_status) VALUES
('sarah.chen@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Sarah', 'Chen', 'tutor', 'active'),
('michael.rodriguez@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Michael', 'Rodriguez', 'tutor', 'active'),
('emily.watson@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Emily', 'Watson', 'tutor', 'active'),
('david.kim@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'David', 'Kim', 'tutor', 'pending');

-- Insert parent accounts
INSERT INTO users (email, email_verified, password_hash, first_name, last_name, role, account_status) VALUES
('john.parent@email.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'John', 'Smith', 'parent', 'active'),
('lisa.parent@email.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Lisa', 'Johnson', 'parent', 'active'),
('robert.parent@email.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Robert', 'Williams', 'parent', 'active');

-- Insert children linked to parents (get parent IDs first)
INSERT INTO users (email, email_verified, password_hash, first_name, last_name, role, parent_id, account_status) VALUES
('emma.smith@student.com', false, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Emma', 'Smith', 'personal', (SELECT id FROM users WHERE email = 'john.parent@email.com'), 'active'),
('liam.smith@student.com', false, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Liam', 'Smith', 'personal', (SELECT id FROM users WHERE email = 'john.parent@email.com'), 'active'),
('sophia.johnson@student.com', false, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Sophia', 'Johnson', 'personal', (SELECT id FROM users WHERE email = 'lisa.parent@email.com'), 'active'),
('noah.williams@student.com', false, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Noah', 'Williams', 'personal', (SELECT id FROM users WHERE email = 'robert.parent@email.com'), 'active');

-- Insert personal (non-parent) accounts
INSERT INTO users (email, email_verified, password_hash, first_name, last_name, role, account_status) VALUES
('alex.student@email.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Alex', 'Turner', 'personal', 'active'),
('maria.student@email.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Maria', 'Garcia', 'personal', 'active');

-- Create tutor profiles
INSERT INTO tutors (user_id, display_name, bio, subjects, grades, hourly_rate, accepts_group_sessions, min_group_size, max_group_size, group_pricing, rating, total_sessions, approval_status) VALUES
((SELECT id FROM users WHERE email = 'sarah.chen@tutors.com'), 
 'Dr. Sarah Chen', 
 'PhD in Mathematics from MIT with 10+ years of teaching experience. Specializing in advanced calculus and statistics for high school and college students.',
 '["Calculus", "Statistics", "Linear Algebra", "AP Math"]',
 ARRAY['high_school', 'college'],
 75.00,
 true,
 2,
 5,
 '{"type": "per_student", "discount": 15, "rates": {"2": 65, "3": 60, "4": 55, "5": 50}}',
 4.9,
 156,
 'approved'),

((SELECT id FROM users WHERE email = 'michael.rodriguez@tutors.com'),
 'Michael Rodriguez',
 'Former high school math teacher with expertise in algebra and geometry. Patient and experienced with students who struggle with math.',
 '["Algebra", "Geometry", "Pre-Calculus", "SAT Math"]',
 ARRAY['middle_school', 'high_school'],
 55.00,
 true,
 2,
 4,
 '{"type": "per_student", "discount": 10}',
 4.8,
 203,
 'approved'),

((SELECT id FROM users WHERE email = 'emily.watson@tutors.com'),
 'Emily Watson',
 'Elementary math specialist with a focus on building strong foundations. Creating fun and engaging lessons for young learners.',
 '["Basic Math", "Arithmetic", "Fractions", "Word Problems"]',
 ARRAY['elementary'],
 45.00,
 true,
 2,
 6,
 '{"type": "tiered", "rates": {"2": 80, "3-4": 110, "5-6": 140}}',
 4.95,
 312,
 'approved'),

((SELECT id FROM users WHERE email = 'david.kim@tutors.com'),
 'David Kim',
 'Graduate student in Applied Mathematics offering tutoring in college-level courses.',
 '["Differential Equations", "Multivariable Calculus", "Probability Theory"]',
 ARRAY['college'],
 65.00,
 false,
 1,
 1,
 '{}',
 0,
 0,
 'pending');

-- Add availability for approved tutors
-- Sarah Chen - Weekday afternoons and Saturday mornings
INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time) VALUES
((SELECT id FROM tutors WHERE display_name = 'Dr. Sarah Chen'), 1, '14:00', '18:00'),
((SELECT id FROM tutors WHERE display_name = 'Dr. Sarah Chen'), 2, '14:00', '18:00'),
((SELECT id FROM tutors WHERE display_name = 'Dr. Sarah Chen'), 3, '14:00', '18:00'),
((SELECT id FROM tutors WHERE display_name = 'Dr. Sarah Chen'), 4, '14:00', '18:00'),
((SELECT id FROM tutors WHERE display_name = 'Dr. Sarah Chen'), 5, '13:00', '17:00'),
((SELECT id FROM tutors WHERE display_name = 'Dr. Sarah Chen'), 6, '09:00', '13:00');

-- Michael Rodriguez - Flexible schedule
INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time) VALUES
((SELECT id FROM tutors WHERE display_name = 'Michael Rodriguez'), 1, '15:00', '20:00'),
((SELECT id FROM tutors WHERE display_name = 'Michael Rodriguez'), 2, '15:00', '20:00'),
((SELECT id FROM tutors WHERE display_name = 'Michael Rodriguez'), 3, '15:00', '20:00'),
((SELECT id FROM tutors WHERE display_name = 'Michael Rodriguez'), 4, '15:00', '20:00'),
((SELECT id FROM tutors WHERE display_name = 'Michael Rodriguez'), 5, '15:00', '19:00'),
((SELECT id FROM tutors WHERE display_name = 'Michael Rodriguez'), 6, '10:00', '17:00'),
((SELECT id FROM tutors WHERE display_name = 'Michael Rodriguez'), 0, '12:00', '16:00');

-- Emily Watson - Morning and early afternoon
INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time) VALUES
((SELECT id FROM tutors WHERE display_name = 'Emily Watson'), 1, '09:00', '15:00'),
((SELECT id FROM tutors WHERE display_name = 'Emily Watson'), 2, '09:00', '15:00'),
((SELECT id FROM tutors WHERE display_name = 'Emily Watson'), 3, '09:00', '15:00'),
((SELECT id FROM tutors WHERE display_name = 'Emily Watson'), 4, '09:00', '15:00'),
((SELECT id FROM tutors WHERE display_name = 'Emily Watson'), 5, '09:00', '14:00'),
((SELECT id FROM tutors WHERE display_name = 'Emily Watson'), 6, '09:00', '12:00');

-- Create a parent group
INSERT INTO parent_groups (name, description, invite_code, created_by) VALUES
('5th Grade Math Study Group', 
 'Parents coordinating group tutoring sessions for 5th grade math',
 'MATH5TH2024',
 (SELECT id FROM users WHERE email = 'john.parent@email.com'));

-- Add members to the group
INSERT INTO parent_group_members (group_id, parent_id, status, invited_by, joined_at) VALUES
((SELECT id FROM parent_groups WHERE invite_code = 'MATH5TH2024'),
 (SELECT id FROM users WHERE email = 'john.parent@email.com'),
 'accepted',
 NULL,
 CURRENT_TIMESTAMP),
((SELECT id FROM parent_groups WHERE invite_code = 'MATH5TH2024'),
 (SELECT id FROM users WHERE email = 'lisa.parent@email.com'),
 'accepted',
 (SELECT id FROM users WHERE email = 'john.parent@email.com'),
 CURRENT_TIMESTAMP);

-- Make children visible to the group
INSERT INTO group_child_permissions (group_id, child_id, parent_id, is_visible) VALUES
((SELECT id FROM parent_groups WHERE invite_code = 'MATH5TH2024'),
 (SELECT id FROM users WHERE email = 'emma.smith@student.com'),
 (SELECT id FROM users WHERE email = 'john.parent@email.com'),
 true),
((SELECT id FROM parent_groups WHERE invite_code = 'MATH5TH2024'),
 (SELECT id FROM users WHERE email = 'sophia.johnson@student.com'),
 (SELECT id FROM users WHERE email = 'lisa.parent@email.com'),
 true);

-- Add some sample bookings
INSERT INTO bookings (tutor_id, booked_by, session_date, start_time, end_time, duration_minutes, is_group_session, total_participants, status, total_amount, payment_status, subject) VALUES
((SELECT id FROM tutors WHERE display_name = 'Dr. Sarah Chen'),
 (SELECT id FROM users WHERE email = 'john.parent@email.com'),
 CURRENT_DATE + INTERVAL '3 days',
 '15:00',
 '16:00',
 60,
 false,
 1,
 'confirmed',
 75.00,
 'paid',
 'Calculus'),

((SELECT id FROM tutors WHERE display_name = 'Michael Rodriguez'),
 (SELECT id FROM users WHERE email = 'lisa.parent@email.com'),
 CURRENT_DATE + INTERVAL '5 days',
 '16:00',
 '18:00',
 120,
 true,
 3,
 'confirmed',
 150.00,
 'paid',
 'Algebra');

-- Add participants to the group booking
INSERT INTO booking_participants (booking_id, student_id, added_by, status) VALUES
((SELECT id FROM bookings WHERE is_group_session = true LIMIT 1),
 (SELECT id FROM users WHERE email = 'sophia.johnson@student.com'),
 (SELECT id FROM users WHERE email = 'lisa.parent@email.com'),
 'confirmed'),
((SELECT id FROM bookings WHERE is_group_session = true LIMIT 1),
 (SELECT id FROM users WHERE email = 'emma.smith@student.com'),
 (SELECT id FROM users WHERE email = 'john.parent@email.com'),
 'confirmed');

-- Note: Default password for all accounts is 'password123'