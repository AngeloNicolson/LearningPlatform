-- Enhance tutors table with additional profile fields
-- Adds education, certifications, languages, and experience details

-- Add new columns to tutors table
ALTER TABLE tutors
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['English']::TEXT[],
ADD COLUMN IF NOT EXISTS experience_description TEXT,
ADD COLUMN IF NOT EXISTS response_time_hours INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Comments for documentation
COMMENT ON COLUMN tutors.education IS 'Array of education entries: [{"degree": "M.Ed", "institution": "UCLA", "year": 2015}]';
COMMENT ON COLUMN tutors.certifications IS 'Array of certifications: [{"name": "Teaching Credential", "issuer": "State of CA", "year": 2020}]';
COMMENT ON COLUMN tutors.languages IS 'Languages the tutor can teach in';
COMMENT ON COLUMN tutors.experience_description IS 'Detailed description of teaching experience';
COMMENT ON COLUMN tutors.response_time_hours IS 'Average response time in hours for student inquiries';
COMMENT ON COLUMN tutors.avatar_url IS 'URL to tutor profile picture (optional, falls back to initials)';
