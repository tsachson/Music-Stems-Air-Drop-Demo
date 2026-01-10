import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Search, Music, ChevronDown, ChevronUp, Grid, List, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface MyStemsProps {
  onBack: () => void;
}

export function MyStems({ onBack }: MyStemsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [collectedStems, setCollectedStems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [expandedSongs, setExpandedSongs] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortField, setSortField] = useState<'name' | 'song' | 'artist' | 'type' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadCollectedStems();
  }, []);

  const loadCollectedStems = async () => {
    setLoading(true);

    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (creator) {
      const { data: collected } = await supabase
        .from('collected_stems')
        .select(`
          *,
          stems(*, songs(*, artists(*))),
          campaigns(campaign_name, sponsors(company_name))
        `)
        .eq('creator_id', creator.id)
        .order('collected_at', { ascending: false });

      setCollectedStems(collected || []);
    }

    setLoading(false);
  };

  const filteredStems = collectedStems.filter(collected => {
    if (filterRarity !== 'all' && collected.stems?.rarity !== filterRarity) return false;

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      collected.stems?.stem_name?.toLowerCase().includes(query) ||
      collected.stems?.songs?.title?.toLowerCase().includes(query) ||
      collected.stems?.songs?.artists?.artist_name?.toLowerCase().includes(query)
    );
  });

  // Group stems by song
  const stemsBySong = filteredStems.reduce((acc: any, collected) => {
    const songId = collected.stems?.songs?.id;
    if (!songId) return acc;

    if (!acc[songId]) {
      acc[songId] = {
        song: collected.stems.songs,
        stems: []
      };
    }
    acc[songId].stems.push(collected);
    return acc;
  }, {});

  const stemsByType = {
    Core: collectedStems.filter(s => s.stems?.stem_type === 'Core').length,
    Additive: collectedStems.filter(s => s.stems?.stem_type === 'Additive').length,
  };

  const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  const toggleSong = (songId: string) => {
    const newExpanded = new Set(expandedSongs);
    if (newExpanded.has(songId)) {
      newExpanded.delete(songId);
    } else {
      newExpanded.add(songId);
    }
    setExpandedSongs(newExpanded);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStems = [...filteredStems].sort((a, b) => {
    let aVal, bVal;
    switch (sortField) {
      case 'name':
        aVal = a.stems?.stem_name || '';
        bVal = b.stems?.stem_name || '';
        break;
      case 'song':
        aVal = a.stems?.songs?.title || '';
        bVal = b.stems?.songs?.title || '';
        break;
      case 'artist':
        aVal = a.stems?.songs?.artists?.artist_name || '';
        bVal = b.stems?.songs?.artists?.artist_name || '';
        break;
      case 'type':
        aVal = a.stems?.stem_type || '';
        bVal = b.stems?.stem_type || '';
        break;
      case 'date':
        aVal = new Date(a.collected_at).getTime();
        bVal = new Date(b.collected_at).getTime();
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Collected Stems</h2>
          <p className="text-gray-600">View and manage your stem collection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Stems</p>
                <p className="text-3xl font-bold text-gray-900">{collectedStems.length}</p>
              </div>
              <Package className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Core Stems</p>
                <p className="text-3xl font-bold text-gray-900">{stemsByType.Core}</p>
              </div>
              <Music className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Additive Stems</p>
                <p className="text-3xl font-bold text-gray-900">{stemsByType.Additive}</p>
              </div>
              <Music className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stems..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <select
                  value={filterRarity}
                  onChange={(e) => setFilterRarity(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Rarities</option>
                  {rarities.map(rarity => (
                    <option key={rarity} value={rarity}>{rarity}</option>
                  ))}
                </select>

                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-4 py-2 ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    title="Card View"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    title="Table View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading stems...</div>
          ) : filteredStems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {collectedStems.length === 0 ? 'No stems collected yet. Visit campaigns to collect stems!' : 'No stems match your filters'}
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                      >
                        Stem Name
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('song')}
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                      >
                        Song
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('artist')}
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                      >
                        Artist
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('type')}
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                      >
                        Type
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">Rarity</th>
                    <th className="px-6 py-3 text-left">Campaign</th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('date')}
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                      >
                        Collected
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedStems.map((collected) => (
                    <tr key={collected.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{collected.stems?.stem_name}</p>
                        <p className="text-xs text-gray-500">{collected.stems?.instrument}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{collected.stems?.songs?.title}</td>
                      <td className="px-6 py-4 text-gray-700">{collected.stems?.songs?.artists?.artist_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          collected.stems?.stem_type === 'Core'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {collected.stems?.stem_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {collected.stems?.rarity && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            collected.stems?.rarity === 'Common' ? 'bg-gray-100 text-gray-800' :
                            collected.stems?.rarity === 'Uncommon' ? 'bg-green-100 text-green-800' :
                            collected.stems?.rarity === 'Rare' ? 'bg-blue-100 text-blue-800' :
                            collected.stems?.rarity === 'Epic' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {collected.stems?.rarity}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{collected.campaigns?.campaign_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(collected.collected_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="divide-y">
              {Object.entries(stemsBySong).map(([songId, data]: [string, any]) => {
                const isExpanded = expandedSongs.has(songId);
                const coreStems = data.stems.filter((s: any) => s.stems?.stem_type === 'Core');
                const additiveStems = data.stems.filter((s: any) => s.stems?.stem_type === 'Additive');

                return (
                  <div key={songId} className="bg-white">
                    <div
                      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => toggleSong(songId)}
                    >
                      <div className="flex items-start gap-4">
                        {data.song.album_cover_url && (
                          <img
                            src={data.song.album_cover_url}
                            alt={data.song.title}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {data.song.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                by {data.song.artists?.artist_name}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {data.song.genre}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {data.stems.length} stem{data.stems.length > 1 ? 's' : ''} collected
                                </span>
                                {coreStems.length > 0 && (
                                  <span className="text-xs text-gray-500">
                                    {coreStems.length} Core
                                  </span>
                                )}
                                {additiveStems.length > 0 && (
                                  <span className="text-xs text-gray-500">
                                    {additiveStems.length} Additive
                                  </span>
                                )}
                              </div>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-6 bg-gray-50">
                        {coreStems.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <Music className="w-4 h-4 text-green-600" />
                              Core Stems ({coreStems.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {coreStems.map((collected: any) => (
                                <div key={collected.id} className="bg-white border-2 border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                                    Core
                                  </span>
                                  <p className="font-semibold text-gray-900 text-sm mb-1">
                                    {collected.stems?.stem_name}
                                  </p>
                                  <p className="text-xs text-gray-500 mb-2">
                                    {collected.stems?.instrument}
                                  </p>
                                  <div className="border-t pt-2 mt-2">
                                    <p className="text-xs text-gray-500">
                                      <span className="font-medium">Campaign:</span> {collected.campaigns?.campaign_name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {new Date(collected.collected_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {additiveStems.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <Music className="w-4 h-4 text-purple-600" />
                              Additive Stems ({additiveStems.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {additiveStems.map((collected: any) => {
                                const rarityColors = {
                                  'Common': 'bg-gray-100 text-gray-800',
                                  'Uncommon': 'bg-green-100 text-green-800',
                                  'Rare': 'bg-blue-100 text-blue-800',
                                  'Epic': 'bg-purple-100 text-purple-800',
                                  'Legendary': 'bg-orange-100 text-orange-800',
                                };
                                const rarityColor = rarityColors[collected.stems?.rarity as keyof typeof rarityColors] || 'bg-gray-100 text-gray-800';

                                return (
                                  <div key={collected.id} className="bg-white border-2 border-amber-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                        Additive
                                      </span>
                                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${rarityColor}`}>
                                        {collected.stems?.rarity}
                                      </span>
                                    </div>
                                    <p className="font-semibold text-gray-900 text-sm mb-1">
                                      {collected.stems?.stem_name}
                                    </p>
                                    <p className="text-xs text-gray-500 mb-2">
                                      {collected.stems?.instrument}
                                    </p>
                                    <div className="border-t pt-2 mt-2">
                                      <p className="text-xs text-gray-500">
                                        <span className="font-medium">Campaign:</span> {collected.campaigns?.campaign_name}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {new Date(collected.collected_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
