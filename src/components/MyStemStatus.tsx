import React, { useState, useEffect } from 'react';
import { ArrowLeft, Music, Package, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SongCard } from './SongCard';

interface MyStemStatusProps {
  onBack: () => void;
}

export function MyStemStatus({ onBack }: MyStemStatusProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<any[]>([]);
  const [stems, setStems] = useState<any[]>([]);
  const [artistId, setArtistId] = useState('');

  useEffect(() => {
    loadStemStatus();
  }, []);

  const loadStemStatus = async () => {
    setLoading(true);

    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (artist) {
      setArtistId(artist.id);

      const { data: songsData } = await supabase
        .from('songs')
        .select('*')
        .eq('artist_id', artist.id)
        .order('created_at', { ascending: false });

      setSongs(songsData || []);

      const songIds = songsData?.map(s => s.id) || [];
      if (songIds.length > 0) {
        const { data: stemsData } = await supabase
          .from('stems')
          .select('*, campaign_stems(quantity_purchased)')
          .in('song_id', songIds);

        const stemsWithStatus = stemsData?.map(stem => ({
          ...stem,
          quantity_sold: stem.campaign_stems?.reduce((sum: number, cs: any) => sum + (cs.quantity_purchased || 0), 0) || 0,
          is_sponsored: (stem.campaign_stems?.length || 0) > 0
        })) || [];

        setStems(stemsWithStatus);
      }
    }

    setLoading(false);
  };

  const handleDeleteSong = async (songId: string) => {
    const { error: stemsError } = await supabase
      .from('stems')
      .delete()
      .eq('song_id', songId);

    if (stemsError) {
      alert('Failed to delete stems: ' + stemsError.message);
      return;
    }

    const { error: songError } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId);

    if (songError) {
      alert('Failed to delete song: ' + songError.message);
      return;
    }

    await loadStemStatus();
  };

  const getSongStems = (songId: string) => {
    return stems.filter(s => s.song_id === songId);
  };

  const totalStems = stems.length;
  const coreStems = stems.filter(s => s.stem_type === 'Core').length;
  const additiveStems = stems.filter(s => s.stem_type === 'Additive');
  const soldStems = stems.filter(s => s.quantity_available < s.quantity_minted);
  const totalRevenue = soldStems.reduce((sum, stem) => sum + ((stem.quantity_minted - stem.quantity_available) * parseFloat(stem.price_usd)), 0);
  const potentialRevenue = additiveStems.reduce((sum, stem) => sum + (stem.quantity_minted * parseFloat(stem.price_usd)), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-white rounded-lg transition-colors mb-6 border border-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Artist Portal
        </button>

        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">My Stem Status</h2>
            <p className="text-sm text-gray-600 mt-1">Track your stem performance and sales</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Music className="w-7 h-7 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Total Songs</span>
                </div>
                <p className="text-3xl font-bold text-blue-900">{songs.length}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-7 h-7 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Total Stems</span>
                </div>
                <p className="text-3xl font-bold text-green-900">{totalStems}</p>
                <p className="text-xs text-green-700 mt-1">{coreStems} Core • {additiveStems.length} Additive</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-7 h-7 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Stems Sold</span>
                </div>
                <p className="text-3xl font-bold text-purple-900">{soldStems.length}</p>
                <p className="text-xs text-purple-700 mt-1">to brand sponsors</p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-7 h-7 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">Revenue</span>
                </div>
                <p className="text-3xl font-bold text-amber-900">${totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-amber-700 mt-1">${potentialRevenue.toFixed(2)} potential</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">Performance Insights</p>
                  <p className="text-sm text-blue-800 mt-1">
                    You have {additiveStems.filter(s => s.quantity_sold === 0).length} unsold additive stems available for sponsors to purchase.
                    {soldStems.length > 0 && ` Your best-selling stems have generated $${totalRevenue.toFixed(2)} in revenue.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900">Your Songs & Stems</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : songs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Music className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">No songs uploaded yet</p>
              <p className="text-sm text-gray-500">Upload your first song to start tracking stem performance</p>
            </div>
          ) : (
            <div className="divide-y">
              {songs.map(song => (
                <SongCard
                  key={song.id}
                  song={song}
                  stems={getSongStems(song.id)}
                  onUpdate={loadStemStatus}
                  onDelete={handleDeleteSong}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
