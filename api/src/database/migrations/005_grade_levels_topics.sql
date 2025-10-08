-- Grade Levels and Topics structure for Math and Science
-- This creates a hierarchical structure: Subject -> Grade Level -> Topics

CREATE TABLE IF NOT EXISTS grade_levels (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(50) NOT NULL CHECK (subject IN ('math', 'science', 'history')),
  grade_range VARCHAR(100),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update topics table to link to grade_levels
ALTER TABLE topics DROP COLUMN IF EXISTS subject;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS grade_level_id VARCHAR(100) REFERENCES grade_levels(id) ON DELETE CASCADE;

-- Insert Math Grade Levels
INSERT INTO grade_levels (id, name, subject, grade_range, display_order) VALUES
  ('math-elementary', 'Elementary Math', 'math', 'K-5', 1),
  ('math-middle', 'Middle School Math', 'math', '6-8', 2),
  ('math-high', 'High School Math', 'math', '9-12', 3),
  ('math-college', 'College Math', 'math', 'Undergraduate', 4)
ON CONFLICT (id) DO NOTHING;

-- Insert Math Topics
INSERT INTO topics (id, name, grade_level_id, icon, display_order) VALUES
  -- Elementary
  ('math-elem-arithmetic', 'Arithmetic', 'math-elementary', '➕', 1),
  ('math-elem-fractions', 'Fractions', 'math-elementary', '½', 2),
  ('math-elem-geometry', 'Basic Shapes', 'math-elementary', '🔷', 3),

  -- Middle School
  ('math-middle-algebra', 'Pre-Algebra', 'math-middle', '📐', 1),
  ('math-middle-geometry', 'Geometry', 'math-middle', '📏', 2),
  ('math-middle-ratios', 'Ratios & Proportions', 'math-middle', '⚖️', 3),

  -- High School
  ('math-high-algebra1', 'Algebra I', 'math-high', '🔢', 1),
  ('math-high-geometry', 'Geometry', 'math-high', '△', 2),
  ('math-high-algebra2', 'Algebra II', 'math-high', '📊', 3),
  ('math-high-precalc', 'Pre-Calculus', 'math-high', '📈', 4),

  -- College
  ('math-college-calculus', 'Calculus', 'math-college', '∫', 1),
  ('math-college-linear', 'Linear Algebra', 'math-college', '⊗', 2),
  ('math-college-stats', 'Statistics', 'math-college', '📉', 3)
ON CONFLICT (id) DO NOTHING;

-- Insert Science Grade Levels
INSERT INTO grade_levels (id, name, subject, grade_range, display_order) VALUES
  ('science-elementary', 'Elementary Science', 'science', 'K-5', 1),
  ('science-middle', 'Middle School Science', 'science', '6-8', 2),
  ('science-high', 'High School Science', 'science', '9-12', 3),
  ('science-college', 'College Science', 'science', 'Undergraduate', 4)
ON CONFLICT (id) DO NOTHING;

-- Insert Science Topics
INSERT INTO topics (id, name, grade_level_id, icon, display_order) VALUES
  -- Elementary
  ('science-elem-life', 'Life Science', 'science-elementary', '🌱', 1),
  ('science-elem-earth', 'Earth Science', 'science-elementary', '🌍', 2),
  ('science-elem-physical', 'Physical Science', 'science-elementary', '⚛️', 3),

  -- Middle School
  ('science-middle-biology', 'Biology', 'science-middle', '🧬', 1),
  ('science-middle-chemistry', 'Chemistry', 'science-middle', '⚗️', 2),
  ('science-middle-physics', 'Physics', 'science-middle', '🔬', 3),

  -- High School
  ('science-high-biology', 'Biology', 'science-high', '🧫', 1),
  ('science-high-chemistry', 'Chemistry', 'science-high', '🧪', 2),
  ('science-high-physics', 'Physics', 'science-high', '⚡', 3),

  -- College
  ('science-college-bio', 'Advanced Biology', 'science-college', '🔬', 1),
  ('science-college-chem', 'Advanced Chemistry', 'science-college', '⚛️', 2),
  ('science-college-physics', 'Advanced Physics', 'science-college', '🌌', 3)
ON CONFLICT (id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_grade_levels_subject ON grade_levels(subject);
CREATE INDEX IF NOT EXISTS idx_topics_grade_level ON topics(grade_level_id);
