import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Music, ArrowLeft } from 'lucide-react';
import { ArtistDashboard } from './ArtistDashboard';
import { ArtistAccount } from './ArtistAccount';
import { MyStemStatus } from './MyStemStatus';
import { StemEcosystemStatus } from './StemEcosystemStatus';
import { LatestRemixes } from './LatestRemixes';
import { MusicStemsAnnouncements } from './MusicStemsAnnouncements';
import { SongUploadWizard } from './SongUploadWizard';
import { UpcomingFeatures } from './UpcomingFeatures';
import { StemSeparator } from './StemSeparator';

type PageType = 'dashboard' | 'account' | 'upload' | 'mystems' | 'ecosystem' | 'remixes' | 'announcements' | 'upcoming' | 'separator';

export function ArtistPortal() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [artistId, setArtistId] = useState<string>('');

  useEffect(() => {
    loadArtistId();
  }, []);

  const loadArtistId = async () => {
    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (artist) {
      setArtistId(artist.id);
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const handleUploadComplete = () => {
    setCurrentPage('dashboard');
  };

  return (
    <>
      {currentPage !== 'dashboard' && (
        <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-sm border-b border-gray-700 relative overflow-hidden">
          <div className="absolute inset-0 flex items-end justify-around px-4 pb-2 opacity-30 gap-1">
            {[40, 70, 50, 80, 45, 75, 60, 85, 55, 70, 60, 75, 50, 80, 65, 75, 55, 70, 80, 60, 75, 50, 85, 70, 60, 55, 80, 65, 75, 50].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end h-full gap-0.5">
                {height > 66 && <div className="w-full bg-red-500 rounded-t" style={{ height: `${(height - 66) / 34 * 100}%` }}></div>}
                {height > 33 && <div className="w-full bg-yellow-400" style={{ height: `${Math.min((height - 33) / 33 * 100, 100)}%` }}></div>}
                <div className="w-full bg-green-500 rounded-b" style={{ height: `${Math.min(height / 33 * 100, 100)}%` }}></div>
              </div>
            ))}
          </div>
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <Music className="w-8 h-8 text-green-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Artist Portal</h1>
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
              {[40, 70, 50, 80, 45, 75, 60, 85, 55, 70, 60, 75, 50, 80, 65, 75, 55, 70, 80, 60, 75, 50, 85, 70, 60, 55, 80, 65, 75, 50].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end h-full gap-0.5">
                  {height > 66 && <div className="w-full bg-red-500 rounded-t" style={{ height: `${(height - 66) / 34 * 100}%` }}></div>}
                  {height > 33 && <div className="w-full bg-yellow-400" style={{ height: `${Math.min((height - 33) / 33 * 100, 100)}%` }}></div>}
                  <div className="w-full bg-green-500 rounded-b" style={{ height: `${Math.min(height / 33 * 100, 100)}%` }}></div>
                </div>
              ))}
            </div>
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <Music className="w-8 h-8 text-green-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Artist Portal</h1>
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
          <ArtistDashboard onNavigate={handleNavigate} />
        </div>
      )}

      {currentPage === 'account' && (
        <ArtistAccount onBack={handleBackToDashboard} />
      )}

      {currentPage === 'mystems' && (
        <MyStemStatus onBack={handleBackToDashboard} />
      )}

      {currentPage === 'ecosystem' && (
        <StemEcosystemStatus onBack={handleBackToDashboard} />
      )}

      {currentPage === 'remixes' && (
        <LatestRemixes onBack={handleBackToDashboard} />
      )}

      {currentPage === 'announcements' && (
        <MusicStemsAnnouncements onBack={handleBackToDashboard} />
      )}

      {currentPage === 'upload' && artistId && (
        <SongUploadWizard
          artistId={artistId}
          onClose={handleBackToDashboard}
          onComplete={handleUploadComplete}
        />
      )}

      {currentPage === 'upcoming' && (
        <UpcomingFeatures onBack={handleBackToDashboard} />
      )}

      {currentPage === 'separator' && (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <button
              onClick={handleBackToDashboard}
              className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <StemSeparator />
          </div>
        </div>
      )}
    </>
  );
}
