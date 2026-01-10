import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Palette, ArrowLeft } from 'lucide-react';
import { CreatorDashboard } from './CreatorDashboard';
import { CreatorAccount } from './CreatorAccount';
import { CollectStems } from './CollectStems';
import { MyStems } from './MyStems';
import { MyRemixes } from './MyRemixes';
import { StemEcosystemStatus } from './StemEcosystemStatus';
import { MusicStemsAnnouncements } from './MusicStemsAnnouncements';
import { LatestRemixes } from './LatestRemixes';
import { UpcomingFeatures } from './UpcomingFeatures';

type PageType = 'dashboard' | 'account' | 'collect' | 'mystems' | 'remixes' | 'ecosystem' | 'announcements' | 'latestremixes' | 'upcoming';

export function CreatorPortal() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [creatorId, setCreatorId] = useState<string>('');

  useEffect(() => {
    loadCreatorId();
  }, []);

  const loadCreatorId = async () => {
    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (creator) {
      setCreatorId(creator.id);
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  return (
    <>
      {currentPage !== 'dashboard' && (
        <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-sm border-b border-gray-700 relative overflow-hidden">
          <div className="absolute inset-0 flex items-end justify-around px-4 pb-2 opacity-30 gap-1">
            {[30, 60, 40, 70, 50, 80, 45, 65, 55, 75, 50, 85, 60, 70, 55, 80, 50, 65, 75, 60, 70, 55, 80, 65, 75, 50, 85, 60, 70, 50].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end h-full gap-0.5">
                {height > 66 && <div className="w-full bg-red-500 rounded-t" style={{ height: `${(height - 66) / 34 * 100}%` }}></div>}
                {height > 33 && <div className="w-full bg-yellow-400" style={{ height: `${Math.min((height - 33) / 33 * 100, 100)}%` }}></div>}
                <div className="w-full bg-green-500 rounded-b" style={{ height: `${Math.min(height / 33 * 100, 100)}%` }}></div>
              </div>
            ))}
          </div>
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <Palette className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Creator Portal</h1>
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
              {[30, 60, 40, 70, 50, 80, 45, 65, 55, 75, 50, 85, 60, 70, 55, 80, 50, 65, 75, 60, 70, 55, 80, 65, 75, 50, 85, 60, 70, 50].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end h-full gap-0.5">
                  {height > 66 && <div className="w-full bg-red-500 rounded-t" style={{ height: `${(height - 66) / 34 * 100}%` }}></div>}
                  {height > 33 && <div className="w-full bg-yellow-400" style={{ height: `${Math.min((height - 33) / 33 * 100, 100)}%` }}></div>}
                  <div className="w-full bg-green-500 rounded-b" style={{ height: `${Math.min(height / 33 * 100, 100)}%` }}></div>
                </div>
              ))}
            </div>
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <Palette className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Creator Portal</h1>
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
          <CreatorDashboard onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'account' && (
        <CreatorAccount onBack={handleBackToDashboard} />
      )}

      {currentPage === 'collect' && (
        <CollectStems onBack={handleBackToDashboard} />
      )}

      {currentPage === 'mystems' && (
        <MyStems onBack={handleBackToDashboard} />
      )}

      {currentPage === 'remixes' && (
        <MyRemixes onBack={handleBackToDashboard} />
      )}

      {currentPage === 'ecosystem' && (
        <StemEcosystemStatus onBack={handleBackToDashboard} portalType="creator" />
      )}

      {currentPage === 'announcements' && (
        <MusicStemsAnnouncements onBack={handleBackToDashboard} />
      )}

      {currentPage === 'latestremixes' && (
        <LatestRemixes onBack={handleBackToDashboard} />
      )}

      {currentPage === 'upcoming' && (
        <UpcomingFeatures onBack={handleBackToDashboard} />
      )}
    </>
  );
}
