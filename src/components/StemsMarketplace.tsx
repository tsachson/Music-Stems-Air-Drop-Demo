import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ShoppingBag, Search, Filter, Music, Package, X, Plus } from 'lucide-react';

interface StemsMarketplaceProps {
  onBack: () => void;
}

export function StemsMarketplace({ onBack }: StemsMarketplaceProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stems, setStems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedRarity, setSelectedRarity] = useState('All');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStem, setSelectedStem] = useState<any>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadStems();
    loadCampaigns();
  }, []);

  const loadStems = async () => {
    setLoading(true);

    const { data: stemsData } = await supabase
      .from('stems')
      .select(`
        *,
        songs(
          *,
          artists(*)
        )
      `)
      .eq('stem_type', 'Additive')
      .gt('quantity_available', 0)
      .order('created_at', { ascending: false });

    setStems(stemsData || []);
    setLoading(false);
  };

  const loadCampaigns = async () => {
    const { data: sponsor } = await supabase
      .from('sponsors')
      .select('id')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (sponsor) {
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('sponsor_id', sponsor.id)
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      setCampaigns(campaignsData || []);
    }
  };

  const handleAddToCampaign = (stem: any) => {
    setSelectedStem(stem);
    setQuantity(1);
    setSelectedCampaignId('');
    setShowAddModal(true);
  };

  const handleConfirmAdd = async () => {
    if (!selectedCampaignId || !selectedStem) {
      alert('Please select a campaign');
      return;
    }

    if (quantity < 1 || quantity > selectedStem.quantity_available) {
      alert(`Please enter a valid quantity (1-${selectedStem.quantity_available})`);
      return;
    }

    setLoading(true);

    const { data: existing } = await supabase
      .from('campaign_stems')
      .select('*')
      .eq('campaign_id', selectedCampaignId)
      .eq('stem_id', selectedStem.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('campaign_stems')
        .update({
          quantity_purchased: existing.quantity_purchased + quantity,
        })
        .eq('id', existing.id);

      if (error) {
        alert('Error updating campaign: ' + error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from('campaign_stems')
        .insert({
          campaign_id: selectedCampaignId,
          stem_id: selectedStem.id,
          quantity_purchased: quantity,
          purchase_price_usd: selectedStem.price_usd,
        });

      if (error) {
        alert('Error adding to campaign: ' + error.message);
        setLoading(false);
        return;
      }
    }

    const { error: stemError } = await supabase
      .from('stems')
      .update({
        quantity_available: selectedStem.quantity_available - quantity,
      })
      .eq('id', selectedStem.id);

    if (stemError) {
      alert('Error updating stem quantity: ' + stemError.message);
    } else {
      alert('Successfully added to campaign!');
      setShowAddModal(false);
      loadStems();
    }

    setLoading(false);
  };

  const genres = ['All', 'Rock', 'Pop', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B'];
  const rarities = ['All', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  const filteredStems = stems.filter(stem => {
    const matchesSearch = searchQuery === '' ||
      stem.stem_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stem.songs?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stem.songs?.artists?.artist_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre = selectedGenre === 'All' || stem.songs?.genre === selectedGenre;
    const matchesRarity = selectedRarity === 'All' || stem.rarity === selectedRarity;

    return matchesSearch && matchesGenre && matchesRarity;
  });

  const groupedByGenre = filteredStems.reduce((acc, stem) => {
    const genre = stem.songs?.genre || 'Other';
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(stem);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading marketplace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Stems Marketplace</h1>
                <p className="text-sm text-gray-600">Browse and discover music stems for your campaigns</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by stem name, song, or artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>

              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity}>{rarity === 'All' ? 'All Rarities' : rarity}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">{filteredStems.length} stems available</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>Additive (Paid)</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredStems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No stems found</p>
                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedByGenre).map(([genre, genreStems]) => (
                  <div key={genre}>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Music className="w-6 h-6 text-blue-600" />
                      {genre}
                      <span className="text-sm font-normal text-gray-500">({genreStems.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {genreStems.map(stem => (
                        <div
                          key={stem.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 mb-1">{stem.stem_name}</p>
                              <p className="text-sm text-gray-700">{stem.songs?.title}</p>
                              <p className="text-xs text-gray-500">by {stem.songs?.artists?.artist_name}</p>
                            </div>
                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                              Additive
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Instrument:</span>
                              <span className="font-medium text-gray-900">{stem.instrument}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Rarity:</span>
                              <span className={`font-medium ${
                                stem.rarity === 'Common' ? 'text-gray-600' :
                                stem.rarity === 'Uncommon' ? 'text-green-600' :
                                stem.rarity === 'Rare' ? 'text-blue-600' :
                                stem.rarity === 'Epic' ? 'text-purple-600' :
                                'text-orange-600'
                              }`}>
                                {stem.rarity}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Available:</span>
                              <span className="font-medium text-gray-900">{stem.quantity_available}</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-gray-900">
                                {stem.price_usd === 0 ? 'FREE' : `$${stem.price_usd}`}
                              </span>
                              <button
                                onClick={() => handleAddToCampaign(stem)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                Add to Campaign
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {showAddModal && selectedStem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add to Campaign</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">{selectedStem.stem_name}</p>
              <p className="text-sm text-gray-600">{selectedStem.songs?.title}</p>
              <p className="text-sm text-gray-500">by {selectedStem.songs?.artists?.artist_name}</p>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-lg font-bold text-gray-900">
                  {selectedStem.price_usd === 0 ? 'FREE' : `$${selectedStem.price_usd} per stem`}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Campaign *
                </label>
                {campaigns.length === 0 ? (
                  <div className="text-sm text-gray-600 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    No active campaigns found. Please create a campaign first from your dashboard.
                  </div>
                ) : (
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a campaign...</option>
                    {campaigns.map(campaign => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.campaign_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedStem.quantity_available}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: {selectedStem.quantity_available}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700 font-medium">Total Cost:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${(selectedStem.price_usd * quantity).toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAdd}
                    disabled={loading || campaigns.length === 0}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
