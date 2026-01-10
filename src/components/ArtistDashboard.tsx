import React, { useState, useEffect } from 'react';
import { Music, Package, Upload, User, TrendingUp, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MapView } from './MapView';
import { SocialShareButtons } from './SocialShareButtons';

interface ArtistDashboardProps {
  onNavigate: (page: string) => void;
}

export function ArtistDashboard({ onNavigate }: ArtistDashboardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalStems: 0,
    totalRevenue: 0,
  });
  const [latestSong, setLatestSong] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (artist) {
      const { data: songsData } = await supabase
        .from('songs')
        .select('*')
        .eq('artist_id', artist.id);

      const { data: stemsData } = await supabase
        .from('stems')
        .select('*, campaign_stems(quantity_purchased, purchase_price_usd)')
        .in('song_id', songsData?.map(s => s.id) || []);

      const revenue = stemsData?.reduce((sum, stem) => {
        const sold = stem.campaign_stems?.reduce((s: number, cs: any) => s + (cs.quantity_purchased * cs.purchase_price_usd || 0), 0) || 0;
        return sum + sold;
      }, 0) || 0;

      const latestSongData = songsData && songsData.length > 0
        ? songsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        : null;

      setStats({
        totalSongs: songsData?.length || 0,
        totalStems: stemsData?.length || 0,
        totalRevenue: revenue,
      });

      if (latestSongData) {
        setLatestSong(latestSongData);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="waveform-artist" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M0 100 Q25 80 50 100 T100 100 T150 100 T200 100" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M0 120 Q25 140 50 120 T100 120 T150 120 T200 120" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="30" cy="60" r="20" stroke="currentColor" strokeWidth="1" fill="none"/>
              <circle cx="170" cy="160" r="15" stroke="currentColor" strokeWidth="1" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#waveform-artist)"/>
        </svg>
      </div>
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Songs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSongs}</p>
              </div>
              <Music className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Stems</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStems}</p>
              </div>
              <Package className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => onNavigate('account')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-[80px] hover:scale-105"
          >
            <User className="w-6 h-6 text-blue-600 mb-1" />
            <p className="text-xs font-medium text-gray-900 text-center">Artist Account</p>
          </button>

          <button
            onClick={() => onNavigate('upload')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-[80px] hover:scale-105"
          >
            <Upload className="w-6 h-6 text-green-600 mb-1" />
            <p className="text-xs font-medium text-gray-900 text-center">Upload New Song</p>
          </button>

          <button
            onClick={() => onNavigate('mystems')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-[80px] hover:scale-105"
          >
            <Package className="w-6 h-6 text-purple-600 mb-1" />
            <p className="text-xs font-medium text-gray-900 text-center">My Stem Status</p>
          </button>

          <button
            onClick={() => onNavigate('ecosystem')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-[80px] hover:scale-105"
          >
            <TrendingUp className="w-6 h-6 text-amber-600 mb-1" />
            <p className="text-xs font-medium text-gray-900 text-center">Stem Ecosystem</p>
          </button>

          <button
            onClick={() => onNavigate('remixes')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-[80px] hover:scale-105"
          >
            <Music className="w-6 h-6 text-pink-600 mb-1" />
            <p className="text-xs font-medium text-gray-900 text-center">Latest Remixes</p>
          </button>

          <button
            onClick={() => onNavigate('announcements')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-[80px] hover:scale-105"
          >
            <Bell className="w-6 h-6 text-red-600 mb-1" />
            <p className="text-xs font-medium text-gray-900 text-center">Announcements</p>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <SocialShareButtons
            title={latestSong ? "Promote Your Latest Stem-Enabled Song" : "Promote Your Music on Agentic Stems"}
            contentType="song"
            contentName={latestSong?.title}
          />
          <button
            onClick={() => onNavigate('upcoming')}
            className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-[1.02] flex flex-col"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">Upcoming Features</h3>
              <Sparkles className="w-8 h-8 flex-shrink-0" />
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <p>Agentic AI Tools...</p>
              <p>Artist Collaborations...</p>
              <p>Concert Air Drop Stems..</p>
              <p>And More!</p>
            </div>
          </button>
        </div>

        <MapView userType="artist" userId={user?.id} />
      </main>
    </div>
  );
}
