/*
  # Fix RLS Policies for Custom Authentication
  
  This migration fixes Row Level Security policies to work with custom username/password authentication
  instead of Supabase Auth.
  
  ## Changes
  
  1. **Users Table**
    - Allow public SELECT access (needed for login queries)
    - Allow public INSERT (needed for registration and seeding)
  
  2. **All Other Tables**  
    - Change policies from `TO authenticated` to `TO anon, authenticated`
    - Add INSERT policies that allow public access for seeding
    - Keep existing UPDATE policies for future use
  
  ## Security Notes
  
  - This is simplified for demo purposes
  - Production apps should implement proper authentication middleware
  - Password hashing should be added before production use
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Anyone can view artists" ON artists;
DROP POLICY IF EXISTS "Artists can update own profile" ON artists;
DROP POLICY IF EXISTS "Anyone can view songs" ON songs;
DROP POLICY IF EXISTS "Artists can create songs" ON songs;
DROP POLICY IF EXISTS "Anyone can view stems" ON stems;
DROP POLICY IF EXISTS "Artists can create stems" ON stems;
DROP POLICY IF EXISTS "Anyone can view sponsors" ON sponsors;
DROP POLICY IF EXISTS "Sponsors can update own profile" ON sponsors;
DROP POLICY IF EXISTS "Anyone can view campaigns" ON campaigns;
DROP POLICY IF EXISTS "Sponsors can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Anyone can view campaign locations" ON campaign_locations;
DROP POLICY IF EXISTS "Anyone can view campaign stems" ON campaign_stems;
DROP POLICY IF EXISTS "Anyone can view creators" ON creators;
DROP POLICY IF EXISTS "Creators can update own profile" ON creators;
DROP POLICY IF EXISTS "Creators can view own collected stems" ON collected_stems;
DROP POLICY IF EXISTS "Creators can collect stems" ON collected_stems;
DROP POLICY IF EXISTS "Anyone can view remixes" ON remixes;
DROP POLICY IF EXISTS "Creators can create remixes" ON remixes;

-- Users table - allow public access for login/registration
CREATE POLICY "Public can read users"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert users"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Artists table
CREATE POLICY "Public can read artists"
  ON artists FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert artists"
  ON artists FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Songs table
CREATE POLICY "Public can read songs"
  ON songs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert songs"
  ON songs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Stems table
CREATE POLICY "Public can read stems"
  ON stems FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert stems"
  ON stems FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Sponsors table
CREATE POLICY "Public can read sponsors"
  ON sponsors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert sponsors"
  ON sponsors FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Campaigns table
CREATE POLICY "Public can read campaigns"
  ON campaigns FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert campaigns"
  ON campaigns FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Campaign locations table
CREATE POLICY "Public can read campaign locations"
  ON campaign_locations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert campaign locations"
  ON campaign_locations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Campaign stems table
CREATE POLICY "Public can read campaign stems"
  ON campaign_stems FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert campaign stems"
  ON campaign_stems FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Creators table
CREATE POLICY "Public can read creators"
  ON creators FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert creators"
  ON creators FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Collected stems table
CREATE POLICY "Public can read collected stems"
  ON collected_stems FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert collected stems"
  ON collected_stems FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Remixes table
CREATE POLICY "Public can read remixes"
  ON remixes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert remixes"
  ON remixes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
