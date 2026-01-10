/*
  # Add Contact Information Fields to Artists Table

  1. Changes
    - Add `email` column to artists table for contact email
    - Add `phone` column to artists table for phone number
    - Add `location` column to artists table for location/address
  
  2. Notes
    - These fields are optional and used for artist profile/contact information
    - Email is separate from the user account email and used for public/business contact
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artists' AND column_name = 'email'
  ) THEN
    ALTER TABLE artists ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artists' AND column_name = 'phone'
  ) THEN
    ALTER TABLE artists ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artists' AND column_name = 'location'
  ) THEN
    ALTER TABLE artists ADD COLUMN location text;
  END IF;
END $$;