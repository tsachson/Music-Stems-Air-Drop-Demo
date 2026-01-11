/*
  # Fix Separation Jobs RLS for Custom Authentication
  
  This migration updates the RLS policies on the separation_jobs table to work with
  the custom authentication system (not Supabase Auth).
  
  ## Changes
  
  1. Drop existing policies that rely on auth.uid()
  2. Create new public policies that allow operations
  
  ## Security Notes
  
  - Since we're using custom authentication stored in session storage,
    we can't use auth.uid() in policies
  - Frontend code enforces user context
  - Edge functions use service role key to bypass RLS when needed
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Artists can view own separation jobs" ON separation_jobs;
DROP POLICY IF EXISTS "Artists can create separation jobs" ON separation_jobs;
DROP POLICY IF EXISTS "Artists can update own separation jobs" ON separation_jobs;

-- Allow public to create separation jobs
CREATE POLICY "Allow create separation jobs"
ON separation_jobs FOR INSERT
TO public
WITH CHECK (true);

-- Allow public to view separation jobs
CREATE POLICY "Allow view separation jobs"
ON separation_jobs FOR SELECT
TO public
USING (true);

-- Allow public to update separation jobs
CREATE POLICY "Allow update separation jobs"
ON separation_jobs FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
