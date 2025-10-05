-- Documents table for uploaded files
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  category VARCHAR(50),
  resource_type VARCHAR(50),
  grade_level VARCHAR(50),
  topic_id VARCHAR(100),
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_topic ON documents(topic_id);
CREATE INDEX IF NOT EXISTS idx_documents_grade ON documents(grade_level);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(resource_type);
CREATE INDEX IF NOT EXISTS idx_documents_uploader ON documents(uploaded_by);

-- Create uploads directories (these will need to be created in the filesystem)
-- mkdir -p /app/uploads/worksheets
-- mkdir -p /app/uploads/images
