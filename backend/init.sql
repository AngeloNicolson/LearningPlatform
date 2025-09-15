-- Initialize DebateRank database
-- This script runs when the PostgreSQL container first starts

-- Create database if it doesn't exist (this is handled by POSTGRES_DB env var)
-- The database 'debaterank' is created automatically

-- Ensure proper permissions
GRANT ALL PRIVILEGES ON DATABASE debaterank TO debaterank;