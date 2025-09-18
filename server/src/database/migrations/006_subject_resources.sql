-- Add subject column to grade_levels table to categorize by subject
ALTER TABLE grade_levels ADD COLUMN IF NOT EXISTS subject VARCHAR(50) DEFAULT 'math';

-- Update existing grade levels to be math
UPDATE grade_levels SET subject = 'math' WHERE subject IS NULL;

-- Create subject_resources table for a more flexible approach
CREATE TABLE IF NOT EXISTS subject_resources (
  id VARCHAR(50) PRIMARY KEY,
  subject VARCHAR(50) NOT NULL CHECK (subject IN ('math', 'science', 'history')),
  topic_id VARCHAR(50) NOT NULL,
  topic_name VARCHAR(200) NOT NULL,
  topic_icon VARCHAR(10),
  resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('lessons', 'video', 'worksheet', 'practice', 'quiz', 'game', 'experiment', 'simulation', 'timeline', 'primary-source')),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  url TEXT,
  content TEXT,
  era VARCHAR(100), -- For history resources
  grade_level VARCHAR(100), -- For math/science resources
  visible BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Science grade levels
INSERT INTO grade_levels (id, name, grade_range, display_order, subject) VALUES
  ('science-elementary', 'Elementary Science', 'Grades K-5', 1, 'science'),
  ('science-middle', 'Middle School Science', 'Grades 6-8', 2, 'science'),
  ('science-high', 'High School Science', 'Grades 9-12', 3, 'science'),
  ('science-college', 'College Science', 'Undergraduate', 4, 'science')
ON CONFLICT (id) DO NOTHING;

-- Insert History grade levels (organized by era)
INSERT INTO grade_levels (id, name, grade_range, display_order, subject) VALUES
  ('history-colonial', 'Colonial America', '1607-1770', 1, 'history'),
  ('history-revolution', 'Revolutionary War', '1763-1790', 2, 'history'),
  ('history-early-republic', 'Early Republic', '1787-1815', 3, 'history'),
  ('history-westward', 'Westward Expansion', '1830-1860', 4, 'history'),
  ('history-civil-war', 'Civil War', '1850-1865', 5, 'history'),
  ('history-reconstruction', 'Reconstruction', '1865-1877', 6, 'history'),
  ('history-industrial', 'Industrial Age', '1870-1920', 7, 'history'),
  ('history-world-wars', 'World Wars Era', '1917-1945', 8, 'history'),
  ('history-cold-war', 'Cold War', '1945-1991', 9, 'history'),
  ('history-civil-rights', 'Civil Rights', '1954-1968', 10, 'history'),
  ('history-modern', 'Modern America', '1989-present', 11, 'history')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subject_resources_subject ON subject_resources(subject);
CREATE INDEX IF NOT EXISTS idx_subject_resources_topic ON subject_resources(topic_id);
CREATE INDEX IF NOT EXISTS idx_subject_resources_type ON subject_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_grade_levels_subject ON grade_levels(subject);

-- Add trigger for updated_at
CREATE TRIGGER update_subject_resources_updated_at BEFORE UPDATE ON subject_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();