-- Migration: Seed Remaining Tutor Content
-- Purpose: Add content for Emma, Kevin, David, Lisa, and Rachel
-- Author: System
-- Date: 2025-11-08

-- Emma (Algebra) - Intermediate algebra specialist
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'course-algebra-2-emma',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'emma.algebra@tutorplatform.com')),
  'Algebra II Complete Course',
  'Master advanced algebra concepts including quadratic equations, polynomials, rational expressions, and more. Perfect for high school students preparing for college-level math.',
  'course',
  'published',
  '{"lesson_count": 18, "duration_hours": 12, "difficulty": "intermediate", "includes": ["Video tutorials", "Practice problems", "Progress tracking", "Certificate"]}'::jsonb,
  134,
  35,
  NOW() - INTERVAL '4 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('course-algebra-2-emma', 'one_time', 64.99, 'USD', true);

-- Emma - Free worksheet bundle
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'resource-quadratic-worksheets-emma',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'emma.algebra@tutorplatform.com')),
  'Quadratic Equations Worksheet Bundle',
  'Free collection of 10 worksheets covering all aspects of quadratic equations. Includes factoring, completing the square, and the quadratic formula with answer keys.',
  'resource',
  'published',
  '{"pages": 25, "has_answer_key": true, "printable": true, "file_count": 10, "tags": ["free", "worksheets"]}'::jsonb,
  298,
  142,
  NOW() - INTERVAL '5 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('resource-quadratic-worksheets-emma', 'free', 0, 'USD', true);

-- Emma - Individual lesson
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'lesson-systems-equations-emma',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'emma.algebra@tutorplatform.com')),
  'Solving Systems of Equations',
  'Learn multiple methods to solve systems of equations including substitution, elimination, and graphing. Real-world applications included.',
  'lesson',
  'published',
  '{"duration_minutes": 60, "has_quiz": true, "difficulty": "intermediate"}'::jsonb,
  76,
  21,
  NOW() - INTERVAL '2 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('lesson-systems-equations-emma', 'one_time', 12.99, 'USD', true);


-- Kevin (Statistics) - Stats and probability expert
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'course-intro-statistics-kevin',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'kevin.stats@tutorplatform.com')),
  'Introduction to Statistics',
  'Comprehensive statistics course covering descriptive statistics, probability, distributions, hypothesis testing, and regression analysis. Ideal for college students and professionals.',
  'course',
  'published',
  '{"lesson_count": 20, "duration_hours": 15, "difficulty": "intermediate", "includes": ["Video lectures", "Excel templates", "Practice datasets", "R code examples"]}'::jsonb,
  87,
  22,
  NOW() - INTERVAL '3 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('course-intro-statistics-kevin', 'one_time', 74.99, 'USD', true);

-- Kevin - Free article
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'article-stats-mistakes-kevin',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'kevin.stats@tutorplatform.com')),
  '5 Common Statistical Mistakes to Avoid',
  'Free guide covering the most common mistakes students make when analyzing data and how to avoid them. Includes real examples and explanations.',
  'article',
  'published',
  '{"reading_minutes": 8, "tags": ["free", "statistics", "common mistakes"]}'::jsonb,
  167,
  89,
  NOW() - INTERVAL '4 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('article-stats-mistakes-kevin', 'free', 0, 'USD', true);


-- David (Physics) - Advanced physics instructor
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'course-ap-physics-david',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'david.physics@tutorplatform.com')),
  'AP Physics 1: Complete Preparation',
  'Full AP Physics 1 preparation course aligned with College Board curriculum. Covers mechanics, waves, and electricity with comprehensive exam prep strategies.',
  'course',
  'published',
  '{"lesson_count": 28, "duration_hours": 20, "difficulty": "advanced", "includes": ["HD video lessons", "Lab simulations", "Practice exams", "Study guides", "Office hours"]}'::jsonb,
  215,
  58,
  NOW() - INTERVAL '5 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('course-ap-physics-david', 'one_time', 99.99, 'USD', true);

-- David - Lesson on electricity
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'lesson-circuits-david',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'david.physics@tutorplatform.com')),
  'Electric Circuits: Series and Parallel',
  'Deep dive into electric circuits with hands-on examples. Learn to analyze series and parallel circuits, calculate resistance, current, and voltage.',
  'lesson',
  'published',
  '{"duration_minutes": 75, "has_quiz": true, "difficulty": "intermediate", "has_simulation": true}'::jsonb,
  143,
  37,
  NOW() - INTERVAL '2 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('lesson-circuits-david', 'one_time', 16.99, 'USD', true);

-- David - Free resource
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'resource-physics-equations-david',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'david.physics@tutorplatform.com')),
  'Physics Equations Reference Sheet',
  'Free downloadable reference sheet with all essential physics equations organized by topic. Perfect companion for any physics course.',
  'resource',
  'published',
  '{"pages": 6, "printable": true, "tags": ["free", "reference", "equations"]}'::jsonb,
  512,
  203,
  NOW() - INTERVAL '6 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('resource-physics-equations-david', 'free', 0, 'USD', true);

-- David - Monthly subscription
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'subscription-david-physics-vault',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'david.physics@tutorplatform.com')),
  'Physics Vault - All Access',
  'Unlimited access to my complete physics library including all courses, lessons, simulations, and resources. New content added weekly!',
  'bundle',
  'published',
  '{"includes_all_content": true, "new_content_weekly": true, "includes_simulations": true}'::jsonb,
  95,
  19,
  NOW() - INTERVAL '4 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, billing_interval, is_active)
