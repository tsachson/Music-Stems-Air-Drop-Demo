import React, { useState, useEffect } from 'react';
import { ArrowLeft, Music, Search, Play, Calendar, Plus, Globe, Check, X, Trash2, Ban, Upload, Grid, List, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { RemixUploadWizard } from './RemixUploadWizard';

interface MyRemixesProps {
  onBack: () => void;
}

export function MyRemixes({ onBack }: MyRemixesProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [remixes, setRemixes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [creatorId, setCreatorId] = useState<string>('');
  const [showDSPUpload, setShowDSPUpload] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortField, setSortField] = useState<'title' | 'genre' | 'date' | 'duration' | 'dsp'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadRemixes();
  }, []);

  const loadRemixes = async () => {
    setLoading(true);

    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (creator) {
      setCreatorId(creator.id);
      const { data: remixesData } = await supabase
        .from('remixes')
        .select('*')
        .eq('creator_id', creator.id)
        .order('uploaded_at', { ascending: false });

      setRemixes(remixesData || []);
    }

    setLoading(false);
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    loadRemixes();
  };

  const handleRemoveFromDSPs = async (remixId: string) => {
    if (!confirm('Are you sure you want to remove this remix from all streaming services?')) {
      return;
    }

    const { error } = await supabase
      .from('remixes')
      .update({ dsp_uploads: {} })
      .eq('id', remixId);

    if (error) {
      alert('Error removing from DSPs: ' + error.message);
      return;
    }

    alert('Remix removed from all streaming services');
    loadRemixes();
  };

  const handleDeleteRemix = async (remixId: string) => {
    if (!confirm('Are you sure you want to permanently delete this remix? This action cannot be undone.')) {
      return;
    }

    const { error } = await supabase
      .from('remixes')
      .delete()
      .eq('id', remixId);

    if (error) {
      alert('Error deleting remix: ' + error.message);
      return;
    }

    alert('Remix permanently deleted');
    loadRemixes();
  };

  const handleUploadToDSPs = async (remixId: string, selectedDSPs: any) => {
    const dspUploads: any = {};
    Object.entries(selectedDSPs).forEach(([platform, enabled]) => {
      if (enabled) {
        dspUploads[platform] = 'uploaded';
      }
    });

    const { error } = await supabase
      .from('remixes')
      .update({ dsp_uploads: dspUploads })
      .eq('id', remixId);

    if (error) {
      alert('Error uploading to DSPs: ' + error.message);
      return;
    }

    alert('Remix uploaded to selected streaming services!');
    setShowDSPUpload(null);
    loadRemixes();
  };

  const getDSPStatus = (dspUploads: any) => {
    if (!dspUploads) return [];
    return Object.entries(dspUploads).map(([platform, status]) => ({
      platform,
      status: status as string,
    }));
  };

  const filteredRemixes = remixes.filter(remix => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      remix.remix_title?.toLowerCase().includes(query) ||
      remix.genre?.toLowerCase().includes(query)
    );
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRemixes = [...filteredRemixes].sort((a, b) => {
    let aVal, bVal;
    switch (sortField) {
      case 'title':
        aVal = a.remix_title || '';
        bVal = b.remix_title || '';
        break;
      case 'genre':
        aVal = a.genre || '';
        bVal = b.genre || '';
        break;
      case 'date':
        aVal = new Date(a.uploaded_at).getTime();
        bVal = new Date(b.uploaded_at).getTime();
        break;
      case 'duration':
        aVal = a.duration_seconds || 0;
        bVal = b.duration_seconds || 0;
        break;
      case 'dsp':
        aVal = getDSPStatus(a.dsp_uploads).length;
        bVal = getDSPStatus(b.dsp_uploads).length;
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

  const DSPUploadModal = ({ remixId }: { remixId: string }) => {
    const [selectedDSPs, setSelectedDSPs] = useState({
      spotify: false,
      apple_music: false,
      youtube_music: false,
      tidal: false,
      amazon_music: false,
      soundcloud: false,
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Upload to Streaming Services</h3>
            <button onClick={() => setShowDSPUpload(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Select the streaming platforms where you want to distribute this remix
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.entries(selectedDSPs).map(([platform, enabled]) => (
              <div
                key={platform}
                onClick={() => setSelectedDSPs({ ...selectedDSPs, [platform]: !enabled })}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  enabled ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-gray-700" />
                    <span className="font-medium text-gray-900 capitalize">
                      {platform.replace('_', ' ')}
                    </span>
                  </div>
                  {enabled && <Check className="w-5 h-5 text-green-600" />}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDSPUpload(null)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleUploadToDSPs(remixId, selectedDSPs)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Upload to Selected Platforms
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {showWizard && creatorId && (
        <RemixUploadWizard
          creatorId={creatorId}
          onClose={() => setShowWizard(false)}
          onComplete={handleWizardComplete}
        />
      )}

      {showDSPUpload && <DSPUploadModal remixId={showDSPUpload} />}

      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My Remixes</h2>
              <p className="text-gray-600">View and manage your remix creations</p>
            </div>
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Remix
            </button>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Remixes</p>
                <p className="text-3xl font-bold text-gray-900">{remixes.length}</p>
              </div>
              <Music className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900">
                  {remixes.filter(r => {
                    const uploadDate = new Date(r.uploaded_at);
                    const now = new Date();
                    return uploadDate.getMonth() === now.getMonth() && uploadDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Genres</p>
                <p className="text-3xl font-bold text-gray-900">
                  {new Set(remixes.map(r => r.genre)).size}
                </p>
              </div>
              <Play className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search remixes..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading remixes...</div>
          ) : filteredRemixes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {remixes.length === 0 ? (
                <div>
                  <p className="mb-4">No remixes created yet</p>
                  <p className="text-sm">Collect stems from campaigns and create your first remix!</p>
                </div>
              ) : (
                'No remixes match your search'
              )}
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('title')}
                        className={`flex items-center gap-2 font-semibold transition-colors ${
                          sortField === 'title' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        Title
                        {sortField === 'title' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-40" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('genre')}
                        className={`flex items-center gap-2 font-semibold transition-colors ${
                          sortField === 'genre' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        Genre
                        {sortField === 'genre' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-40" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('duration')}
                        className={`flex items-center gap-2 font-semibold transition-colors ${
                          sortField === 'duration' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        Duration
                        {sortField === 'duration' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-40" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('dsp')}
                        className={`flex items-center gap-2 font-semibold transition-colors ${
                          sortField === 'dsp' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        DSP Platforms
                        {sortField === 'dsp' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-40" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('date')}
                        className={`flex items-center gap-2 font-semibold transition-colors ${
                          sortField === 'date' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        Uploaded
                        {sortField === 'date' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-40" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedRemixes.map(remix => {
                    const dspStatus = getDSPStatus(remix.dsp_uploads);
                    return (
                      <tr key={remix.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{remix.remix_title}</p>
                          <p className="text-xs text-gray-500">{remix.stem_ids?.length || 0} stems</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {remix.genre}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{remix.duration_seconds}s</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            remix.status === 'published' ? 'bg-green-100 text-green-800' :
                            remix.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {remix.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {dspStatus.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {dspStatus.map(({ platform }) => (
                                <span
                                  key={platform}
                                  className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium capitalize"
                                >
                                  {platform.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Not uploaded</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(remix.uploaded_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {dspStatus.length === 0 ? (
                              <button
                                onClick={() => setShowDSPUpload(remix.id)}
                                className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                title="Upload to DSPs"
                              >
                                <Upload className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRemoveFromDSPs(remix.id)}
                                className="p-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                                title="Remove from DSPs"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteRemix(remix.id)}
                              className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="divide-y">
              {sortedRemixes.map(remix => {
                const dspStatus = getDSPStatus(remix.dsp_uploads);
                return (
                  <div key={remix.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Music className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">{remix.remix_title}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {remix.genre}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            remix.status === 'published' ? 'bg-green-100 text-green-800' :
                            remix.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {remix.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Uploaded {new Date(remix.uploaded_at).toLocaleDateString()} • {remix.duration_seconds}s
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Stems Used:</p>
                            <p className="text-sm text-gray-600">{remix.stem_ids?.length || 0} stem(s)</p>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Status:</p>
                            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                              remix.status === 'published' ? 'bg-green-100 text-green-800' :
                              remix.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {remix.status}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Globe className="w-5 h-5 text-blue-600" />
                            <p className="text-sm font-bold text-blue-900">Streaming Platform Distribution</p>
                          </div>
                          {dspStatus.length === 0 ? (
                            <div className="bg-white rounded-lg p-3 border border-blue-200">
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Not uploaded to any streaming services yet.</span>
                              </p>
                              <p className="text-xs text-gray-500">
                                Click the upload button to distribute this remix to platforms like Spotify, Apple Music, and more.
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs text-blue-700 mb-2 font-medium">Available on {dspStatus.length} platform{dspStatus.length > 1 ? 's' : ''}:</p>
                              <div className="flex flex-wrap gap-2">
                                {dspStatus.map(({ platform, status }) => (
                                  <div
                                    key={platform}
                                    className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border-2 border-green-300 shadow-sm"
                                  >
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-semibold text-gray-900 capitalize">
                                      {platform.replace('_', ' ')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {remix.royalty_split && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Royalty Split:</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(remix.royalty_split).map(([artist, percentage]) => (
                                <span key={artist} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {artist}: {percentage}%
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        <button className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <Play className="w-5 h-5" />
                        </button>
                        {dspStatus.length === 0 ? (
                          <button
                            onClick={() => setShowDSPUpload(remix.id)}
                            className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            title="Upload to DSPs"
                          >
                            <Upload className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRemoveFromDSPs(remix.id)}
                            className="p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            title="Remove from DSPs"
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRemix(remix.id)}
                          className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          title="Delete Remix"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {remixes.length === 0 && !loading && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to create your first remix?</h3>
            <p className="text-blue-800 mb-4">
              Collect stems from active campaigns and combine them to create unique remixes. Share your creativity with the world!
            </p>
            <button
              onClick={() => setShowWizard(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Remix
            </button>
          </div>
        )}
        </main>
      </div>
    </>
  );
}
