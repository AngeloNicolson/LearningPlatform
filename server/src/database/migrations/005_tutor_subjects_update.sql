-- Migration: Add specialized math and science tutors
-- This migration adds production-ready tutor data with specific subject specializations

-- First, let's update the existing tutors with more specific subject data
UPDATE tutors 
SET subjects = jsonb_build_object(
    'math_topics', ARRAY['Calculus I', 'Calculus II', 'Linear Algebra', 'Statistics', 'AP Calculus BC'],
    'science_subjects', ARRAY[]::text[]
)
WHERE display_name = 'Dr. Sarah Chen';

UPDATE tutors 
SET subjects = jsonb_build_object(
    'math_topics', ARRAY['Algebra I', 'Algebra II', 'Geometry', 'Pre-Calculus', 'SAT Math'],
    'science_subjects', ARRAY[]::text[]
)
WHERE display_name = 'Michael Rodriguez';

UPDATE tutors 
SET subjects = jsonb_build_object(
    'math_topics', ARRAY['Basic Arithmetic', 'Fractions & Decimals', 'Basic Geometry', 'Measurement & Data'],
    'science_subjects', ARRAY[]::text[]
)
WHERE display_name = 'Emily Watson';

UPDATE tutors 
SET subjects = jsonb_build_object(
    'math_topics', ARRAY['Calculus I', 'Calculus II', 'Differential Equations', 'Multivariable Calculus'],
    'science_subjects', ARRAY[]::text[]
)
WHERE display_name = 'David Kim';

-- Now insert new tutors with production data
-- First, insert the user accounts
INSERT INTO users (email, email_verified, password_hash, first_name, last_name, role, account_status) VALUES
-- Elementary Math Tutors
('jennifer.martinez@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Jennifer', 'Martinez', 'tutor', 'active'),
('robert.taylor@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Robert', 'Taylor', 'tutor', 'active'),
('amanda.wilson@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Amanda', 'Wilson', 'tutor', 'active'),
('kevin.anderson@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Kevin', 'Anderson', 'tutor', 'active'),

-- Middle School Math Tutors
('patricia.brown@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Patricia', 'Brown', 'tutor', 'active'),
('daniel.davis@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Daniel', 'Davis', 'tutor', 'active'),
('melissa.garcia@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Melissa', 'Garcia', 'tutor', 'active'),
('christopher.lee@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Christopher', 'Lee', 'tutor', 'active'),

