-- Subject Resources table
-- This table stores educational resources organized by subject, topic, and type
-- Links to documents table for downloadable files like worksheets

CREATE TABLE IF NOT EXISTS subject_resources (
  id VARCHAR(255) PRIMARY KEY,
  subject VARCHAR(50) NOT NULL CHECK (subject IN ('math', 'science', 'history')),
  topic_id VARCHAR(100),
  topic_name VARCHAR(255),
  topic_icon VARCHAR(10),
  resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('worksheet', 'video', 'quiz', 'game', 'lesson', 'article', 'experiment', 'simulation', 'primary-source')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT,
  content TEXT,
  era VARCHAR(100),
  grade_level VARCHAR(50),
  document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
  visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subject_resources_subject ON subject_resources(subject);
CREATE INDEX IF NOT EXISTS idx_subject_resources_topic ON subject_resources(topic_id);
CREATE INDEX IF NOT EXISTS idx_subject_resources_type ON subject_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_subject_resources_grade ON subject_resources(grade_level);
CREATE INDEX IF NOT EXISTS idx_subject_resources_document ON subject_resources(document_id);
CREATE INDEX IF NOT EXISTS idx_subject_resources_visible ON subject_resources(visible);
