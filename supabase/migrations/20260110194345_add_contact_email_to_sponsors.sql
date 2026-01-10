/*
  # Add Contact Email Field to Sponsors Table

  1. Changes
    - Add `contact_email` column to sponsors table for business contact email
  
  2. Notes
    - This field is optional and used for business/public contact information
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsors' AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE sponsors ADD COLUMN contact_email text;
  END IF;
END $$;