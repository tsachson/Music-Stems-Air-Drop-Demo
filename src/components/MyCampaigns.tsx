import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ShoppingBag, MapPin, Package, Calendar, DollarSign } from 'lucide-react';

interface MyCampaignsProps {
  onBack: () => void;
}

export function MyCampaigns({ onBack }: MyCampaignsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);

    const { data: sponsor } = await supabase
      .from('sponsors')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (sponsor) {
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_locations(*),
          campaign_stems(
            *,
            stems(
              *,
              songs(
                title,
                genre,
                artists(artist_name)
              )
            )
          )
        `)
        .eq('sponsor_id', sponsor.id)
        .order('created_at', { ascending: false });

      setCampaigns(campaignsData || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading campaigns...</div>
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

        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Campaigns</h1>
                <p className="text-sm text-gray-600">Manage and track all your marketing campaigns</p>
              </div>
            </div>
          </div>

          {campaigns.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No campaigns yet</p>
              <p className="text-gray-500 text-sm">Create your first campaign to get started</p>
            </div>
          ) : (
            <div className="divide-y">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{campaign.campaign_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>Budget: ${parseFloat(campaign.budget_usd).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {new Date(campaign.end_date) >= new Date() ? (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Active
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                          Ended
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Drop Locations</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {campaign.campaign_locations?.length || 0}
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Stems Purchased</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {campaign.campaign_stems?.length || 0}
                      </p>
                    </div>

                    <div className="bg-amber-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-medium text-gray-700">Total Spend</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        ${campaign.campaign_stems?.reduce((sum: number, cs: any) =>
                          sum + (cs.quantity_purchased * cs.purchase_price_usd), 0
                        ).toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>

                  {campaign.campaign_locations && campaign.campaign_locations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Drop Locations
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {campaign.campaign_locations.map((loc: any) => (
                          <div key={loc.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                            <p className="font-medium text-gray-900">{loc.location_name}</p>
                            <p className="text-xs text-gray-600 mt-1">{loc.address}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {campaign.campaign_stems && campaign.campaign_stems.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Purchased Stems ({campaign.campaign_stems.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {campaign.campaign_stems.map((cs: any) => (
                          <div key={cs.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{cs.stems?.stem_name}</p>
                                <p className="text-xs text-gray-600">{cs.stems?.songs?.title}</p>
                                <p className="text-xs text-gray-500">by {cs.stems?.songs?.artists?.artist_name}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                cs.stems?.stem_type === 'Core'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {cs.stems?.stem_type}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-600 mt-2 pt-2 border-t border-gray-100">
                              <span>Qty: {cs.quantity_purchased}</span>
                              <span className="font-medium">${cs.purchase_price_usd} each</span>
                            </div>
                          </div>
                        ))}
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
