import React, { useState, useEffect } from 'react';
import { ArrowLeft, Music, Play, Pause, Users, Calendar, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LatestRemixesProps {
  onBack: () => void;
}

export function LatestRemixes({ onBack }: LatestRemixesProps) {
  const [loading, setLoading] = useState(true);
  const [remixes, setRemixes] = useState<any[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    loadRemixes();
  }, []);

  const loadRemixes = async () => {
    setLoading(true);

    const { data: remixData } = await supabase
      .from('remixes')
      .select(`
        *,
        creators(creator_name)
      `)
      .eq('status', 'published')
      .order('uploaded_at', { ascending: false })
      .limit(50);

    setRemixes(remixData || []);
    setLoading(false);
  };

  const getDSPCount = (dspUploads: any) => {
    if (!dspUploads) return 0;
    return Object.values(dspUploads).filter(status => status === 'uploaded').length;
  };

  const togglePlay = (remixId: string) => {
    if (playingId === remixId) {
      setPlayingId(null);
    } else {
      setPlayingId(remixId);
    }
  };

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

        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <Music className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Latest Remixes</h2>
                <p className="text-sm text-gray-600 mt-1">Discover new remixes created by the community</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading remixes...</div>
          ) : remixes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Music className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">No remixes yet</p>
              <p className="text-sm text-gray-500">Check back soon for new remixes from creators</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {remixes.map((remix) => {
                  const dspCount = getDSPCount(remix.dsp_uploads);
                  return (
                    <div
                      key={remix.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
                    >
                      <div
                        className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                        style={remix.artwork_url ? {
                          backgroundImage: `url(${remix.artwork_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        } : {}}
                      >
                        <button
                          onClick={() => togglePlay(remix.id)}
                          className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center text-blue-600 transition-all shadow-lg"
                          title={playingId === remix.id ? 'Pause' : 'Play preview'}
                        >
                          {playingId === remix.id ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6 ml-1" />
                          )}
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{remix.remix_title || 'Untitled Remix'}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <Users className="w-3 h-3" />
                              {remix.creators?.creator_name || 'Anonymous'}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {remix.genre}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(remix.uploaded_at).toLocaleDateString()}
                          </div>
                          <span>•</span>
                          <span>{remix.duration_seconds}s</span>
                          <span>•</span>
                          <span>{remix.stem_ids?.length || 0} stems</span>
                        </div>

                        {dspCount > 0 && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-green-600" />
                              <span className="text-xs font-medium text-green-900">
                                Available on {dspCount} platform{dspCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        )}

                        {remix.royalty_split && (
                          <div className="border-t pt-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">Royalty Split:</p>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(remix.royalty_split).slice(0, 3).map(([artist, percentage]) => (
                                <span key={artist} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                  {artist}: {percentage}%
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {playingId === remix.id && (
                          <div className="mt-3 bg-gray-100 rounded p-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-gray-300 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 animate-pulse" style={{ width: '30%' }}></div>
                              </div>
                              <span className="text-xs text-gray-600">0:30</span>
                            </div>
                            <p className="text-xs text-center text-gray-600 mt-1">Audio preview simulated</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