VALUES ('subscription-david-physics-vault', 'subscription', 29.99, 'USD', 'monthly', true);


-- Lisa (Biology) - Life sciences specialist
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'course-cell-biology-lisa',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'lisa.bio@tutorplatform.com')),
  'Cell Biology Fundamentals',
  'Explore the fascinating world of cells! Learn about cell structure, organelles, cellular processes, mitosis, meiosis, and molecular biology basics.',
  'course',
  'published',
  '{"lesson_count": 14, "duration_hours": 10, "difficulty": "beginner", "includes": ["Animated videos", "Interactive diagrams", "Quizzes", "3D cell models"]}'::jsonb,
  112,
  28,
  NOW() - INTERVAL '3 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('course-cell-biology-lisa', 'one_time', 54.99, 'USD', true);

-- Lisa - Free study guide
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'article-photosynthesis-guide-lisa',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'lisa.bio@tutorplatform.com')),
  'Photosynthesis Explained: Complete Guide',
  'Free comprehensive guide to photosynthesis covering light reactions, Calvin cycle, and factors affecting the process. Perfect for exam prep!',
  'article',
  'published',
  '{"reading_minutes": 15, "tags": ["free", "photosynthesis", "study guide"], "has_diagrams": true}'::jsonb,
  245,
  118,
  NOW() - INTERVAL '5 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('article-photosynthesis-guide-lisa', 'free', 0, 'USD', true);


-- Rachel (Chemistry) - Chemistry wizard
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'course-general-chemistry-rachel',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'rachel.chem@tutorplatform.com')),
  'General Chemistry I',
  'Complete first-semester general chemistry course covering atomic structure, bonding, stoichiometry, gas laws, thermochemistry, and more. College-level content made accessible.',
  'course',
  'published',
  '{"lesson_count": 22, "duration_hours": 18, "difficulty": "intermediate", "includes": ["Video lectures", "Virtual lab experiments", "Problem sets", "Exam prep"]}'::jsonb,
  189,
  47,
  NOW() - INTERVAL '4 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('course-general-chemistry-rachel', 'one_time', 84.99, 'USD', true);

-- Rachel - Balancing equations lesson
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'lesson-balancing-equations-rachel',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'rachel.chem@tutorplatform.com')),
  'Mastering Chemical Equation Balancing',
  'Learn foolproof techniques for balancing chemical equations including simple reactions, redox reactions, and complex organic chemistry equations.',
  'lesson',
  'published',
  '{"duration_minutes": 50, "has_quiz": true, "difficulty": "beginner", "practice_problems": 50}'::jsonb,
  98,
  26,
  NOW() - INTERVAL '2 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('lesson-balancing-equations-rachel', 'one_time', 11.99, 'USD', true);

-- Rachel - Free periodic table resource
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'resource-periodic-table-rachel',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'rachel.chem@tutorplatform.com')),
  'Interactive Periodic Table Guide',
  'Free downloadable periodic table with detailed information about each element including electron configurations, common oxidation states, and fun facts.',
  'resource',
  'published',
  '{"pages": 3, "printable": true, "high_resolution": true, "tags": ["free", "periodic table", "reference"]}'::jsonb,
  387,
  176,
  NOW() - INTERVAL '6 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('resource-periodic-table-rachel', 'free', 0, 'USD', true);

-- Rachel - Lab techniques course
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'course-lab-techniques-rachel',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'rachel.chem@tutorplatform.com')),
  'Essential Chemistry Lab Techniques',
  'Master fundamental lab skills including titration, distillation, chromatography, and spectroscopy. Includes safety protocols and best practices.',
  'course',
  'published',
  '{"lesson_count": 10, "duration_hours": 8, "difficulty": "intermediate", "includes": ["Video demonstrations", "Safety guidelines", "Lab reports templates"]}'::jsonb,
  124,
  31,
  NOW() - INTERVAL '3 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('course-lab-techniques-rachel', 'one_time', 44.99, 'USD', true);

-- Rachel - Subscription
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'subscription-rachel-chem-library',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'rachel.chem@tutorplatform.com')),
  'Chemistry Library - Premium Access',
  'Full access to all my chemistry courses, lessons, and lab resources. Perfect for serious chemistry students. New labs and content added monthly!',
  'bundle',
  'published',
  '{"includes_all_content": true, "new_content_monthly": true}'::jsonb,
  78,
  16,
  NOW() - INTERVAL '4 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, billing_interval, is_active)
VALUES ('subscription-rachel-chem-library', 'subscription', 27.99, 'USD', 'monthly', true);


-- Update tutor content_count to match actual content
UPDATE tutors SET content_count = (
  SELECT COUNT(*) FROM tutor_content WHERE tutor_content.tutor_id = tutors.id AND status = 'published'
);

-- Summary of added content:
-- Emma (Algebra): 3 items (1 course, 1 lesson, 1 free resource)
-- Kevin (Statistics): 2 items (1 course, 1 free article)
-- David (Physics): 4 items (1 course, 1 lesson, 1 free resource, 1 subscription)
-- Lisa (Biology): 2 items (1 course, 1 free article)
-- Rachel (Chemistry): 5 items (2 courses, 1 lesson, 1 free resource, 1 subscription)
-- Total new content: 16 items
-- Grand total across all tutors: 26 content items
