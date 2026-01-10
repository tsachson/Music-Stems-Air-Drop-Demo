import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Building2, ArrowLeft } from 'lucide-react';
import { SponsorDashboard } from './SponsorDashboard';
import { SponsorAccount } from './SponsorAccount';
import { MyCampaigns } from './MyCampaigns';
import { CreateCampaign } from './CreateCampaign';
import { StemsMarketplace } from './StemsMarketplace';
import { StemEcosystemStatus } from './StemEcosystemStatus';
import { MusicStemsAnnouncements } from './MusicStemsAnnouncements';
import { LatestRemixes } from './LatestRemixes';
import { UpcomingFeatures } from './UpcomingFeatures';

type PageType = 'dashboard' | 'account' | 'create' | 'campaigns' | 'marketplace' | 'ecosystem' | 'announcements' | 'latestremixes' | 'upcoming';

export function SponsorPortal() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [sponsorId, setSponsorId] = useState<string>('');

  useEffect(() => {
    loadSponsorId();
  }, []);

  const loadSponsorId = async () => {
    const { data: sponsor } = await supabase
      .from('sponsors')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (sponsor) {
      setSponsorId(sponsor.id);
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const handleCreateComplete = () => {
    setCurrentPage('dashboard');
  };

  return (
    <>
      {currentPage !== 'dashboard' && (
        <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-sm border-b border-gray-700 relative overflow-hidden">
          <div className="absolute inset-0 flex items-end justify-around px-4 pb-2 opacity-30 gap-1">
            {[50, 65, 75, 60, 80, 55, 70, 85, 60, 75, 50, 80, 65, 70, 55, 85, 60, 75, 70, 55, 80, 60, 75, 85, 65, 70, 50, 75, 60, 80].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end h-full gap-0.5">
                {height > 66 && <div className="w-full bg-red-500 rounded-t" style={{ height: `${(height - 66) / 34 * 100}%` }}></div>}
                {height > 33 && <div className="w-full bg-yellow-400" style={{ height: `${Math.min((height - 33) / 33 * 100, 100)}%` }}></div>}
                <div className="w-full bg-green-500 rounded-b" style={{ height: `${Math.min(height / 33 * 100, 100)}%` }}></div>
              </div>
            ))}
          </div>
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-amber-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Sponsor Portal</h1>
                <p className="text-sm text-gray-300">Welcome, {user?.username}</p>
              </div>
            </div>
            <div className="flex flex-col items-center absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Agentic Stems Remix</h1>
              <p className="text-sm text-gray-300 mt-1">By Dropness, LLC</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </header>
      )}

      {currentPage === 'dashboard' && (
        <div className="min-h-screen bg-gray-50">
          <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-sm border-b border-gray-700 relative overflow-hidden">
            <div className="absolute inset-0 flex items-end justify-around px-4 pb-2 opacity-30 gap-1">
              {[50, 65, 75, 60, 80, 55, 70, 85, 60, 75, 50, 80, 65, 70, 55, 85, 60, 75, 70, 55, 80, 60, 75, 85, 65, 70, 50, 75, 60, 80].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end h-full gap-0.5">
                  {height > 66 && <div className="w-full bg-red-500 rounded-t" style={{ height: `${(height - 66) / 34 * 100}%` }}></div>}
                  {height > 33 && <div className="w-full bg-yellow-400" style={{ height: `${Math.min((height - 33) / 33 * 100, 100)}%` }}></div>}
                  <div className="w-full bg-green-500 rounded-b" style={{ height: `${Math.min(height / 33 * 100, 100)}%` }}></div>
                </div>
              ))}
            </div>
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-amber-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Sponsor Portal</h1>
                  <p className="text-sm text-gray-300">Welcome, {user?.username}</p>
                </div>
              </div>
              <div className="flex flex-col items-center absolute left-1/2 transform -translate-x-1/2">
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Agentic Stems Remix</h1>
                <p className="text-sm text-gray-300 mt-1">By Dropness, LLC</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          </header>
          <SponsorDashboard onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'account' && (
        <SponsorAccount onBack={handleBackToDashboard} />
      )}

      {currentPage === 'campaigns' && (
        <MyCampaigns onBack={handleBackToDashboard} />
      )}

      {currentPage === 'marketplace' && (
        <StemsMarketplace onBack={handleBackToDashboard} />
      )}

      {currentPage === 'ecosystem' && (
        <StemEcosystemStatus onBack={handleBackToDashboard} portalType="sponsor" />
      )}

      {currentPage === 'announcements' && (
        <MusicStemsAnnouncements onBack={handleBackToDashboard} />
      )}

      {currentPage === 'latestremixes' && (
        <LatestRemixes onBack={handleBackToDashboard} />
      )}

      {currentPage === 'create' && sponsorId && (
        <CreateCampaign
          sponsorId={sponsorId}
          onClose={handleBackToDashboard}
          onComplete={handleCreateComplete}
        />
      )}

      {currentPage === 'upcoming' && (
        <UpcomingFeatures onBack={handleBackToDashboard} />
      )}
    </>
  );
}
