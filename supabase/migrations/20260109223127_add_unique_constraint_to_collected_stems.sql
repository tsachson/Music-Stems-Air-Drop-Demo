/*
  # Add Unique Constraint to Collected Stems
  
  1. Changes
    - Add UNIQUE constraint on (creator_id, stem_id) to prevent duplicate collections
    - This ensures creators can't collect the same stem twice
  
  2. Notes
    - This is a data integrity improvement for the demo
    - Prevents errors when auto-collecting Core stems that might already be collected
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'collected_stems_creator_stem_unique'
  ) THEN
    ALTER TABLE collected_stems 
    ADD CONSTRAINT collected_stems_creator_stem_unique 
    UNIQUE (creator_id, stem_id);
  END IF;
END $$;
