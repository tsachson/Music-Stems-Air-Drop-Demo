/*
  # Stem Platform Database Schema
  
  1. New Tables
    - `users` - User authentication and roles (artist/sponsor/creator)
    - `artists` - Artist profiles
    - `songs` - Song catalog
    - `stems` - Core and Additive stems marketplace
    - `sponsors` - Brand sponsors
    - `campaigns` - Marketing campaigns
    - `campaign_locations` - Geo-targeted air drop locations
    - `campaign_stems` - Stems purchased for campaigns
    - `creators` - Creator profiles
    - `collected_stems` - Stems collected by creators
    - `remixes` - Derivative works created by creators
  
  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users to access their own data
    - Public read access where appropriate for marketplace browsing
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('artist', 'sponsor', 'creator')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  artist_name text NOT NULL,
  bio text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view artists"
  ON artists FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Artists can update own profile"
  ON artists FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Songs table
CREATE TABLE IF NOT EXISTS songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES artists(id) NOT NULL,
  title text NOT NULL,
  genre text NOT NULL CHECK (genre IN ('Rock', 'Pop', 'Hip-Hop', 'Electronic', 'Jazz', 'R&B', 'Gospel', 'Country', 'World', 'Other')),
  duration_seconds integer DEFAULT 180,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view songs"
  ON songs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Artists can create songs"
  ON songs FOR INSERT
  TO authenticated
  WITH CHECK (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()));

-- Stems table
CREATE TABLE IF NOT EXISTS stems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid REFERENCES songs(id) NOT NULL,
  stem_type text NOT NULL CHECK (stem_type IN ('Core', 'Additive')),
  stem_name text NOT NULL,
  instrument text,
  price_usd decimal(5,2) NOT NULL CHECK (price_usd >= 0.50 AND price_usd <= 5.00),
  quantity_minted integer NOT NULL DEFAULT 100,
  quantity_available integer NOT NULL DEFAULT 100,
  rarity text CHECK (rarity IN ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stems"
  ON stems FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Artists can create stems"
  ON stems FOR INSERT
  TO authenticated
  WITH CHECK (song_id IN (SELECT s.id FROM songs s JOIN artists a ON s.artist_id = a.id WHERE a.user_id = auth.uid()));

-- Sponsors table
CREATE TABLE IF NOT EXISTS sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  company_name text NOT NULL,
  business_type text NOT NULL CHECK (business_type IN ('Retail Store', 'Fast Food', 'Movie Theaters', 'Restaurants', 'Shopping Malls', 'Live Entertainment', 'Video Games', 'Music Streaming', 'Video Streaming', 'Fashion', 'Cosmetics', 'Athletic Apparel', 'Beverages', 'Snack Foods', 'Other')),
  address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sponsors"
  ON sponsors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sponsors can update own profile"
  ON sponsors FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid REFERENCES sponsors(id) NOT NULL,
  campaign_name text NOT NULL,
  budget_usd decimal(10,2) NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  daily_collection_limit integer DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sponsors can create campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (sponsor_id IN (SELECT id FROM sponsors WHERE user_id = auth.uid()));

-- Campaign locations table
CREATE TABLE IF NOT EXISTS campaign_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) NOT NULL,
  location_name text NOT NULL,
  address text NOT NULL,
  latitude decimal(9,6),
  longitude decimal(9,6),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE campaign_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view campaign locations"
  ON campaign_locations FOR SELECT
  TO authenticated
  USING (true);

-- Campaign stems table (junction table)
CREATE TABLE IF NOT EXISTS campaign_stems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) NOT NULL,
  stem_id uuid REFERENCES stems(id) NOT NULL,
  purchase_price_usd decimal(5,2) NOT NULL,
  quantity_purchased integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, stem_id)
);

ALTER TABLE campaign_stems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view campaign stems"
  ON campaign_stems FOR SELECT
  TO authenticated
  USING (true);

-- Creators table
CREATE TABLE IF NOT EXISTS creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  creator_name text NOT NULL,
  bio text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view creators"
  ON creators FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Creators can update own profile"
  ON creators FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Collected stems table
CREATE TABLE IF NOT EXISTS collected_stems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES creators(id) NOT NULL,
  stem_id uuid REFERENCES stems(id) NOT NULL,
  campaign_id uuid REFERENCES campaigns(id) NOT NULL,
  collected_at timestamptz DEFAULT now()
);

ALTER TABLE collected_stems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view own collected stems"
  ON collected_stems FOR SELECT
  TO authenticated
  USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));

CREATE POLICY "Creators can collect stems"
  ON collected_stems FOR INSERT
  TO authenticated
  WITH CHECK (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));

-- Remixes table
CREATE TABLE IF NOT EXISTS remixes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES creators(id) NOT NULL,
  remix_title text NOT NULL,
  genre text NOT NULL,
  original_song_ids uuid[] NOT NULL,
  stem_ids uuid[] NOT NULL,
  royalty_split jsonb NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE remixes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view remixes"
  ON remixes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Creators can create remixes"
  ON remixes FOR INSERT
  TO authenticated
  WITH CHECK (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));