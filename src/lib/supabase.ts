import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          password_hash: string;
          role: 'artist' | 'sponsor' | 'creator';
          created_at: string;
        };
      };
      artists: {
        Row: {
          id: string;
          user_id: string | null;
          artist_name: string;
          bio: string | null;
          created_at: string;
        };
      };
      songs: {
        Row: {
          id: string;
          artist_id: string;
          title: string;
          genre: string;
          duration_seconds: number;
          created_at: string;
        };
      };
      stems: {
        Row: {
          id: string;
          song_id: string;
          stem_type: 'Core' | 'Additive';
          stem_name: string;
          instrument: string | null;
          price_usd: number;
          quantity_minted: number;
          quantity_available: number;
          rarity: string | null;
          created_at: string;
        };
      };
      sponsors: {
        Row: {
          id: string;
          user_id: string | null;
          company_name: string;
          business_type: string;
          address: string | null;
          created_at: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          sponsor_id: string;
          campaign_name: string;
          budget_usd: number;
          start_date: string;
          end_date: string;
          daily_collection_limit: number;
          created_at: string;
        };
      };
      campaign_locations: {
        Row: {
          id: string;
          campaign_id: string;
          location_name: string;
          address: string;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
        };
      };
      campaign_stems: {
        Row: {
          id: string;
          campaign_id: string;
          stem_id: string;
          purchase_price_usd: number;
          quantity_purchased: number;
          created_at: string;
        };
      };
      creators: {
        Row: {
          id: string;
          user_id: string | null;
          creator_name: string;
          bio: string | null;
          created_at: string;
        };
      };
      collected_stems: {
        Row: {
          id: string;
          creator_id: string;
          stem_id: string;
          campaign_id: string;
          collected_at: string;
        };
      };
      remixes: {
        Row: {
          id: string;
          creator_id: string;
          remix_title: string;
          genre: string;
          original_song_ids: string[];
          stem_ids: string[];
          royalty_split: Record<string, unknown>;
          uploaded_at: string;
        };
      };
    };
  };
};
