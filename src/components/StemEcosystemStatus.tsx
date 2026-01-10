import React, { useState, useEffect } from 'react';
import { ArrowLeft, Globe, Music, Package, Users, TrendingUp, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface StemEcosystemStatusProps {
  onBack: () => void;
  portalType?: 'artist' | 'creator' | 'sponsor';
}

export function StemEcosystemStatus({ onBack, portalType = 'artist' }: StemEcosystemStatusProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArtists: 0,
    totalSongs: 0,
    totalStems: 0,
    totalCampaigns: 0,
    totalCollections: 0,
    totalRemixes: 0,
    totalDropLocations: 0,
    topGenres: [] as { genre: string; count: number }[],
    recentActivity: [] as any[],
  });

  useEffect(() => {
    loadEcosystemData();
  }, []);

  const loadEcosystemData = async () => {
    setLoading(true);

    const { count: artistCount } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true });

    const { count: songCount } = await supabase
      .from('songs')
      .select('*', { count: 'exact', head: true });

    const { count: stemCount } = await supabase
      .from('stems')
      .select('*', { count: 'exact', head: true });

    const { count: campaignCount } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true });

    const { count: collectionCount } = await supabase
      .from('collected_stems')
      .select('*', { count: 'exact', head: true });

    const { count: remixCount } = await supabase
      .from('remixes')
      .select('*', { count: 'exact', head: true });

    const { count: locationCount } = await supabase
      .from('campaign_locations')
      .select('*', { count: 'exact', head: true });

    const { data: genreData } = await supabase
      .from('songs')
      .select('genre');

    const genreCounts: { [key: string]: number } = {};
    genreData?.forEach(song => {
      genreCounts[song.genre] = (genreCounts[song.genre] || 0) + 1;
    });

    const topGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const { data: recentCollections } = await supabase
      .from('collected_stems')
      .select(`
        *,
        stems(stem_name, songs(title, artists(artist_name))),
        campaigns(campaign_name)
      `)
      .order('collected_at', { ascending: false })
      .limit(10);

    setStats({
      totalArtists: artistCount || 0,
      totalSongs: songCount || 0,
      totalStems: stemCount || 0,
      totalCampaigns: campaignCount || 0,
      totalCollections: collectionCount || 0,
      totalRemixes: remixCount || 0,
      totalDropLocations: locationCount || 0,
      topGenres,
      recentActivity: recentCollections || [],
    });

    setLoading(false);
  };

  const genreColors: { [key: string]: string } = {
    'Rock': 'bg-red-100 text-red-800',
    'Pop': 'bg-green-100 text-green-800',
    'Hip-Hop': 'bg-yellow-100 text-yellow-800',
    'Electronic': 'bg-blue-100 text-blue-800',
    'Jazz': 'bg-purple-100 text-purple-800',
    'R&B': 'bg-pink-100 text-pink-800',
    'Gospel': 'bg-amber-100 text-amber-800',
    'Country': 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-white rounded-lg transition-colors mb-6 border border-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {portalType === 'creator' ? 'Creator Portal' : portalType === 'sponsor' ? 'Sponsor Portal' : 'Artist Portal'}
        </button>

        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Stem Ecosystem Status</h2>
                <p className="text-sm text-gray-600 mt-1">Global platform statistics and trends</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading ecosystem data...</div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <Users className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{stats.totalArtists}</p>
                  <p className="text-xs text-blue-700">Artists</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <Music className="w-6 h-6 text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-900">{stats.totalSongs}</p>
                  <p className="text-xs text-green-700">Songs</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <Package className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="text-2xl font-bold text-purple-900">{stats.totalStems}</p>
                  <p className="text-xs text-purple-700">Stems</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4">
                  <MapPin className="w-6 h-6 text-amber-600 mb-2" />
                  <p className="text-2xl font-bold text-amber-900">{stats.totalDropLocations}</p>
                  <p className="text-xs text-amber-700">Drop Locations</p>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
                  <TrendingUp className="w-6 h-6 text-pink-600 mb-2" />
                  <p className="text-2xl font-bold text-pink-900">{stats.totalCampaigns}</p>
                  <p className="text-xs text-pink-700">Active Campaigns</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
                  <Package className="w-6 h-6 text-indigo-600 mb-2" />
                  <p className="text-2xl font-bold text-indigo-900">{stats.totalCollections}</p>
                  <p className="text-xs text-indigo-700">Stems Collected</p>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4">
                  <Music className="w-6 h-6 text-teal-600 mb-2" />
                  <p className="text-2xl font-bold text-teal-900">{stats.totalRemixes}</p>
                  <p className="text-xs text-teal-700">Remixes Created</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                  <Globe className="w-6 h-6 text-orange-600 mb-2" />
                  <p className="text-2xl font-bold text-orange-900">{stats.topGenres.length}</p>
                  <p className="text-xs text-orange-700">Active Genres</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Genres</h3>
                  <div className="space-y-3">
                    {stats.topGenres.map((genre, index) => (
                      <div key={genre.genre} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${genreColors[genre.genre] || 'bg-gray-100 text-gray-800'}`}>
                            {genre.genre}
                          </span>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">{genre.count} songs</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="text-sm border-b border-gray-100 pb-2">
                        <p className="text-gray-900">
                          <span className="font-medium">{activity.stems?.stem_name}</span>
                        </p>
                        <p className="text-gray-600 text-xs">
                          {activity.stems?.songs?.title} by {activity.stems?.songs?.artists?.artist_name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Campaign: {activity.campaigns?.campaign_name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
