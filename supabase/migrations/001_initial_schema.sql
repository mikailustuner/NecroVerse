-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploading',
  conversion_url TEXT,
  metadata JSONB,
  storage_path TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Graveyard logs table
CREATE TABLE IF NOT EXISTS graveyard_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);
CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);
CREATE INDEX IF NOT EXISTS idx_graveyard_logs_file_id ON graveyard_logs(file_id);
CREATE INDEX IF NOT EXISTS idx_graveyard_logs_timestamp ON graveyard_logs(timestamp);

-- Row Level Security - DISABLED for development
-- Uncomment below to enable RLS in production

-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE files ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE graveyard_logs ENABLE ROW LEVEL SECURITY;

-- Policies for profiles (disabled)
-- CREATE POLICY "Users can view their own profile"
--   ON profiles FOR SELECT
--   USING (auth.uid() = id);

-- CREATE POLICY "Users can update their own profile"
--   ON profiles FOR UPDATE
--   USING (auth.uid() = id);

-- Policies for files (disabled)
-- CREATE POLICY "Users can view their own files"
--   ON files FOR SELECT
--   USING (auth.uid() = user_id OR user_id IS NULL);

-- CREATE POLICY "Users can insert their own files"
--   ON files FOR INSERT
--   WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own files"
--   ON files FOR UPDATE
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete their own files"
--   ON files FOR DELETE
--   USING (auth.uid() = user_id);

-- Policies for graveyard_logs (disabled)
-- CREATE POLICY "Users can view logs for their files"
--   ON graveyard_logs FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM files
--       WHERE files.id = graveyard_logs.file_id
--       AND (files.user_id = auth.uid() OR files.user_id IS NULL)
--     )
--   );

-- CREATE POLICY "Service role can insert logs"
--   ON graveyard_logs FOR INSERT
--   WITH CHECK (true);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

