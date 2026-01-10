import { faker } from '@faker-js/faker';
import { supabase } from './supabase';

const GENRES = ['Rock', 'Pop', 'Hip-Hop', 'Electronic', 'Jazz', 'R&B', 'Gospel', 'Country', 'World', 'Other'];
const INSTRUMENTS = ['Vocals', 'Drums', 'Bass', 'Guitar', 'Keys', 'Synth', 'Strings', 'Horns', 'Percussion', 'FX'];
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
const BUSINESS_TYPES = ['Retail Store', 'Fast Food', 'Movie Theaters', 'Restaurants', 'Shopping Malls', 'Live Entertainment', 'Video Games', 'Music Streaming', 'Video Streaming', 'Fashion', 'Cosmetics', 'Athletic Apparel', 'Beverages', 'Snack Foods', 'Other'];

const US_CITIES = [
  { city: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
  { city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
  { city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
  { city: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
  { city: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740 },
  { city: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652 },
  { city: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936 },
  { city: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611 },
  { city: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970 },
  { city: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863 },
  { city: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431 },
  { city: 'Jacksonville', state: 'FL', lat: 30.3322, lng: -81.6557 },
  { city: 'Fort Worth', state: 'TX', lat: 32.7555, lng: -97.3308 },
  { city: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988 },
  { city: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
  { city: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431 },
  { city: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581 },
  { city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
  { city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
  { city: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
  { city: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816 },
  { city: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784 },
  { city: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398 },
  { city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
  { city: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880 },
  { city: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458 },
  { city: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.2650 },
  { city: 'Tampa', state: 'FL', lat: 27.9506, lng: -82.4572 },
  { city: 'Orlando', state: 'FL', lat: 28.5383, lng: -81.3792 },
  { city: 'Baltimore', state: 'MD', lat: 39.2904, lng: -76.6122 },
];

export async function seedDatabase() {
  console.log('Starting database seed...');

  // Step 1: Create demo user accounts
  await createDemoAccounts();

  // Step 2: Seed artists and songs
  const { artists, songs } = await seedArtistsAndSongs(100);

  // Step 3: Seed stems
  await seedStems(songs);

  // Step 4: Seed sponsors
  const sponsors = await seedSponsors(20);

  // Step 5: Seed campaigns
  await seedCampaigns(sponsors, 50);

  console.log('Database seed completed!');
}

async function createDemoAccounts() {
  const demoAccounts = [
    { username: 'tsachson_artist', email: 'artist@demo.com', role: 'artist' },
    { username: 'tsachson_sponsor', email: 'sponsor@demo.com', role: 'sponsor' },
    { username: 'tsachson_creator1', email: 'creator1@demo.com', role: 'creator' },
    { username: 'tsachson_creator2', email: 'creator2@demo.com', role: 'creator' },
    { username: 'tsachson_creator3', email: 'creator3@demo.com', role: 'creator' },
    { username: 'tsachson_creator4', email: 'creator4@demo.com', role: 'creator' },
    { username: 'tsachson_creator5', email: 'creator5@demo.com', role: 'creator' },
  ];

  for (const account of demoAccounts) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: account.username,
        email: account.email,
        password_hash: 'abcd1234', // In production, this would be hashed
        role: account.role,
      })
      .select()
      .single();

    if (!error && data) {
      // Create corresponding profile
      if (account.role === 'artist') {
        await supabase.from('artists').insert({
          user_id: data.id,
          artist_name: 'Thomas Sachson',
          bio: 'Demo artist account',
        });
      } else if (account.role === 'sponsor') {
        await supabase.from('sponsors').insert({
          user_id: data.id,
          company_name: 'Demo Sponsor Co.',
          business_type: 'Other',
          address: '123 Demo Street, Demo City',
        });
      } else if (account.role === 'creator') {
        await supabase.from('creators').insert({
          user_id: data.id,
          creator_name: account.username,
          bio: 'Demo creator account',
        });
      }
    }
  }

  console.log('Demo accounts created');
}

async function seedArtistsAndSongs(count: number) {
  const artists = [];
  const songs = [];

  for (let i = 0; i < count; i++) {
    const artistName = faker.person.fullName();
    const genre = faker.helpers.arrayElement(GENRES);

    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .insert({
        artist_name: artistName,
        bio: faker.lorem.sentence(),
      })
      .select()
      .single();

    if (artistError || !artist) {
      console.error('Error creating artist:', artistError);
      continue;
    }

    artists.push(artist);

    const { data: song, error: songError } = await supabase
      .from('songs')
      .insert({
        artist_id: artist.id,
        title: `${faker.music.songName()}`,
        genre: genre,
        duration_seconds: faker.number.int({ min: 120, max: 300 }),
      })
      .select()
      .single();

    if (songError || !song) {
      console.error('Error creating song:', songError);
      continue;
    }

    songs.push(song);
  }

  console.log(`Created ${artists.length} artists and ${songs.length} songs`);
  return { artists, songs };
}

async function seedStems(songs: any[]) {
  let totalCoreStems = 0;
  let totalAdditiveStems = 0;

  for (const song of songs) {
    const numCoreStems = faker.number.int({ min: 5, max: 7 });
    const numAdditiveStems = faker.number.int({ min: 5, max: 10 });

    // Create Core stems
    for (let i = 0; i < numCoreStems; i++) {
      const instrument = faker.helpers.arrayElement(INSTRUMENTS);
      await supabase.from('stems').insert({
        song_id: song.id,
        stem_type: 'Core',
        stem_name: `${instrument} - Core`,
        instrument: instrument,
        price_usd: 0.00,
        quantity_minted: 1000,
        quantity_available: 1000,
        rarity: null,
      });
      totalCoreStems++;
    }

    // Create Additive stems
    for (let i = 0; i < numAdditiveStems; i++) {
      const instrument = faker.helpers.arrayElement(INSTRUMENTS);
      const rarity = faker.helpers.arrayElement(RARITIES);

      const priceByRarity = {
        'Common': 0.50,
        'Uncommon': 1.00,
        'Rare': 2.00,
        'Epic': 3.50,
        'Legendary': 5.00,
      };

      const quantityByRarity = {
        'Common': faker.number.int({ min: 50000, max: 100000 }),
        'Uncommon': faker.number.int({ min: 20000, max: 50000 }),
        'Rare': faker.number.int({ min: 10000, max: 20000 }),
        'Epic': faker.number.int({ min: 5000, max: 10000 }),
        'Legendary': faker.number.int({ min: 1000, max: 5000 }),
      };

      const quantity = quantityByRarity[rarity as keyof typeof quantityByRarity];

      await supabase.from('stems').insert({
        song_id: song.id,
        stem_type: 'Additive',
        stem_name: `${instrument} - Additive ${i + 1}`,
        instrument: instrument,
        price_usd: priceByRarity[rarity as keyof typeof priceByRarity],
        quantity_minted: quantity,
        quantity_available: quantity,
        rarity: rarity,
      });
      totalAdditiveStems++;
    }
  }

  console.log(`Created ${totalCoreStems} Core stems and ${totalAdditiveStems} Additive stems`);
}

async function seedSponsors(count: number) {
  const sponsors = [];

  for (let i = 0; i < count; i++) {
    const { data: sponsor, error } = await supabase
      .from('sponsors')
      .insert({
        company_name: faker.company.name(),
        business_type: faker.helpers.arrayElement(BUSINESS_TYPES),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`,
      })
      .select()
      .single();

    if (!error && sponsor) {
      sponsors.push(sponsor);
    }
  }

  console.log(`Created ${sponsors.length} sponsors`);
  return sponsors;
}

async function seedCampaigns(sponsors: any[], count: number) {
  const { data: allStems } = await supabase.from('stems').select('*');

  if (!allStems || allStems.length === 0) {
    console.log('No stems available for campaigns');
    return;
  }

  for (let i = 0; i < count; i++) {
    const sponsor = faker.helpers.arrayElement(sponsors);
    const startDate = faker.date.future();
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days later

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        sponsor_id: sponsor.id,
        campaign_name: `${faker.commerce.productName()} Campaign`,
        budget_usd: parseFloat(faker.finance.amount({ min: 5000, max: 50000, dec: 2 })),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        daily_collection_limit: faker.number.int({ min: 3, max: 10 }),
      })
      .select()
      .single();

    if (campaignError || !campaign) {
      console.error('Error creating campaign:', campaignError);
      continue;
    }

    // Create 3 locations per campaign using real US cities
    const numLocations = 3;
    for (let j = 0; j < numLocations; j++) {
      const cityData = faker.helpers.arrayElement(US_CITIES);
      const lat = cityData.lat + (Math.random() - 0.5) * 0.1;
      const lng = cityData.lng + (Math.random() - 0.5) * 0.1;

      await supabase.from('campaign_locations').insert({
        campaign_id: campaign.id,
        location_name: `${faker.company.name()} - ${cityData.city}`,
        address: `${faker.location.streetAddress()}, ${cityData.city}, ${cityData.state} ${faker.location.zipCode()}`,
        latitude: lat,
        longitude: lng,
      });
    }

    // Purchase random stems for this campaign
    const numStems = faker.number.int({ min: 3, max: 8 });
    const selectedStems = faker.helpers.arrayElements(allStems, numStems);

    for (const stem of selectedStems) {
      await supabase.from('campaign_stems').insert({
        campaign_id: campaign.id,
        stem_id: stem.id,
        purchase_price_usd: stem.price_usd,
        quantity_purchased: faker.number.int({ min: 50, max: 500 }),
      });
    }
  }

  console.log(`Created ${count} campaigns with ~${count * 3} locations`);
}
