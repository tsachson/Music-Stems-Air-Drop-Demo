# Music Stems Air Drop Demo

A revolutionary music stem distribution and remixing platform that connects artists, creators, and sponsors in a collaborative ecosystem.

## Authors

**Thomas Sachson**
**Dropness LLC**

## Overview

Music Stems Air Drop Demo is a web application that enables artists to share their music stems, creators to remix songs, and sponsors to run marketing campaigns through location-based stem distribution. The platform features a sophisticated stem marketplace with rarity-based pricing, real-time remix capabilities, and geolocation-based air drop campaigns.

## Features

### For Artists
- Upload songs with album covers and metadata
- Create both Core stems (free) and Additive stems (paid) with rarity tiers
- Manage stem inventory and pricing across 5 rarity levels
- Track stem distribution and remixes in real-time
- Promote music through integrated social media sharing
- Monitor ecosystem status and stem collection progress

### For Creators
- Browse and search thousands of available stems
- Collect Core stems for free and purchase Additive stems
- Create remixes by combining stems from different songs
- Manage remix portfolio with DSP tracking links
- Share remixes on social platforms (X, Facebook, TikTok, Instagram, Snapchat)
- Track remix status across major streaming platforms

### For Sponsors
- Create comprehensive marketing campaigns with music stems
- Purchase stems in bulk for distribution with sortable inventory
- Set up location-based air drop zones using interactive maps
- Track campaign performance and budget allocation
- Promote campaigns across social media channels
- Manage multiple campaigns simultaneously

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom authentication with Supabase
- **Styling**: Tailwind CSS
- **Maps**: Leaflet with React-Leaflet
- **Icons**: Lucide React
- **State Management**: React Context API
- **Data Generation**: Faker.js for demo data

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd music-stems-air-drop-demo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run database migrations:

All migrations are located in `supabase/migrations/` and will be automatically applied to your Supabase instance.

5. Run the development server:
```bash
npm run dev
```

6. Build for production:
```bash
npm run build
```

## Database Schema

The application uses a comprehensive database schema including:

- **users**: Custom user authentication and profiles
- **artists**: Artist profiles with bio and contact information
- **creators**: Creator profiles and metadata
- **sponsors**: Sponsor profiles with business details
- **songs**: Song catalog with metadata and album covers
- **stems**: Individual stem files with rarity, pricing, and inventory
- **remixes**: Creator-generated remixes with DSP tracking
- **campaigns**: Sponsor marketing campaigns with budget tracking
- **campaign_stems**: Stems included in campaigns with purchase details
- **campaign_locations**: Geolocation data for air drop zones
- **collected_stems**: Tracks which creators have collected which stems

## Key Concepts

### Stem Types

**Core Stems**: Free stems that form the foundation of a song (vocals, drums, bass, etc.). Always priced at $0.00 and available in unlimited quantities.

**Additive Stems**: Premium stems with rarity-based pricing and limited quantities:
- **Common**: $0.50 (50,000-100,000 available)
- **Uncommon**: $1.00 (20,000-40,000 available)
- **Rare**: $2.00 (10,000-20,000 available)
- **Epic**: $3.50 (5,000-10,000 available)
- **Legendary**: $5.00 (1,000-3,000 available)

### Air Drop Campaigns

Sponsors can create campaigns that distribute music stems at specific physical locations. Users can discover and collect stems by visiting these locations, creating an engaging real-world music discovery experience. Campaigns include:
- Custom date ranges and budgets
- Multiple stems per campaign with bulk purchasing
- Multiple drop locations with interactive map selection
- Real-time inventory management

### Remix System

Creators can combine stems from different songs to create unique remixes. The platform tracks:
- Stem usage and attribution to original artists
- Remix metadata (title, description, duration)
- DSP distribution links (Spotify, Apple Music, Amazon Music, YouTube Music, Tidal)
- Social media sharing capabilities

### Social Media Integration

All user types can share their content directly to:
- X (Twitter)
- Facebook
- Snapchat
- TikTok
- Instagram

Each sharing option includes pre-filled messages and relevant hashtags.

## Demo Accounts

The application includes seed data with demo accounts:

- **Artist**: `tsachson_artist` / `password123`
- **Creator**: `tsachson_creator` / `password123`
- **Sponsor**: `tsachson_sponsor` / `password123`

Use the seed data function to populate the database with 100 artists, songs, and thousands of stems.

## Project Structure

```
├── src/
│   ├── components/              # React components
│   │   ├── ArtistDashboard.tsx     # Artist main dashboard
│   │   ├── ArtistPortal.tsx        # Artist portal with tabs
│   │   ├── ArtistAccount.tsx       # Artist account settings
│   │   ├── CreatorDashboard.tsx    # Creator main dashboard
│   │   ├── CreatorPortal.tsx       # Creator portal with tabs
│   │   ├── CreatorAccount.tsx      # Creator account settings
│   │   ├── SponsorDashboard.tsx    # Sponsor main dashboard
│   │   ├── SponsorPortal.tsx       # Sponsor portal with tabs
│   │   ├── SponsorAccount.tsx      # Sponsor account settings
│   │   ├── CreateCampaign.tsx      # Campaign creation wizard
│   │   ├── SongUploadWizard.tsx    # Song/stem upload wizard
│   │   ├── RemixUploadWizard.tsx   # Remix creation wizard
│   │   ├── StemsMarketplace.tsx    # Browse and purchase stems
│   │   ├── CollectStems.tsx        # Stem collection interface
│   │   ├── MapView.tsx             # Campaign location map
│   │   └── ...
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx         # Authentication context
│   ├── lib/                    # Utilities and config
│   │   ├── supabase.ts            # Supabase client setup
│   │   └── seedData.ts            # Database seeding utility
│   ├── App.tsx                 # Main application component
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Static assets
├── .env                      # Environment variables
└── package.json             # Project dependencies
```

## Features in Detail

### Search and Discovery
- Full-text search across stems, songs, and artists
- Advanced filtering by rarity, instrument, genre
- Multi-field sorting (name, song, artist, rarity, price, availability)
- Real-time inventory updates

### Geolocation Features
- Interactive Leaflet map interface for campaign locations
- Click-to-place pin functionality for precise location selection
- Multiple locations per campaign
- Address and coordinate tracking

### Campaign Management
- 4-step wizard for campaign creation
- Real-time budget tracking and cost calculation
- Bulk stem purchasing with quantity controls
- Sortable stem inventory with search
- Campaign review before submission

### Remix Creation
- Multi-step remix wizard
- Stem selection from collected inventory
- DSP link management for distribution
- Social sharing integration

### Status Tracking
- Real-time stem collection status
- Campaign progress monitoring
- Remix distribution tracking across DSPs
- Ecosystem health dashboard

## Database Migrations

The project includes comprehensive database migrations that handle:
- Schema creation with proper data types
- Row Level Security (RLS) policies for data protection
- Custom authentication integration
- Proper foreign key relationships
- Unique constraints and indexes
- Default values and constraints

All migrations follow best practices for data safety and security.

## Contributing

This is a proprietary project by Dropness LLC. For inquiries about contributing or licensing, please contact the authors.

## License

Copyright © 2026 Dropness LLC. All rights reserved.

## Contact

For questions, support, or business inquiries:
- **Company**: Dropness LLC
- **Lead Developer**: Thomas Sachson

---

Built with passion by Thomas Sachson and the Dropness LLC team
