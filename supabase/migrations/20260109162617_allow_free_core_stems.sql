/*
  # Allow Free Core Stems
  
  This migration updates the price constraint on the stems table to allow Core stems
  to be free (price = 0.00) while maintaining the 0.50-5.00 range for Additive stems.
  
  ## Changes
  
  1. **Stems Table**
    - Remove old price constraint that required minimum 0.50
    - Update all existing Core stems to price 0.00
    - Add new constraint allowing 0.00 for Core stems, 0.50-5.00 for Additive stems
  
  ## Business Logic
  
  - Core stems are ALWAYS free for Creators
  - Additive stems are priced between $0.50 and $5.00 for Sponsors to purchase
*/

-- Drop the old price constraint first
ALTER TABLE stems DROP CONSTRAINT IF EXISTS stems_price_usd_check;

-- Update all existing Core stems to be free (now that constraint is removed)
UPDATE stems SET price_usd = 0.00 WHERE stem_type = 'Core';

-- Add new constraint that enforces: Core = 0.00, Additive = 0.50-5.00
ALTER TABLE stems ADD CONSTRAINT stems_price_usd_check CHECK (
  (stem_type = 'Core' AND price_usd = 0.00) OR
  (stem_type = 'Additive' AND price_usd >= 0.50 AND price_usd <= 5.00)
);
