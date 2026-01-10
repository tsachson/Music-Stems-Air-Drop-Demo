import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Package, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MapView } from './MapView';

interface CollectStemsProps {
  onBack: () => void;
}

export function CollectStems({ onBack }: CollectStemsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [availableCampaigns, setAvailableCampaigns] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatorId, setCreatorId] = useState<string>('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadCreator();
    }
  }, [user?.id]);

  const loadCreator = async () => {
    if (!user?.id) return;

    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creator) {
      setCreatorId(creator.id);
    }
  };

  const loadCampaigns = async () => {
    setLoading(true);

    const { data: campaignsData, error: campaignsError } = await supabase
      .from('campaigns')
      .select(`
        *,
        sponsors(company_name),
        campaign_locations(id, location_name, address, latitude, longitude),
        campaign_stems(
          id,
          stem_id,
          stems(
            id,
            stem_name,
            stem_type,
            rarity,
            songs(
              id,
              title,
              artists(artist_name)
            )
          )
        )
      `)
      .gte('end_date', new Date().toISOString())
      .order('start_date', { ascending: false })
      .limit(50);

    if (campaignsError) {
      console.error('Error loading campaigns:', campaignsError);
    }

    console.log('Loaded campaigns:', campaignsData?.length || 0, campaignsData);
    setAvailableCampaigns(campaignsData || []);
    setLoading(false);
  };

  const collectStem = async (campaignId: string, stemId: string) => {
    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (!creator) {
      alert('Creator profile not found. Please set up your account first.');
      return;
    }

    const { data: additiveStem } = await supabase
      .from('stems')
      .select('song_id')
      .eq('id', stemId)
      .maybeSingle();

    if (!additiveStem) {
      alert('Error: Stem not found.');
      return;
    }

    const { data: coreStems } = await supabase
      .from('stems')
      .select('id')
      .eq('song_id', additiveStem.song_id)
      .eq('stem_type', 'Core');

    const stemsToCollect = [
      { creator_id: creator.id, stem_id: stemId, campaign_id: campaignId },
      ...(coreStems || []).map(coreStem => ({
        creator_id: creator.id,
        stem_id: coreStem.id,
        campaign_id: campaignId,
      }))
    ];

    const { data: alreadyCollected } = await supabase
      .from('collected_stems')
      .select('stem_id')
      .eq('creator_id', creator.id)
      .in('stem_id', stemsToCollect.map(s => s.stem_id));

    const collectedSet = new Set(alreadyCollected?.map(cs => cs.stem_id) || []);
    const stemsToInsert = stemsToCollect.filter(stem => !collectedSet.has(stem.stem_id));

    if (stemsToInsert.length === 0) {
      alert('You have already collected this stem and all its Core stems.');
      return;
    }

    const { data: insertedStems, error } = await supabase
      .from('collected_stems')
      .insert(stemsToInsert)
      .select('stem_id');

    if (error) {
      console.error('Collection error:', error);
      alert('Error collecting stem. Please try again.');
      return;
    }

    const newStemIds = insertedStems?.map(s => s.stem_id) || [];
    const coreCount = newStemIds.length - 1;
    alert(`Stem collected successfully!${coreCount > 0 ? ` ${coreCount} Core stems automatically added.` : ''}`);
    await loadCampaigns();
  };

  const filteredCampaigns = availableCampaigns.filter(campaign => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      campaign.campaign_name?.toLowerCase().includes(query) ||
      campaign.sponsors?.company_name?.toLowerCase().includes(query)
    );
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Collect Stems</h2>
          <p className="text-gray-600">Visit campaign drop locations to collect exclusive stems</p>
        </div>

        <div className="mb-8">
          <MapView userType="creator" userId={user?.id} creatorId={creatorId} />
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Active Campaigns</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campaigns..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading campaigns...</div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No active campaigns found</div>
          ) : (
            <div className="divide-y">
              {filteredCampaigns.map(campaign => (
                <div key={campaign.id} className="p-6">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{campaign.campaign_name}</h4>
                        <p className="text-sm text-gray-600">by {campaign.sponsors?.company_name}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Daily limit: {campaign.daily_collection_limit} stems per person
                    </p>
                  </div>

                  {campaign.campaign_locations && campaign.campaign_locations.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Drop Locations ({campaign.campaign_locations.length}):
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {campaign.campaign_locations.map((loc: any) => (
                          <div key={loc.id} className="border border-gray-200 rounded p-3 text-sm">
                            <p className="font-medium text-gray-900">{loc.location_name}</p>
                            <p className="text-xs text-gray-600">{loc.address}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {campaign.campaign_stems && campaign.campaign_stems.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Available Stems ({campaign.campaign_stems.filter((cs: any) => cs.stems?.stem_type === 'Additive').length}):
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {campaign.campaign_stems
                          .filter((cs: any) => cs.stems?.stem_type === 'Additive')
                          .map((cs: any) => {
                          const rarityColors = {
                            'Common': 'bg-gray-100 text-gray-800',
                            'Uncommon': 'bg-green-100 text-green-800',
                            'Rare': 'bg-blue-100 text-blue-800',
                            'Epic': 'bg-purple-100 text-purple-800',
                            'Legendary': 'bg-orange-100 text-orange-800',
                          };
                          const rarityColor = rarityColors[cs.stems?.rarity as keyof typeof rarityColors] || 'bg-gray-100 text-gray-800';

                          return (
                            <div key={cs.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-2 ${rarityColor}`}>
                                {cs.stems?.rarity || 'Common'}
                              </span>
                              <p className="font-medium text-gray-900 text-sm mb-1">{cs.stems?.stem_name}</p>
                              <p className="text-xs text-gray-600 mb-1">{cs.stems?.songs?.title}</p>
                              <p className="text-xs text-gray-500 mb-2">by {cs.stems?.songs?.artists?.artist_name}</p>
                              <button
                                onClick={() => collectStem(campaign.id, cs.stem_id)}
                                className="w-full bg-blue-600 text-white py-1.5 px-2 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                              >
                                Collect
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
