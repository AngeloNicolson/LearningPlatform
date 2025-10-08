-- Add document_id column to resources table
-- This links uploaded PDFs/files to resource entries

ALTER TABLE resources
ADD COLUMN IF NOT EXISTS document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_resources_document ON resources(document_id);
