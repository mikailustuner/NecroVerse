-- Migration: Add is_public field and fix table name inconsistencies
-- This migration adds the is_public field to files table and creates an alias view for graveyard_files

-- Add is_public column to files table if it doesn't exist
ALTER TABLE files ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Create index on is_public for faster queries
CREATE INDEX IF NOT EXISTS idx_files_is_public ON files(is_public);

-- Create a view for graveyard_files to maintain backward compatibility
-- This allows code using 'graveyard_files' to work with the 'files' table
CREATE OR REPLACE VIEW graveyard_files AS
SELECT 
  id,
  name,
  type,
  size,
  status,
  conversion_url,
  metadata,
  storage_path,
  user_id,
  is_public,
  created_at,
  updated_at
FROM files;

-- Grant permissions on the view
GRANT SELECT, INSERT, UPDATE, DELETE ON graveyard_files TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON graveyard_files TO anon;

-- Add comment explaining the view
COMMENT ON VIEW graveyard_files IS 'Alias view for files table to maintain backward compatibility';

