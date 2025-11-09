-- Disable Row Level Security for all tables
-- This migration disables RLS to allow unrestricted access during development

-- Disable RLS on profiles table
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on files table
ALTER TABLE IF EXISTS files DISABLE ROW LEVEL SECURITY;

-- Disable RLS on graveyard_logs table
ALTER TABLE IF EXISTS graveyard_logs DISABLE ROW LEVEL SECURITY;

-- Drop existing policies (optional, but recommended for clean state)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own files" ON files;
DROP POLICY IF EXISTS "Users can insert their own files" ON files;
DROP POLICY IF EXISTS "Users can update their own files" ON files;
DROP POLICY IF EXISTS "Users can delete their own files" ON files;
DROP POLICY IF EXISTS "Users can view logs for their files" ON graveyard_logs;
DROP POLICY IF EXISTS "Service role can insert logs" ON graveyard_logs;

-- Storage bucket policies - Allow public access for development
-- Note: Make sure 'uploads' and 'converted' buckets exist in Supabase Storage

-- Allow public read access to uploads bucket (if needed)
-- UPDATE storage.buckets SET public = true WHERE id = 'uploads';

-- Allow public read access to converted bucket
-- UPDATE storage.buckets SET public = true WHERE id = 'converted';

-- Storage policies - Allow all operations for development
-- These policies allow anyone to upload, read, update, and delete files

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;

-- Create permissive storage policies for development
CREATE POLICY "Allow all operations on uploads"
ON storage.objects FOR ALL
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Allow all operations on converted"
ON storage.objects FOR ALL
USING (bucket_id = 'converted')
WITH CHECK (bucket_id = 'converted');

-- Note: To re-enable RLS in the future, create a new migration that:
-- 1. Re-enables RLS: ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
-- 2. Re-creates the necessary policies
-- 3. Updates storage policies to be more restrictive

