-- Educational Resources Schema for Math Tutoring Platform

-- Grade levels (Elementary, Middle School, High School, College)
CREATE TABLE IF NOT EXISTS grade_levels (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  grade_range VARCHAR(50),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Topics within each grade level
CREATE TABLE IF NOT EXISTS topics (
  id VARCHAR(50) PRIMARY KEY,
  grade_level_id VARCHAR(50) NOT NULL REFERENCES grade_levels(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subtopics within each topic
CREATE TABLE IF NOT EXISTS subtopics (
  id VARCHAR(50) PRIMARY KEY,
  topic_id VARCHAR(50) NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resources (worksheets, videos, practice problems, quizzes)
CREATE TABLE IF NOT EXISTS resources (
  id VARCHAR(50) PRIMARY KEY,
  subtopic_id VARCHAR(50) NOT NULL REFERENCES subtopics(id) ON DELETE CASCADE,
  resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('worksheet', 'video', 'practice', 'quiz')),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  url TEXT,
  content TEXT,
  video_url TEXT,
  pdf_url TEXT,
  time_limit INT, -- For quizzes, in minutes
  visible BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- History articles for subtopics
CREATE TABLE IF NOT EXISTS history_articles (
  id VARCHAR(50) PRIMARY KEY,
  subtopic_id VARCHAR(50) NOT NULL REFERENCES subtopics(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT, -- Markdown formatted content
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id SERIAL PRIMARY KEY,
  resource_id VARCHAR(50) NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB, -- Array of answer options for multiple choice
  answer TEXT NOT NULL,
  explanation TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Practice problems
CREATE TABLE IF NOT EXISTS practice_problems (
  id SERIAL PRIMARY KEY,
  resource_id VARCHAR(50) NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  problem TEXT NOT NULL,
  solution TEXT,
  hint TEXT,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_topics_grade ON topics(grade_level_id);
CREATE INDEX idx_subtopics_topic ON subtopics(topic_id);
CREATE INDEX idx_resources_subtopic ON resources(subtopic_id);
CREATE INDEX idx_resources_type ON resources(resource_type);
CREATE INDEX idx_quiz_questions_resource ON quiz_questions(resource_id);
CREATE INDEX idx_practice_problems_resource ON practice_problems(resource_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_history_articles_updated_at BEFORE UPDATE ON history_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();