/*
  # Stem Separation System

  This migration adds support for AI-powered stem separation using Replicate API.
  
  ## New Tables
  
  1. **separation_jobs**
    - `id` (uuid, primary key) - Unique job identifier
    - `song_id` (uuid, foreign key) - Reference to the song being processed
    - `artist_id` (uuid, foreign key) - Reference to the artist who owns the song
    - `status` (text) - Job status: 'pending', 'processing', 'completed', 'failed'
    - `replicate_prediction_id` (text) - Replicate API prediction ID for tracking
    - `original_audio_url` (text) - URL of the uploaded audio file
    - `separated_stems_urls` (jsonb) - URLs of separated stems {vocals, drums, bass, other}
    - `error_message` (text) - Error details if job failed
    - `created_at` (timestamptz) - When job was created
    - `completed_at` (timestamptz) - When job finished (success or failure)

  ## Modified Tables
  
  1. **songs**
    - Add `audio_file_url` (text) - URL of the original full song audio file
    - Add `has_separated_stems` (boolean) - Flag indicating if stems have been separated
    - Add `separation_job_id` (uuid) - Reference to the latest separation job

  ## Security
  
  - Enable RLS on separation_jobs table
  - Artists can only view and create their own separation jobs
  - Artists can update their own songs
*/

-- Add audio fields to songs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'songs' AND column_name = 'audio_file_url'
  ) THEN
    ALTER TABLE songs ADD COLUMN audio_file_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'songs' AND column_name = 'has_separated_stems'
  ) THEN
    ALTER TABLE songs ADD COLUMN has_separated_stems boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'songs' AND column_name = 'separation_job_id'
  ) THEN
    ALTER TABLE songs ADD COLUMN separation_job_id uuid;
  END IF;
END $$;

-- Create separation_jobs table
CREATE TABLE IF NOT EXISTS separation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid REFERENCES songs(id) NOT NULL,
  artist_id uuid REFERENCES artists(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  replicate_prediction_id text,
  original_audio_url text NOT NULL,
  separated_stems_urls jsonb,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE separation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists can view own separation jobs"
  ON separation_jobs FOR SELECT
  TO authenticated
  USING (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()));

CREATE POLICY "Artists can create separation jobs"
  ON separation_jobs FOR INSERT
  TO authenticated
  WITH CHECK (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()));

CREATE POLICY "Artists can update own separation jobs"
  ON separation_jobs FOR UPDATE
  TO authenticated
  USING (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()))
  WITH CHECK (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()));

-- Add policy for artists to update their own songs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'songs' AND policyname = 'Artists can update own songs'
  ) THEN
    CREATE POLICY "Artists can update own songs"
      ON songs FOR UPDATE
      TO authenticated
      USING (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()))
      WITH CHECK (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()));
  END IF;
END $$;

-- Add foreign key constraint for separation_job_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'songs_separation_job_id_fkey'
  ) THEN
    ALTER TABLE songs ADD CONSTRAINT songs_separation_job_id_fkey 
      FOREIGN KEY (separation_job_id) REFERENCES separation_jobs(id);
  END IF;
END $$;
