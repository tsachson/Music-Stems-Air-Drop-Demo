/*
  # Add Remix Delete Policy

  1. Changes
    - Add DELETE policy for remixes table to allow creators to delete their own remixes

  2. Security
    - Creators can only delete remixes they created
*/

CREATE POLICY "Creators can delete own remixes"
  ON remixes FOR DELETE
  TO authenticated
  USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));
