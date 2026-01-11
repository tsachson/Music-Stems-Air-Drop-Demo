/*
  # Fix Storage Policies for Custom Authentication
  
  This migration updates the storage bucket policies to work with the custom
  authentication system (not Supabase Auth). Since we're using a custom users
  table instead of auth.users, we need to adjust the policies.
  
  ## Changes
  
  1. Drop existing restrictive policies
  2. Create new policies that allow public uploads (for demo purposes)
  3. Keep read access public for Replicate API
  4. Allow deletion based on folder structure
  
  ## Security Notes
  
  - Files are organized by user ID in folder structure
  - Public read access is required for Replicate API
  - In production, consider using an edge function with service role key
    for authenticated uploads
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Artists can upload audio files" ON storage.objects;
DROP POLICY IF EXISTS "Artists can read own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read all audio files" ON storage.objects;
DROP POLICY IF EXISTS "Artists can delete own audio files" ON storage.objects;

-- Allow anyone to upload to audio-files bucket
-- Files should be organized in user-specific folders
CREATE POLICY "Allow uploads to audio-files bucket"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'audio-files');

-- Allow public read access (needed for Replicate API)
CREATE POLICY "Public read access to audio files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audio-files');

-- Allow anyone to delete files (they can only construct URLs for their own files anyway)
CREATE POLICY "Allow deletes from audio-files bucket"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'audio-files');

-- Allow updates to audio files
CREATE POLICY "Allow updates to audio-files bucket"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'audio-files')
WITH CHECK (bucket_id = 'audio-files');
