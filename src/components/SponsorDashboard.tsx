import React, { useState, useEffect } from 'react';
import { ShoppingBag, MapPin, DollarSign, User, PlusCircle, BarChart3, TrendingUp, Bell, Music, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MapView } from './MapView';
import { SocialShareButtons } from './SocialShareButtons';

interface SponsorDashboardProps {
  onNavigate: (page: string) => void;
}

export function SponsorDashboard({ onNavigate }: SponsorDashboardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalLocations: 0,
    totalSpend: 0,
  });
  const [latestCampaign, setLatestCampaign] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
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
          campaign_locations(*)
        `)
        .eq('sponsor_id', sponsor.id);

      const totalCampaigns = campaignsData?.length || 0;

      const totalSpend = campaignsData?.reduce((sum, campaign) => {
        return sum + parseFloat(campaign.budget_usd || 0);
      }, 0) || 0;

      const totalLocations = campaignsData?.reduce((sum, campaign) => {
        return sum + (campaign.campaign_locations?.length || 0);
      }, 0) || 0;

      const latestCampaignData = campaignsData && campaignsData.length > 0
        ? campaignsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        : null;

      setStats({
        totalCampaigns: totalCampaigns,
        totalLocations: totalLocations,
        totalSpend: totalSpend,
      });

      if (latestCampaignData) {
        setLatestCampaign(latestCampaignData);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="waveform-sponsor" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M0 100 Q25 80 50 100 T100 100 T150 100 T200 100" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M0 120 Q25 140 50 120 T100 120 T150 120 T200 120" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="30" cy="60" r="20" stroke="currentColor" strokeWidth="1" fill="none"/>
              <circle cx="170" cy="160" r="15" stroke="currentColor" strokeWidth="1" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#waveform-sponsor)"/>
        </svg>
      </div>
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCampaigns}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Drop Locations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalLocations}</p>
              </div>
              <MapPin className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Total Spend</p>
                <p className="text-3xl font-bold text-gray-900">${stats.totalSpend.toFixed(2)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => onNavigate('account')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-[80px] hover:scale-105"
          >
            <User className="w-6 h-6 text-blue-600 mb-1" />
            <p className="text-xs font-medium text-gray-900 text-center">Sponsor Account</p>
          </button>

          <button
            onClick={() => onNavigate('create')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-[80px] hover:scale-105"
          >
            <PlusCircle className="w-6 h-6 text-green-600 mb-1" />
            <p className="text-xs font-medium text-gray-900 text-center">Create Campaign</p>
          </button>

          <button
            onClick={() => onNavigate('campaigns')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-[80px] hover:scale-105"
          >
            <BarChart3 className="w-6 h-6 text-purple-600 mb-1" />
            <p className="text-xs font-medium text-gray-900 text-center">My Campaigns</p>
          </button>

          <button
            onClick={() => onNavigate('marketplace')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-[80px] hover:scale-105"
          >
            <ShoppingBag className="w-6 h-6 text-amber-600 mb-1" />
            <p className="text-xs font-medium text-gray-900 text-center">Stems Marketplace</p>
          </button>

          <button
            onClick={() => onNavigate('ecosystem')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-[80px] hover:scale-105"
          >
            <TrendingUp className="w-6 h-6 text-pink-600 mb-1" />
            <p className="text-xs font-medium text-gray-900 text-center">Stem Ecosystem</p>
          </button>

          <button
            onClick={() => onNavigate('latestremixes')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-[80px] hover:scale-105"
          >
            <Music className="w-6 h-6 text-orange-600 mb-1" />
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
            title={latestCampaign ? "Promote Your Latest Air Drop Campaign" : "Promote Your Campaigns on Agentic Stems"}
            contentType="campaign"
            contentName={latestCampaign?.name}
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

        <MapView userType="sponsor" userId={user?.id} />
      </main>
    </div>
  );
}
