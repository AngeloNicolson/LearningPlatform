-- Migration: Tutor Content Catalog
-- Purpose: Core table for tutor-created content (courses, lessons, articles, resources)
-- Author: System
-- Date: 2025-11-08

-- Create tutor_content table
CREATE TABLE IF NOT EXISTS tutor_content (
  id VARCHAR(255) PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('course', 'lesson', 'article', 'resource', 'bundle')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  metadata JSONB DEFAULT '{}',
  visibility VARCHAR(20) DEFAULT 'public',
  view_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_content_tutor ON tutor_content(tutor_id, status);
CREATE INDEX IF NOT EXISTS idx_content_type ON tutor_content(content_type, status);
CREATE INDEX IF NOT EXISTS idx_content_status ON tutor_content(status);
CREATE INDEX IF NOT EXISTS idx_content_created ON tutor_content(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tutor_content_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tutor_content_updated_at
  BEFORE UPDATE ON tutor_content
  FOR EACH ROW
  EXECUTE FUNCTION update_tutor_content_timestamp();

-- Comment the table
COMMENT ON TABLE tutor_content IS 'Tutor-created content catalog (courses, lessons, articles, resources)';
COMMENT ON COLUMN tutor_content.id IS 'Unique content ID (e.g., course-algebra-basics-tutor123)';
COMMENT ON COLUMN tutor_content.tutor_id IS 'Tutor who created this content';
COMMENT ON COLUMN tutor_content.title IS 'Content title';
COMMENT ON COLUMN tutor_content.description IS 'Detailed description (markdown supported)';
COMMENT ON COLUMN tutor_content.content_type IS 'Type: course, lesson, article, resource, bundle';
COMMENT ON COLUMN tutor_content.status IS 'Publication status: draft, published, archived';
COMMENT ON COLUMN tutor_content.metadata IS 'Type-specific data (JSONB for flexibility)';
COMMENT ON COLUMN tutor_content.visibility IS 'Visibility setting: public, unlisted, private';
COMMENT ON COLUMN tutor_content.view_count IS 'Number of times content detail page was viewed';
COMMENT ON COLUMN tutor_content.purchase_count IS 'Number of purchases (for analytics)';

-- Example metadata structures:
-- Course: { "lesson_count": 12, "duration_hours": 8, "difficulty": "intermediate", "curriculum": [...] }
-- Lesson: { "duration_minutes": 45, "video_url": "...", "has_quiz": true }
-- Article: { "markdown_content": "# Title\n\n...", "reading_minutes": 15, "tags": ["algebra"] }
-- Resource: { "pages": 5, "has_answer_key": true, "printable": true }
-- Bundle: { "included_content_ids": ["lesson-1", "lesson-2"], "discount_percent": 20 }