-- High School Math Tutors
('stephanie.white@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Stephanie', 'White', 'tutor', 'active'),
('james.thompson@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'James', 'Thompson', 'tutor', 'active'),
('rachel.clark@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Rachel', 'Clark', 'tutor', 'active'),
('brian.harris@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Brian', 'Harris', 'tutor', 'active'),
('linda.martin@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Linda', 'Martin', 'tutor', 'active'),
('joseph.thomas@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Joseph', 'Thomas', 'tutor', 'active'),

-- College Math Tutors
('elizabeth.jackson@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Elizabeth', 'Jackson', 'tutor', 'active'),
('richard.moore@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Richard', 'Moore', 'tutor', 'active'),
('nancy.walker@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Nancy', 'Walker', 'tutor', 'active'),
('thomas.hall@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Thomas', 'Hall', 'tutor', 'active'),
('susan.allen@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Susan', 'Allen', 'tutor', 'active'),
('charles.young@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Charles', 'Young', 'tutor', 'active'),

-- Science Tutors
('dr.alan.physics@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Alan', 'Peterson', 'tutor', 'active'),
('maria.chemistry@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Maria', 'Rodriguez', 'tutor', 'active'),
('john.biology@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'John', 'Mitchell', 'tutor', 'active'),
('laura.earth@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Laura', 'Bennett', 'tutor', 'active'),
('paul.physics2@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Paul', 'Wright', 'tutor', 'active'),
('sandra.chemistry2@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Sandra', 'Lopez', 'tutor', 'active'),
('mark.biology2@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Mark', 'Evans', 'tutor', 'active'),
('diana.physics3@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Diana', 'Roberts', 'tutor', 'active'),
('frank.chemistry3@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Frank', 'Turner', 'tutor', 'active'),
('helen.biology3@tutors.com', true, '$2b$12$iAxtbEsxp4AnZDjhKRshO./qE1JB6tX45/D4e0HezDprHjDYldksm', 'Helen', 'Phillips', 'tutor', 'active');

-- Create tutor profiles for Elementary Math
INSERT INTO tutors (user_id, display_name, bio, subjects, grades, hourly_rate, accepts_group_sessions, min_group_size, max_group_size, group_pricing, rating, total_sessions, approval_status) VALUES
((SELECT id FROM users WHERE email = 'jennifer.martinez@tutors.com'),
 'Jennifer Martinez',
 'Certified elementary educator with 8 years of experience. I make math fun and accessible for young learners through games and visual learning.',
 '{"math_topics": ["Basic Arithmetic", "Counting & Number Sense", "Addition", "Subtraction"], "science_subjects": []}',
 ARRAY['elementary'],
 40.00, true, 2, 4, '{"type": "per_student", "discount": 10}', 4.85, 189, 'approved'),

((SELECT id FROM users WHERE email = 'robert.taylor@tutors.com'),
 'Robert Taylor',
 'Former elementary school teacher specializing in foundational math concepts. Patient approach with struggling students.',
 '{"math_topics": ["Basic Arithmetic", "Multiplication", "Division", "Word Problems"], "science_subjects": []}',
 ARRAY['elementary'],
 42.00, true, 2, 5, '{"type": "per_student", "discount": 12}', 4.78, 156, 'approved'),

((SELECT id FROM users WHERE email = 'amanda.wilson@tutors.com'),
 'Amanda Wilson',
 'Elementary math specialist focused on building strong number sense and problem-solving skills in grades K-5.',
 '{"math_topics": ["Basic Geometry", "Shapes & Patterns", "Spatial Reasoning"], "science_subjects": []}',
 ARRAY['elementary'],
 38.00, true, 2, 6, '{"type": "tiered", "rates": {"2": 70, "3-4": 100, "5-6": 120}}', 4.92, 234, 'approved'),

((SELECT id FROM users WHERE email = 'kevin.anderson@tutors.com'),
 'Kevin Anderson',
 'Interactive math tutor using manipulatives and visual aids to teach measurement, data, and fractions.',
 '{"math_topics": ["Measurement & Data", "Fractions & Decimals", "Time & Money"], "science_subjects": []}',
 ARRAY['elementary'],
 44.00, true, 2, 4, '{"type": "per_student", "discount": 15}', 4.81, 167, 'approved');

-- Create tutor profiles for Middle School Math
INSERT INTO tutors (user_id, display_name, bio, subjects, grades, hourly_rate, accepts_group_sessions, min_group_size, max_group_size, group_pricing, rating, total_sessions, approval_status) VALUES
((SELECT id FROM users WHERE email = 'patricia.brown@tutors.com'),
 'Patricia Brown',
 'Middle school math teacher with expertise in pre-algebra and building algebraic thinking skills.',
 '{"math_topics": ["Pre-Algebra", "Integers & Rational Numbers", "Algebraic Expressions"], "science_subjects": []}',
 ARRAY['middle_school'],
 50.00, true, 2, 4, '{"type": "per_student", "discount": 10}', 4.76, 198, 'approved'),

((SELECT id FROM users WHERE email = 'daniel.davis@tutors.com'),
 'Daniel Davis',
 'Specializing in middle school geometry and spatial reasoning. Great at preparing students for high school math.',
 '{"math_topics": ["Pre-Algebra", "Linear Equations", "Inequalities"], "science_subjects": []}',
 ARRAY['middle_school'],
 48.00, true, 2, 3, '{"type": "per_student", "discount": 8}', 4.83, 176, 'approved'),

((SELECT id FROM users WHERE email = 'melissa.garcia@tutors.com'),
 'Melissa Garcia',
 'Statistics and probability expert for middle schoolers. I make data analysis engaging and relevant.',
 '{"math_topics": ["Geometry", "Angles & Triangles", "Coordinate Plane"], "science_subjects": []}',
 ARRAY['middle_school'],
 52.00, false, 1, 1, '{}', 4.89, 145, 'approved'),

((SELECT id FROM users WHERE email = 'christopher.lee@tutors.com'),
 'Christopher Lee',
 'Middle school math coach specializing in ratios, proportions, and percentage problems.',
 '{"math_topics": ["Statistics & Probability", "Ratios & Proportions", "Percentages"], "science_subjects": []}',
 ARRAY['middle_school'],
 46.00, true, 2, 5, '{"type": "per_student", "discount": 12}', 4.71, 213, 'approved');

-- Create tutor profiles for High School Math
INSERT INTO tutors (user_id, display_name, bio, subjects, grades, hourly_rate, accepts_group_sessions, min_group_size, max_group_size, group_pricing, rating, total_sessions, approval_status) VALUES
((SELECT id FROM users WHERE email = 'stephanie.white@tutors.com'),
 'Stephanie White',
 'AP Calculus teacher with 12 years experience. Excellent track record of improving AP exam scores.',
 '{"math_topics": ["Algebra I", "Linear Functions", "Systems of Equations"], "science_subjects": []}',
 ARRAY['high_school'],
 65.00, true, 2, 3, '{"type": "per_student", "discount": 10}', 4.91, 267, 'approved'),

((SELECT id FROM users WHERE email = 'james.thompson@tutors.com'),
 'James Thompson',
 'High school math department chair specializing in Algebra II and Pre-Calculus preparation.',
 '{"math_topics": ["Algebra I", "Quadratic Functions", "Polynomials"], "science_subjects": []}',
 ARRAY['high_school'],
 60.00, true, 2, 4, '{"type": "per_student", "discount": 12}', 4.88, 234, 'approved'),

((SELECT id FROM users WHERE email = 'rachel.clark@tutors.com'),
 'Rachel Clark',
 'Geometry specialist with a focus on proof writing and spatial reasoning for high school students.',
 '{"math_topics": ["Algebra II", "Exponential Functions", "Logarithms", "Rational Functions"], "science_subjects": []}',
 ARRAY['high_school'],
 58.00, true, 2, 3, '{"type": "per_student", "discount": 8}', 4.82, 189, 'approved'),

((SELECT id FROM users WHERE email = 'brian.harris@tutors.com'),
 'Brian Harris',
 'Trigonometry and Pre-Calculus expert. I help students master complex concepts through clear explanations.',
 '{"math_topics": ["Algebra II", "Complex Numbers", "Sequences & Series"], "science_subjects": []}',
 ARRAY['high_school'],
 62.00, false, 1, 1, '{}', 4.79, 156, 'approved'),

((SELECT id FROM users WHERE email = 'linda.martin@tutors.com'),
 'Linda Martin',
 'SAT and ACT math preparation specialist with proven strategies for score improvement.',
 '{"math_topics": ["Geometry", "Proofs", "Circles", "Transformations"], "science_subjects": []}',
 ARRAY['high_school'],
 70.00, true, 2, 6, '{"type": "tiered", "rates": {"2": 130, "3-4": 180, "5-6": 220}}', 4.94, 312, 'approved'),

((SELECT id FROM users WHERE email = 'joseph.thomas@tutors.com'),
 'Joseph Thomas',
 'Former engineer teaching high school trigonometry and pre-calculus with real-world applications.',
 '{"math_topics": ["Trigonometry", "Pre-Calculus", "Polar Coordinates", "Vectors"], "science_subjects": []}',
 ARRAY['high_school'],
 68.00, true, 2, 4, '{"type": "per_student", "discount": 15}', 4.86, 198, 'approved');

-- Create tutor profiles for College Math
INSERT INTO tutors (user_id, display_name, bio, subjects, grades, hourly_rate, accepts_group_sessions, min_group_size, max_group_size, group_pricing, rating, total_sessions, approval_status) VALUES
((SELECT id FROM users WHERE email = 'elizabeth.jackson@tutors.com'),
 'Dr. Elizabeth Jackson',
 'University professor with PhD in Mathematics. Specializing in Calculus I and helping students transition to college math.',
 '{"math_topics": ["Calculus I", "Limits & Continuity", "Derivatives"], "science_subjects": []}',
 ARRAY['college'],
 85.00, true, 2, 3, '{"type": "per_student", "discount": 10}', 4.93, 234, 'approved'),

((SELECT id FROM users WHERE email = 'richard.moore@tutors.com'),
 'Richard Moore',
 'Graduate teaching assistant with expertise in Calculus II and integration techniques.',
 '{"math_topics": ["Calculus I", "Integrals", "Applications of Calculus"], "science_subjects": []}',
 ARRAY['college'],
 75.00, true, 2, 4, '{"type": "per_student", "discount": 12}', 4.87, 167, 'approved'),

((SELECT id FROM users WHERE email = 'nancy.walker@tutors.com'),
 'Nancy Walker',
 'Linear Algebra specialist helping students understand vector spaces and matrix operations.',
 '{"math_topics": ["Calculus II", "Integration Techniques", "Series & Sequences"], "science_subjects": []}',
 ARRAY['college'],
 80.00, false, 1, 1, '{}', 4.85, 145, 'approved'),

((SELECT id FROM users WHERE email = 'thomas.hall@tutors.com'),
 'Thomas Hall',
 'Statistics professor with experience in probability theory and data analysis for undergraduates.',
 '{"math_topics": ["Calculus II", "Parametric Equations", "Multivariable Calculus"], "science_subjects": []}',
 ARRAY['college'],
 78.00, true, 2, 5, '{"type": "per_student", "discount": 15}', 4.81, 189, 'approved'),

((SELECT id FROM users WHERE email = 'susan.allen@tutors.com'),
 'Dr. Susan Allen',
 'Discrete Mathematics expert covering logic, set theory, and graph theory for computer science students.',
 '{"math_topics": ["Linear Algebra", "Matrices", "Eigenvalues", "Vector Spaces"], "science_subjects": []}',
 ARRAY['college'],
 90.00, true, 2, 3, '{"type": "per_student", "discount": 10}', 4.96, 278, 'approved'),

((SELECT id FROM users WHERE email = 'charles.young@tutors.com'),
 'Charles Young',
 'Applied mathematics tutor helping with differential equations and mathematical modeling.',
 '{"math_topics": ["Statistics", "Discrete Mathematics", "Probability Theory"], "science_subjects": []}',
 ARRAY['college'],
 82.00, true, 2, 4, '{"type": "per_student", "discount": 12}', 4.89, 201, 'approved');

-- Create Science Tutor profiles
INSERT INTO tutors (user_id, display_name, bio, subjects, grades, hourly_rate, accepts_group_sessions, min_group_size, max_group_size, group_pricing, rating, total_sessions, approval_status) VALUES
((SELECT id FROM users WHERE email = 'dr.alan.physics@tutors.com'),
 'Dr. Alan Peterson',
 'Physics professor with 15 years of experience. Specializing in mechanics, electromagnetism, and AP Physics preparation.',
 '{"math_topics": [], "science_subjects": ["Physics", "AP Physics", "Mechanics", "Electromagnetism"]}',
 ARRAY['high_school', 'college'],
 95.00, true, 2, 4, '{"type": "per_student", "discount": 15}', 4.92, 312, 'approved'),

((SELECT id FROM users WHERE email = 'maria.chemistry@tutors.com'),
 'Maria Rodriguez',
 'Organic chemistry specialist with experience helping pre-med and chemistry majors excel in their courses.',
 '{"math_topics": [], "science_subjects": ["Chemistry", "Organic Chemistry", "AP Chemistry", "Biochemistry"]}',
 ARRAY['high_school', 'college'],
 85.00, true, 2, 3, '{"type": "per_student", "discount": 10}', 4.88, 234, 'approved'),

((SELECT id FROM users WHERE email = 'john.biology@tutors.com'),
 'John Mitchell',
 'Biology teacher with expertise in molecular biology, genetics, and ecology. Great for AP Biology prep.',
 '{"math_topics": [], "science_subjects": ["Biology", "AP Biology", "Molecular Biology", "Genetics"]}',
 ARRAY['high_school', 'college'],
 75.00, true, 2, 5, '{"type": "per_student", "discount": 12}', 4.85, 198, 'approved'),

((SELECT id FROM users WHERE email = 'laura.earth@tutors.com'),
 'Laura Bennett',
 'Earth Science educator specializing in geology, meteorology, and environmental science.',
 '{"math_topics": [], "science_subjects": ["Earth Science", "Geology", "Environmental Science", "Meteorology"]}',
 ARRAY['middle_school', 'high_school'],
 65.00, true, 2, 6, '{"type": "tiered", "rates": {"2": 120, "3-4": 170, "5-6": 210}}', 4.79, 156, 'approved'),

((SELECT id FROM users WHERE email = 'paul.physics2@tutors.com'),
 'Paul Wright',
 'Theoretical physics graduate student offering tutoring in quantum mechanics and thermodynamics.',
 '{"math_topics": [], "science_subjects": ["Physics", "Quantum Mechanics", "Thermodynamics", "Modern Physics"]}',
 ARRAY['college'],
 88.00, false, 1, 1, '{}', 4.91, 145, 'approved'),

((SELECT id FROM users WHERE email = 'sandra.chemistry2@tutors.com'),
 'Sandra Lopez',
 'Inorganic and analytical chemistry expert helping students master lab techniques and chemical equations.',
 '{"math_topics": [], "science_subjects": ["Chemistry", "Inorganic Chemistry", "Analytical Chemistry", "Physical Chemistry"]}',
 ARRAY['college'],
 80.00, true, 2, 4, '{"type": "per_student", "discount": 10}', 4.83, 167, 'approved'),

((SELECT id FROM users WHERE email = 'mark.biology2@tutors.com'),
 'Mark Evans',
 'Anatomy and physiology specialist perfect for pre-nursing and pre-medical students.',
 '{"math_topics": [], "science_subjects": ["Biology", "Anatomy", "Physiology", "Microbiology"]}',
 ARRAY['college'],
 78.00, true, 2, 3, '{"type": "per_student", "discount": 8}', 4.87, 189, 'approved'),

((SELECT id FROM users WHERE email = 'diana.physics3@tutors.com'),
 'Diana Roberts',
 'High school physics teacher with a talent for making complex concepts accessible to all students.',
 '{"math_topics": [], "science_subjects": ["Physics", "General Physics", "AP Physics 1", "AP Physics 2"]}',
 ARRAY['high_school'],
 70.00, true, 2, 5, '{"type": "per_student", "discount": 12}', 4.81, 223, 'approved'),

((SELECT id FROM users WHERE email = 'frank.chemistry3@tutors.com'),
 'Frank Turner',
 'General chemistry tutor with focus on problem-solving strategies and exam preparation.',
 '{"math_topics": [], "science_subjects": ["Chemistry", "General Chemistry", "Chemical Equations", "Stoichiometry"]}',
 ARRAY['high_school', 'college'],
 72.00, true, 2, 4, '{"type": "per_student", "discount": 10}', 4.84, 201, 'approved'),

((SELECT id FROM users WHERE email = 'helen.biology3@tutors.com'),
 'Helen Phillips',
 'Ecology and environmental biology expert with field research experience.',
 '{"math_topics": [], "science_subjects": ["Biology", "Ecology", "Environmental Biology", "Botany"]}',
 ARRAY['high_school', 'college'],
 68.00, true, 2, 6, '{"type": "tiered", "rates": {"2": 125, "3-4": 175, "5-6": 215}}', 4.86, 178, 'approved');

-- Add availability for new tutors (sample schedules)
-- Elementary tutors - mostly afternoon availability
INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time) 
SELECT t.id, day, '15:00', '19:00'
FROM tutors t
CROSS JOIN generate_series(1, 5) AS day
WHERE t.user_id IN (
    SELECT id FROM users WHERE email IN (
        'jennifer.martinez@tutors.com', 'robert.taylor@tutors.com', 
        'amanda.wilson@tutors.com', 'kevin.anderson@tutors.com'
    )
);

-- Middle/High School tutors - afternoon and evening
INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time) 
SELECT t.id, day, '16:00', '20:00'
FROM tutors t
CROSS JOIN generate_series(1, 5) AS day
WHERE t.user_id IN (
    SELECT id FROM users WHERE email IN (
        'patricia.brown@tutors.com', 'daniel.davis@tutors.com',
        'stephanie.white@tutors.com', 'james.thompson@tutors.com'
    )
);

-- College tutors - flexible hours including weekends
INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time) 
SELECT t.id, day, '10:00', '21:00'
FROM tutors t
CROSS JOIN generate_series(0, 6) AS day
WHERE t.user_id IN (
    SELECT id FROM users WHERE email IN (
        'elizabeth.jackson@tutors.com', 'richard.moore@tutors.com'
    )
);

-- Science tutors - varied schedules
INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time) 
SELECT t.id, day, '14:00', '20:00'
FROM tutors t
CROSS JOIN generate_series(1, 6) AS day
WHERE t.user_id IN (
    SELECT id FROM users WHERE email LIKE '%physics%' OR email LIKE '%chemistry%' OR email LIKE '%biology%'
);

-- Update total_hours for realistic data
UPDATE tutors SET total_hours = total_sessions * 1.5 WHERE total_sessions > 0;