-- Migration: Content Files
-- Purpose: File attachments for tutor content (PDFs, ZIPs, videos, images)
-- Author: System
-- Date: 2025-11-08

-- Create content_files table
CREATE TABLE IF NOT EXISTS content_files (
  id SERIAL PRIMARY KEY,
  content_id VARCHAR(255) NOT NULL REFERENCES tutor_content(id) ON DELETE CASCADE,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('pdf', 'zip', 'video', 'image', 'document')),
  storage_provider VARCHAR(50) DEFAULT 'filesystem',
  storage_key VARCHAR(500) NOT NULL,
  storage_key_encrypted VARCHAR(500),
  original_filename VARCHAR(255),
  file_size BIGINT,
  mime_type VARCHAR(100),
  malware_scanned BOOLEAN DEFAULT false,
  scan_result VARCHAR(20),
  scan_date TIMESTAMP,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_file_content ON content_files(content_id);
CREATE INDEX IF NOT EXISTS idx_file_type ON content_files(file_type);
CREATE INDEX IF NOT EXISTS idx_file_scan ON content_files(malware_scanned, scan_result);
CREATE INDEX IF NOT EXISTS idx_file_storage ON content_files(storage_provider, storage_key);

-- Comment the table
COMMENT ON TABLE content_files IS 'File attachments for tutor content (PDFs, videos, ZIPs, etc.)';
COMMENT ON COLUMN content_files.content_id IS 'Parent content this file belongs to';
COMMENT ON COLUMN content_files.file_type IS 'File category: pdf, zip, video, image, document';
COMMENT ON COLUMN content_files.storage_provider IS 'Where file is stored: filesystem, s3, cloudinary';
COMMENT ON COLUMN content_files.storage_key IS 'Storage location (filesystem path or S3 key)';
COMMENT ON COLUMN content_files.storage_key_encrypted IS 'Optional encrypted storage key for sensitive content';
COMMENT ON COLUMN content_files.original_filename IS 'Original filename from upload';
COMMENT ON COLUMN content_files.file_size IS 'File size in bytes';
COMMENT ON COLUMN content_files.mime_type IS 'MIME type (e.g., application/pdf, video/mp4)';
COMMENT ON COLUMN content_files.malware_scanned IS 'Whether file has been scanned for malware';
COMMENT ON COLUMN content_files.scan_result IS 'Scan result: clean, threat_found, error';
COMMENT ON COLUMN content_files.scan_date IS 'When file was scanned';
COMMENT ON COLUMN content_files.display_order IS 'Order for displaying multiple files (e.g., course lessons)';

-- File types:
-- 'pdf' - PDF documents (worksheets, textbooks, study guides)
-- 'zip' - ZIP archives (bundled resources, project files)
-- 'video' - MP4, WebM, MOV (video lessons, tutorials)
-- 'image' - JPEG, PNG, GIF (diagrams, screenshots)
-- 'document' - Other documents (DOCX, PPTX, etc.)

-- Storage providers:
-- 'filesystem' - Local filesystem (current implementation)
-- 's3' - AWS S3 or compatible (future scalability)
-- 'cloudinary' - Cloudinary for images/videos (future optimization)
