-- Remove redundant columns from documents table
-- These fields should only exist in subject_resources/resources tables

ALTER TABLE documents DROP COLUMN IF EXISTS category;
ALTER TABLE documents DROP COLUMN IF EXISTS resource_type;
ALTER TABLE documents DROP COLUMN IF EXISTS grade_level;
ALTER TABLE documents DROP COLUMN IF EXISTS topic_id;
