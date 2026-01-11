/*
  # Create Storage Bucket for Audio Files
  
  This migration creates a storage bucket for storing uploaded audio files
  that will be processed by the AI stem separator.
  
  ## New Storage Resources
  
  1. **audio-files bucket**
    - Public bucket for storing audio files
    - Artists can upload their own audio files
    - Files are publicly accessible for processing by Replicate API
  
  ## Security
  
  - Artists can only upload to their own folder
  - Artists can only delete their own files
  - Public read access for processing
*/

-- Create the storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-files', 'audio-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload audio files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Artists can upload audio files'
  ) THEN
    CREATE POLICY "Artists can upload audio files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'audio-files' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Allow authenticated users to read their own audio files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Artists can read own audio files'
  ) THEN
    CREATE POLICY "Artists can read own audio files"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'audio-files' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Allow public read access for all audio files (needed for Replicate API)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can read all audio files'
  ) THEN
    CREATE POLICY "Public can read all audio files"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'audio-files');
  END IF;
END $$;

-- Allow authenticated users to delete their own audio files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Artists can delete own audio files'
  ) THEN
    CREATE POLICY "Artists can delete own audio files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'audio-files' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;
