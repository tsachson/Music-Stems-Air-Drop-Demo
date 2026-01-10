/*
  # Fix Remix Delete Policy for Custom Auth

  1. Changes
    - Drop the auth-based DELETE policy that doesn't work with custom authentication
    - Add a public DELETE policy that works with custom auth (demo purposes)

  2. Security
    - This is simplified for demo purposes
    - Production apps should implement proper authentication middleware
*/

-- Drop the auth-based delete policy
DROP POLICY IF EXISTS "Creators can delete own remixes" ON remixes;

-- Add public delete policy for demo purposes
CREATE POLICY "Public can delete remixes"
  ON remixes FOR DELETE
  TO anon, authenticated
  USING (true);
