-- Migration: Create universal subjects system
-- Renames grade_levels to subject_levels and creates subjects table
-- This enables dynamic subject management through admin panel

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(10),
  description TEXT,
  filter_label VARCHAR(100) NOT NULL DEFAULT 'Grade Level',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert existing subjects
INSERT INTO subjects (id, name, slug, icon, description, filter_label, display_order) VALUES
  ('math', 'Mathematics', 'math', '📐', 'Mathematical concepts from arithmetic to calculus', 'Grade Level', 1),
  ('science', 'Science', 'science', '🔬', 'Scientific exploration from elementary to college level', 'Grade Level', 2),
  ('bible', 'Bible Studies', 'bible', '📖', 'Biblical texts, history, and cultural understanding', 'Audience Level', 3),
  ('history', 'History', 'history', '📚', 'Historical events, eras, and civilizations', 'Historical Era', 4)
ON CONFLICT (id) DO NOTHING;

-- Rename grade_levels to subject_levels
ALTER TABLE grade_levels RENAME TO subject_levels;

-- Add subject_id column to link levels to their parent subject
ALTER TABLE subject_levels ADD COLUMN IF NOT EXISTS subject_id VARCHAR(100) REFERENCES subjects(id) ON DELETE CASCADE;

-- Populate subject_id based on existing subject field
UPDATE subject_levels SET subject_id = subject WHERE subject_id IS NULL;

-- Make subject_id NOT NULL after populating
ALTER TABLE subject_levels ALTER COLUMN subject_id SET NOT NULL;

-- Update topics table foreign key reference
-- Note: The column name stays as grade_level_id for now to avoid breaking existing code
-- We'll update variable names in the code separately
ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_grade_level_id_fkey;
ALTER TABLE topics ADD CONSTRAINT topics_subject_level_id_fkey
  FOREIGN KEY (grade_level_id) REFERENCES subject_levels(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subjects_slug ON subjects(slug);
CREATE INDEX IF NOT EXISTS idx_subject_levels_subject ON subject_levels(subject_id);

-- Add comment for clarity
COMMENT ON TABLE subjects IS 'Top-level subjects (Math, Science, Bible, etc.) with configurable filter labels';
COMMENT ON TABLE subject_levels IS 'Organizational levels within subjects (grade levels, audience levels, eras, etc.)';
COMMENT ON COLUMN subjects.filter_label IS 'Label for the filter group (e.g., "Grade Level", "Audience Level", "Historical Era")';
