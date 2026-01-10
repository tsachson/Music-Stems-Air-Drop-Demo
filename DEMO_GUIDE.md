# Stem Platform Demo System

A comprehensive demo platform for showcasing the Dropness stem-based music marketplace ecosystem.

## Overview

This demo system includes three portals:
- **Artist Portal** - Upload songs and auto-generate stems
- **Sponsor Portal** - View campaigns and available stems marketplace
- **Creator Portal** - Collect stems from campaigns and create remixes

## Demo Accounts

All demo accounts use the password: `abcd1234`

### Artist Account
- **Username**: `tsachson_artist`
- **Role**: Upload songs, view generated stems, track revenue

### Sponsor Account
- **Username**: `tsachson_sponsor`
- **Role**: View campaigns, browse stem marketplace, manage locations

### Creator Accounts (5 available)
- `tsachson_creator1` through `tsachson_creator5`
- **Role**: Collect stems from campaigns, create remixes

## Getting Started

### 1. Seed the Database

When you first load the application, click the **"Seed Demo Database"** button in the bottom-right corner. This will:
- Create 100 fictitious artists with songs
- Generate 500-700 Core stems and 500-1,000 Additive stems
- Create 20 sponsor brands
- Set up 50 active campaigns
- Generate ~150 geo-targeted drop locations

### 2. Login as Artist

Login with `tsachson_artist` / `abcd1234` to:
- View your dashboard with stats (songs, stems, revenue)
- Upload new songs with auto-generated stems
- Browse your catalog with all stems displayed

### 3. Login as Sponsor

Login with `tsachson_sponsor` / `abcd1234` to:
- View active campaigns and budgets
- See drop locations for each campaign
- Browse the available stems marketplace
- View purchased stems per campaign

### 4. Login as Creator

Login with `tsachson_creator1` / `abcd1234` to:
- Browse active campaigns with available stems
- See drop locations where stems can be collected
- Collect stems from campaigns
- View your collected stems library
- (Future) Create remixes from collected stems

## Database Schema

### Core Tables

- **users** - Authentication and role management
- **artists** - Artist profiles
- **songs** - Song catalog
- **stems** - Core and Additive stem marketplace
- **sponsors** - Brand sponsors
- **campaigns** - Marketing campaigns
- **campaign_locations** - Geo-targeted air drop locations
- **campaign_stems** - Stems purchased for campaigns
- **creators** - Creator profiles
- **collected_stems** - Stems collected by creators
- **remixes** - Derivative works (future feature)

### Key Relationships

- Artists create Songs
- Songs generate Stems (Core + Additive)
- Sponsors create Campaigns
- Campaigns have Locations and purchase Stems
- Creators collect Stems from Campaigns
- Creators create Remixes from collected Stems

## Features

### Artist Portal Features
✅ View artist dashboard with stats
✅ Upload new songs
✅ Auto-generate Core and Additive stems
✅ View all songs and stems
✅ Track revenue from stem sales

### Sponsor Portal Features
✅ View campaign dashboard
✅ Browse active campaigns
✅ See drop locations
✅ View purchased stems
✅ Browse stems marketplace

### Creator Portal Features
✅ View collected stems
✅ Browse active campaigns
✅ See drop locations
✅ Collect stems from campaigns
✅ View stems library
⏳ Create remixes (coming soon)

## Data Generation

The system uses Faker.js to generate realistic demo data:
- Artist names and bios
- Song titles and genres
- Stem names and pricing ($0.50 - $5.00)
- Company names and addresses
- Campaign names and budgets
- Geographic locations for air drops

## Technical Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Custom auth with Supabase
- **Data Generation**: Faker.js
- **Icons**: Lucide React

## Notes

- This is a demo system with fictitious data
- No real music files are stored or processed
- Stem generation is simulated
- All data can be reset by re-seeding the database
- The system demonstrates user flows and interactions
