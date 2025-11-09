# Supabase Setup Guide

This guide will walk you through setting up Supabase for Necroverse.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: `necroverse` (or your choice)
   - Database password: (save this securely)
   - Region: (choose closest to you)
5. Wait for project to be created (2-3 minutes)

## Step 2: Get API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase/migrations/001_initial_schema.sql`
3. Copy its contents and paste into the SQL Editor
4. Click "Run" to execute the migration
5. Verify tables were created:
   - `profiles`
   - `files`
   - `graveyard_logs`

## Step 4: Create Storage Buckets

1. In Supabase dashboard, go to **Storage**
2. Click "New bucket"
3. Create bucket `uploads`:
   - Name: `uploads`
   - Public: **No** (private)
   - Allowed MIME types: `application/x-shockwave-flash,application/java-archive,application/x-silverlight-app,application/x-director`
   - Click "Create bucket"
4. Create bucket `converted`:
   - Name: `converted`
   - Public: **Yes** (public)
   - Allowed MIME types: `application/javascript,application/wasm,text/html`
   - Click "Create bucket"

## Step 5: Configure Storage Policies

1. Go to **Storage** → **Policies**
2. For `uploads` bucket:
   - Click "New Policy"
   - Policy name: "Allow authenticated uploads"
   - Allowed operation: `INSERT`
   - Policy definition:
     ```sql
     (bucket_id = 'uploads'::text) AND (auth.role() = 'authenticated'::text)
     ```
   - Click "Review" → "Save policy"
3. For `converted` bucket:
   - Public bucket, no additional policies needed

## Step 6: Configure Row Level Security (RLS)

The migration already sets up RLS policies, but verify:

1. Go to **Authentication** → **Policies**
2. Ensure policies exist for:
   - `profiles` table
   - `files` table
   - `graveyard_logs` table

## Step 7: Set Up Environment Variables

1. In your project root, create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. Replace the values with your actual Supabase credentials

## Step 8: Test Connection

1. Start the development server:
```bash
pnpm dev
```

2. Visit http://localhost:3001 (NecroDev)
3. Try uploading a test file
4. Check Supabase dashboard:
   - **Storage** → `uploads` bucket should show your file
   - **Table Editor** → `files` table should have a new row
   - **Table Editor** → `graveyard_logs` table should have log entries

## Troubleshooting

### "Failed to upload file"
- Check storage bucket policies
- Verify bucket names match exactly: `uploads` and `converted`
- Ensure MIME types are allowed in bucket settings

### "Row Level Security policy violation"
- Verify RLS policies in Supabase dashboard
- Check that policies allow the operations you're trying to perform
- For development, you can temporarily disable RLS (not recommended for production)

### "Real-time subscriptions not working"
- Ensure Supabase Realtime is enabled in project settings
- Check that the `graveyard_logs` table has replication enabled:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE graveyard_logs;
  ```

### "Service role key not working"
- Service role key should only be used server-side (API routes)
- Never expose service role key in client-side code
- Check that `.env.local` is in `.gitignore`

## Next Steps

Once Supabase is set up:

1. Test file upload in NecroDev
2. Verify conversion pipeline works
3. Test playback in NecroPlay
4. Check real-time log updates

For more help, see the [Supabase documentation](https://supabase.com/docs).

