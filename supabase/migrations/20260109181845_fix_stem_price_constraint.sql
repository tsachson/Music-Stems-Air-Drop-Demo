/*
  # Fix Stem Price Constraint for Core Stems

  1. Changes
    - Drop existing price constraint that required minimum $0.50
    - Add new constraint allowing $0 for Core stems and $0.50-$5.00 for Additive stems

  2. Important Notes
    - Core stems must be free ($0)
    - Additive stems must be between $0.50 and $5.00
    - This enables the proper business logic for the platform
*/

DO $$
BEGIN
  -- Drop existing price constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'stems_price_usd_check'
  ) THEN
    ALTER TABLE stems DROP CONSTRAINT stems_price_usd_check;
  END IF;

  -- Add new constraint that allows $0 for Core stems
  ALTER TABLE stems ADD CONSTRAINT stems_price_usd_check 
    CHECK (
      (stem_type = 'Core' AND price_usd = 0) OR 
      (stem_type = 'Additive' AND price_usd >= 0.50 AND price_usd <= 5.00)
    );
END $$;
