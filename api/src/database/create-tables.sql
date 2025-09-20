-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(255) PRIMARY KEY,
    subject VARCHAR(50),
    topic_id VARCHAR(100),
    topic_name VARCHAR(255),
    topic_icon VARCHAR(10),
    subtopic_id INTEGER,
    resource_type VARCHAR(50) CHECK (resource_type IN ('worksheet', 'video', 'practice', 'quiz', 'game', 'lessons')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT,
    content TEXT,
    video_url TEXT,
    pdf_url TEXT,
    time_limit INTEGER,
    grade_level VARCHAR(50),
    visible BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject);
CREATE INDEX IF NOT EXISTS idx_resources_subject_type ON resources(subject, resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_grade_level ON resources(grade_level);
CREATE INDEX IF NOT EXISTS idx_resources_visible ON resources(visible);
CREATE INDEX IF NOT EXISTS idx_resources_topic_id ON resources(topic_id);