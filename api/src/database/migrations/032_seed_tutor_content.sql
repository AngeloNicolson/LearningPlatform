-- Migration: Seed Tutor Content
-- Purpose: Create sample courses, lessons, articles, and resources for testing
-- Author: System
-- Date: 2025-11-08

-- Sarah (Math) - Algebra specialist
-- Course: Complete Algebra Fundamentals
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'course-algebra-fundamentals-sarah',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'sarah.math@tutorplatform.com')),
  'Complete Algebra Fundamentals',
  'Master algebra from basics to advanced topics. This comprehensive course covers equations, inequalities, functions, and graphing. Perfect for high school students or anyone looking to strengthen their algebra skills.',
  'course',
  'published',
  '{"lesson_count": 12, "duration_hours": 8, "difficulty": "beginner", "includes": ["Video lessons", "Practice worksheets", "Quizzes", "Answer keys"]}'::jsonb,
  156,
  42,
  NOW() - INTERVAL '3 months'
);

-- Pricing for Sarah's algebra course
INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('course-algebra-fundamentals-sarah', 'one_time', 49.99, 'USD', true);

-- Sarah - Individual Lesson
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'lesson-solving-equations-sarah',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'sarah.math@tutorplatform.com')),
  'Solving Linear Equations: Step-by-Step Guide',
  'Learn how to solve linear equations with confidence. This lesson covers one-step, two-step, and multi-step equations with clear examples and practice problems.',
  'lesson',
  'published',
  '{"duration_minutes": 45, "has_quiz": true, "difficulty": "beginner"}'::jsonb,
  89,
  28,
  NOW() - INTERVAL '2 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('lesson-solving-equations-sarah', 'one_time', 9.99, 'USD', true);

-- Sarah - Free article (lead magnet)
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'article-algebra-tips-sarah',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'sarah.math@tutorplatform.com')),
  '10 Essential Algebra Study Tips',
  'Free guide with my top 10 tips for mastering algebra. Learn the study strategies that helped my students improve their grades by an average of 15%!',
  'article',
  'published',
  '{"reading_minutes": 10, "tags": ["study tips", "algebra", "free"]}'::jsonb,
  234,
  87,
  NOW() - INTERVAL '4 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('article-algebra-tips-sarah', 'free', 0, 'USD', true);

-- Sarah - Resource (worksheet)
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'resource-geometry-worksheets-sarah',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'sarah.math@tutorplatform.com')),
  'Geometry Practice Worksheets Pack',
  'Collection of 20 printable geometry worksheets covering triangles, circles, area, perimeter, and volume. Includes complete answer keys.',
  'resource',
  'published',
  '{"pages": 40, "has_answer_key": true, "printable": true, "file_count": 20}'::jsonb,
  67,
  19,
  NOW() - INTERVAL '1 month'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('resource-geometry-worksheets-sarah', 'one_time', 14.99, 'USD', true);

-- Sarah - Subscription offering
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'subscription-sarah-all-access',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'sarah.math@tutorplatform.com')),
  'Sarah''s Math Library - All Access Pass',
  'Get unlimited access to ALL my courses, lessons, and resources with a monthly subscription. New content added every month! Cancel anytime.',
  'bundle',
  'published',
  '{"includes_all_content": true, "new_content_monthly": true}'::jsonb,
  112,
  23,
  NOW() - INTERVAL '5 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, billing_interval, is_active)
VALUES ('subscription-sarah-all-access', 'subscription', 24.99, 'USD', 'monthly', true);


-- James (Calculus) - Advanced content
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'course-calculus-mastery-james',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'james.calc@tutorplatform.com')),
  'Calculus I: From Limits to Integration',
  'Complete Calculus I course covering limits, derivatives, applications of derivatives, and introduction to integration. Designed for college students and AP Calculus preparation.',
  'course',
  'published',
  '{"lesson_count": 24, "duration_hours": 16, "difficulty": "advanced", "includes": ["Video lectures", "Problem sets", "Exam prep", "Office hours access"]}'::jsonb,
  203,
  67,
  NOW() - INTERVAL '6 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('course-calculus-mastery-james', 'one_time', 89.99, 'USD', true);

-- James - Advanced lesson
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'lesson-derivatives-james',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'james.calc@tutorplatform.com')),
  'Understanding Derivatives: The Complete Guide',
  'Deep dive into derivatives including power rule, product rule, quotient rule, and chain rule. Includes real-world applications and challenging problems.',
  'lesson',
  'published',
  '{"duration_minutes": 90, "has_quiz": true, "difficulty": "advanced"}'::jsonb,
  145,
  38,
  NOW() - INTERVAL '4 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('lesson-derivatives-james', 'one_time', 19.99, 'USD', true);

-- James - Free resource
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'resource-calc-formulas-james',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'james.calc@tutorplatform.com')),
  'Essential Calculus Formulas Cheat Sheet',
  'Free downloadable cheat sheet with all essential calculus formulas organized by topic. Perfect for exam preparation!',
  'resource',
  'published',
  '{"pages": 4, "printable": true, "tags": ["free", "cheat sheet", "formulas"]}'::jsonb,
  421,
  156,
  NOW() - INTERVAL '7 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('resource-calc-formulas-james', 'free', 0, 'USD', true);


-- Mike (Science) - Physics content
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'course-physics-mechanics-mike',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'mike.science@tutorplatform.com')),
  'Physics: Classical Mechanics Fundamentals',
  'Learn the foundations of physics with this comprehensive mechanics course. Covers kinematics, forces, energy, momentum, and rotational motion with interactive simulations.',
  'course',
  'published',
  '{"lesson_count": 15, "duration_hours": 10, "difficulty": "intermediate", "includes": ["Video lessons", "Interactive simulations", "Lab exercises", "Problem sets"]}'::jsonb,
  98,
  31,
  NOW() - INTERVAL '2 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('course-physics-mechanics-mike', 'one_time', 59.99, 'USD', true);

-- Mike - Article
INSERT INTO tutor_content (id, tutor_id, title, description, content_type, status, metadata, view_count, purchase_count, created_at)
VALUES (
  'article-science-fun-mike',
  (SELECT id FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'mike.science@tutorplatform.com')),
  'Making Science Fun: Experiments You Can Do at Home',
  'Free guide to conducting safe and educational science experiments at home using common household items. Perfect for parents and students!',
  'article',
  'published',
  '{"reading_minutes": 12, "tags": ["experiments", "hands-on", "free"]}'::jsonb,
  187,
  62,
  NOW() - INTERVAL '3 months'
);

INSERT INTO content_pricing (content_id, pricing_model, price_amount, currency, is_active)
VALUES ('article-science-fun-mike', 'free', 0, 'USD', true);


-- Update tutor content_count to match actual content
UPDATE tutors SET content_count = (
  SELECT COUNT(*) FROM tutor_content WHERE tutor_content.tutor_id = tutors.id AND status = 'published'
);

-- Summary of seed data:
-- Sarah (Math): 5 items (1 course, 1 lesson, 1 article, 1 resource, 1 subscription)
-- James (Calculus): 3 items (1 course, 1 lesson, 1 resource)
-- Mike (Science): 2 items (1 course, 1 article)
-- Total: 10 content items across 3 tutors
