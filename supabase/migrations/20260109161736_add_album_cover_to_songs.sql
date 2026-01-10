/*
  # Add Album Cover Support to Songs
  
  This migration adds album cover image support to the songs table.
  
  ## Changes
  
  1. **Songs Table**
    - Add `album_cover_url` column to store image URLs
    - Column is optional (nullable) since existing songs may not have covers
*/

-- Add album cover column to songs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'songs' AND column_name = 'album_cover_url'
  ) THEN
    ALTER TABLE songs ADD COLUMN album_cover_url text;
  END IF;
END $$;
