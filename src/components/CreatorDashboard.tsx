import React, { useState, useEffect } from 'react';
import { Package, Music, MapPin, User, TrendingUp, Bell, Palette, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MapView } from './MapView';
import { SocialShareButtons } from './SocialShareButtons';

interface CreatorDashboardProps {
  onNavigate: (page: string) => void;
}

export function CreatorDashboard({ onNavigate }: CreatorDashboardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [creatorId, setCreatorId] = useState<string>('');
  const [stats, setStats] = useState({
    collectedStems: 0,
    remixesCreated: 0,
    activeCampaigns: 0,
  });
  const [latestRemix, setLatestRemix] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (creator) {
      setCreatorId(creator.id);

      const { data: collected } = await supabase
        .from('collected_stems')
        .select('id')
        .eq('creator_id', creator.id);

      const { data: remixesData } = await supabase
        .from('remixes')
        .select('id')
        .eq('creator_id', creator.id);

      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('id')
        .gte('end_date', new Date().toISOString());

      const { data: latestRemixData } = await supabase
        .from('remixes')
        .select('id, title')
        .eq('creator_id', creator.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setStats({
        collectedStems: collected?.length || 0,
        remixesCreated: remixesData?.length || 0,
        activeCampaigns: campaignsData?.length || 0,
      });

      if (latestRemixData) {
        setLatestRemix(latestRemixData);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="waveform" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M0 100 Q25 80 50 100 T100 100 T150 100 T200 100" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M0 120 Q25 140 50 120 T100 120 T150 120 T200 120" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="30" cy="60" r="20" stroke="currentColor" strokeWidth="1" fill="none"/>
              <circle cx="170" cy="160" r="15" stroke="currentColor" strokeWidth="1" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#waveform)"/>
        </svg>
      </div>
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Collected Stems</p>
                <p className="text-3xl font-bold text-gray-900">{stats.collectedStems}</p>
              </div>
              <Package className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remixes Created</p>
                <p className="text-3xl font-bold text-gray-900">{stats.remixesCreated}</p>
              </div>
              <Music className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeCampaigns}</p>
              </div>
              <MapPin className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => onNavigate('account')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-[80px] hover:scale-105"
          >
            <User className="w-6 h-6 text-blue-600 mb-1" />
            <p className="text-xs font-medium text-gray-900 text-center">Creator Account</p>
          </button>

          <button
            onClick={() => onNavigate('collect')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-[80px] hover:scale-105"
          >
            <MapPin className="w-6 h-6 text-green-600 mb-1" />
            <p className="text-xs font-medium text-gray-900 text-center">Collect Stems</p>
          </button>

          <button
            onClick={() => onNavigate('mystems')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-[80px] hover:scale-105"
          >
            <Package className="w-6 h-6 text-purple-600 mb-1" />
            <p className="text-xs font-medium text-gray-900 text-center">My Stems</p>
          </button>

          <button
            onClick={() => onNavigate('remixes')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-[80px] hover:scale-105"
          >
            <Palette className="w-6 h-6 text-amber-600 mb-1" />
            <p className="text-xs font-medium text-gray-900 text-center">My Remixes</p>
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
            title={latestRemix ? "Promote Your Latest Remix" : "Promote Your Remixes on Agentic Stems"}
            contentType="remix"
            contentName={latestRemix?.title}
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

        <MapView userType="creator" userId={user?.id} creatorId={creatorId} />
      </main>
    </div>
  );
}
