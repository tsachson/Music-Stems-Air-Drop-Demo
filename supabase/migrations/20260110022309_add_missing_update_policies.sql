/*
  # Add missing UPDATE policies

  1. Changes
    - Add UPDATE policies for tables that are missing them
    - Specifically adds UPDATE for: artists, songs, sponsors, campaigns, campaign_locations, campaign_stems, creators, collected_stems, users
    - Following the custom auth pattern with public access (true)

  2. Security Notes
    - Using simplified policies for demo purposes with custom authentication
    - Production apps should implement proper authentication middleware
*/

-- Artists table
CREATE POLICY "Public can update artists"
  ON artists FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Songs table  
CREATE POLICY "Public can update songs"
  ON songs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Sponsors table
CREATE POLICY "Public can update sponsors"
  ON sponsors FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Campaigns table
CREATE POLICY "Public can update campaigns"
  ON campaigns FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Campaign locations table
CREATE POLICY "Public can update campaign locations"
  ON campaign_locations FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Campaign stems table
CREATE POLICY "Public can update campaign stems"
  ON campaign_stems FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Creators table (CRITICAL - needed for profile updates)
CREATE POLICY "Public can update creators"
  ON creators FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Collected stems table
CREATE POLICY "Public can update collected stems"
  ON collected_stems FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Users table
CREATE POLICY "Public can update users"
  ON users FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
