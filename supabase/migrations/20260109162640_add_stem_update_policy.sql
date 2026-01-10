/*
  # Add Stem Update Policy
  
  This migration adds an UPDATE policy to allow artists to edit their stem prices
  and other stem properties.
  
  ## Changes
  
  1. **Stems Table**
    - Add UPDATE policy allowing public access for demo purposes
    - In production, this should be restricted to the stem's song's artist
  
  ## Security Notes
  
  - This is simplified for demo purposes
  - Production should verify artist ownership through song -> artist -> user_id chain
*/

-- Add UPDATE policy for stems (public for demo, should be restricted in production)
CREATE POLICY "Public can update stems"
  ON stems FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
