/*
  # Add DSP Tracking to Remixes

  1. Changes
    - Add `dsp_uploads` JSONB field to track where remixes have been uploaded
    - Add `remix_file_url` text field to store the remix audio file location
    - Add `artwork_url` text field to store the remix cover art
    - Add `duration_seconds` integer field for remix duration
    - Add `status` text field to track remix workflow state
  
  2. Security
    - Update existing policies to allow creators to update their own remixes
  
  3. Notes
    - DSP uploads will be stored as JSONB: {"spotify": "uploaded", "apple_music": "pending", etc}
    - Status can be: 'draft', 'processing', 'published'
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'remixes' AND column_name = 'dsp_uploads'
  ) THEN
    ALTER TABLE remixes ADD COLUMN dsp_uploads jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'remixes' AND column_name = 'remix_file_url'
  ) THEN
    ALTER TABLE remixes ADD COLUMN remix_file_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'remixes' AND column_name = 'artwork_url'
  ) THEN
    ALTER TABLE remixes ADD COLUMN artwork_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'remixes' AND column_name = 'duration_seconds'
  ) THEN
    ALTER TABLE remixes ADD COLUMN duration_seconds integer DEFAULT 180;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'remixes' AND column_name = 'status'
  ) THEN
    ALTER TABLE remixes ADD COLUMN status text DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'published'));
  END IF;
END $$;

CREATE POLICY "Creators can update own remixes"
  ON remixes FOR UPDATE
  TO authenticated
  USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()))
  WITH CHECK (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));