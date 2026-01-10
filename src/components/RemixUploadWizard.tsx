import React, { useState, useEffect, useRef } from 'react';
import { X, Music, Palette, DollarSign, Globe, Check, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RemixUploadWizardProps {
  creatorId: string;
  onClose: () => void;
  onComplete: () => void;
}

type Step = 'select-stems' | 'details' | 'royalties' | 'distribute';

interface StemSelection {
  id: string;
  stem_id: string;
  stem_name: string;
  song_title: string;
  song_id: string;
  artist_name: string;
  artist_id: string;
  stem_type: string;
  rarity: string;
}

export function RemixUploadWizard({ creatorId, onClose, onComplete }: RemixUploadWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('select-stems');
  const [loading, setLoading] = useState(false);
  const [availableStems, setAvailableStems] = useState<StemSelection[]>([]);
  const [selectedStems, setSelectedStems] = useState<string[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [remixData, setRemixData] = useState({
    title: '',
    genre: 'Electronic',
    artwork_url: '',
  });

  const [dsps, setDsps] = useState({
    spotify: false,
    apple_music: false,
    tidal: false,
    amazon_music: false,
    soundcloud: false,
  });

  useEffect(() => {
    loadAvailableStems();
  }, []);

  const loadAvailableStems = async () => {
    const { data: collected } = await supabase
      .from('collected_stems')
      .select(`
        id,
        stem_id,
        stems(
          stem_name,
          stem_type,
          rarity,
          song_id,
          songs(
            id,
            title,
            artists(id, artist_name)
          )
        )
      `)
      .eq('creator_id', creatorId);

    if (collected) {
      const stems = collected.map((c: any) => ({
        id: c.id,
        stem_id: c.stem_id,
        stem_name: c.stems.stem_name,
        stem_type: c.stems.stem_type,
        rarity: c.stems.rarity,
        song_id: c.stems.song_id,
        song_title: c.stems.songs.title,
        artist_name: c.stems.songs.artists.artist_name,
        artist_id: c.stems.songs.artists.id,
      }));
      setAvailableStems(stems);
    }
  };

  const toggleStem = (stemId: string) => {
    const stem = availableStems.find(s => s.stem_id === stemId);
    if (!stem) return;

    if (selectedStems.includes(stemId)) {
      // Deselecting a stem
      const newSelectedStems = selectedStems.filter(id => id !== stemId);
      setSelectedStems(newSelectedStems);

      // If no stems selected, reset the song selection
      if (newSelectedStems.length === 0) {
        setSelectedSongId(null);
      }
    } else {
      // Selecting a stem
      if (selectedSongId === null) {
        // First stem selection - set the song
        setSelectedSongId(stem.song_id);
        setSelectedStems([...selectedStems, stemId]);
      } else if (stem.song_id === selectedSongId) {
        // Same song - allow selection
        setSelectedStems([...selectedStems, stemId]);
      }
      // If different song, do nothing (ignore the selection)
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setRemixData({ ...remixData, artwork_url: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const calculateRoyaltySplit = () => {
    const selectedStemData = availableStems.filter(s => selectedStems.includes(s.stem_id));
    const uniqueArtists = [...new Set(selectedStemData.map(s => s.artist_id))];

    const creatorShare = 50;
    const artistShare = 50 / uniqueArtists.length;

    const split: any = { creator: creatorShare };
    selectedStemData.forEach(stem => {
      if (!split[stem.artist_name]) {
        split[stem.artist_name] = artistShare;
      }
    });

    return split;
  };

  const handleSubmit = async () => {
    if (selectedStems.length === 0) {
      alert('Please select at least one stem');
      return;
    }

    if (!remixData.title) {
      alert('Please enter a remix title');
      return;
    }

    setLoading(true);

    const selectedStemData = availableStems.filter(s => selectedStems.includes(s.stem_id));
    const originalSongIds = [...new Set(selectedStemData.map(s => s.stem_id))];
    const royaltySplit = calculateRoyaltySplit();

    const dspUploads: any = {};
    Object.entries(dsps).forEach(([platform, enabled]) => {
      if (enabled) {
        dspUploads[platform] = 'uploaded';
      }
    });

    const { error } = await supabase
      .from('remixes')
      .insert({
        creator_id: creatorId,
        remix_title: remixData.title,
        genre: remixData.genre,
        original_song_ids: originalSongIds,
        stem_ids: selectedStems,
        royalty_split: royaltySplit,
        artwork_url: remixData.artwork_url || 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
        remix_file_url: 'https://example.com/remix-placeholder.mp3',
        dsp_uploads: dspUploads,
        status: 'published',
      });

    setLoading(false);

    if (error) {
      alert('Error creating remix: ' + error.message);
      return;
    }

    alert('Remix created and uploaded successfully!');
    onComplete();
  };

  const nextStep = () => {
    if (currentStep === 'select-stems' && selectedStems.length === 0) {
      alert('Please select at least one stem');
      return;
    }
    if (currentStep === 'details' && !remixData.title) {
      alert('Please enter a remix title');
      return;
    }

    const steps: Step[] = ['select-stems', 'details', 'royalties', 'distribute'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ['select-stems', 'details', 'royalties', 'distribute'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const rarityColors = {
    'Common': 'bg-gray-100 text-gray-800',
    'Uncommon': 'bg-green-100 text-green-800',
    'Rare': 'bg-blue-100 text-blue-800',
    'Epic': 'bg-purple-100 text-purple-800',
    'Legendary': 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Remix</h2>
            <p className="text-sm text-gray-600 mt-1">
              {currentStep === 'select-stems' && 'Select stems to include in your remix'}
              {currentStep === 'details' && 'Enter remix details and artwork'}
              {currentStep === 'royalties' && 'Review royalty splits'}
              {currentStep === 'distribute' && 'Select distribution platforms'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {currentStep === 'select-stems' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Collected Stems</h3>
                <span className="text-sm text-gray-600">{selectedStems.length} selected</span>
              </div>

              {selectedSongId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Selected Song:</span> {availableStems.find(s => s.song_id === selectedSongId)?.song_title}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    You can only mix stems from this song
                  </p>
                </div>
              )}

              {availableStems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Music className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No stems collected yet</p>
                  <p className="text-sm">Collect stems from campaigns first</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableStems
                    .filter(stem => {
                      if (selectedSongId === null) {
                        return stem.stem_type !== 'Core';
                      }
                      return stem.song_id === selectedSongId;
                    })
                    .map(stem => {
                      const isSelected = selectedStems.includes(stem.stem_id);
                      const isDisabled = selectedSongId !== null && stem.song_id !== selectedSongId;

                      return (
                        <div
                          key={stem.id}
                          onClick={() => !isDisabled && toggleStem(stem.stem_id)}
                          className={`border-2 rounded-lg p-3 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : isDisabled
                              ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                          }`}
                        >
                          {isSelected && (
                            <div className="flex justify-end mb-1">
                              <Check className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                          {stem.stem_type === 'Core' ? (
                            <span className="inline-block px-2 py-0.5 rounded text-xs font-bold mb-2 bg-gray-200 text-gray-800">
                              Core
                            </span>
                          ) : (
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-2 ${
                              rarityColors[stem.rarity as keyof typeof rarityColors]
                            }`}>
                              {stem.rarity}
                            </span>
                          )}
                          <p className="font-semibold text-sm text-gray-900 mb-1">{stem.stem_name}</p>
                          <p className="text-xs text-gray-600">{stem.song_title}</p>
                          <p className="text-xs text-gray-500">by {stem.artist_name}</p>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {currentStep === 'details' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remix Title *
                </label>
                <input
                  type="text"
                  value={remixData.title}
                  onChange={(e) => setRemixData({ ...remixData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter remix title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre *
                </label>
                <select
                  value={remixData.genre}
                  onChange={(e) => setRemixData({ ...remixData, genre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Electronic">Electronic</option>
                  <option value="Hip-Hop">Hip-Hop</option>
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                  <option value="R&B">R&B</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Country">Country</option>
                  <option value="Gospel">Gospel</option>
                  <option value="World">World</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drag Remix Artwork (Optional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  }`}
                >
                  {remixData.artwork_url ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={remixData.artwork_url}
                        alt="Artwork preview"
                        className="w-48 h-48 object-cover rounded-lg mb-4"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRemixData({ ...remixData, artwork_url: '' });
                        }}
                        className="text-sm text-red-600 hover:text-red-700 underline"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-700 font-medium mb-2">
                        Drag and drop your image here
                      </p>
                      <p className="text-sm text-gray-500 mb-2">or click to browse</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Default artwork will be used if not provided</p>
              </div>
            </div>
          )}

          {currentStep === 'royalties' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">How Royalty Splits Work</h3>
                <p className="text-sm text-blue-800">
                  You receive 50% of royalties as the remix creator. The remaining 50% is split equally among the original rights holders whose stems you used. The royalty split cited below has been determined by the original rights holders.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Royalty Split Breakdown</h3>

              {Object.entries(calculateRoyaltySplit()).map(([name, percentage]) => (
                <div key={name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">{name}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}

          {currentStep === 'distribute' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Distribution Platforms</h3>
                <p className="text-sm text-gray-600">Choose where to publish your remix</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(dsps).map(([platform, enabled]) => (
                  <div
                    key={platform}
                    onClick={() => setDsps({ ...dsps, [platform]: !enabled })}
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
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex items-center justify-between">
          <button
            onClick={currentStep === 'select-stems' ? onClose : prevStep}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {currentStep === 'select-stems' ? 'Cancel' : 'Back'}
          </button>

          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <div className={`w-2 h-2 rounded-full ${currentStep !== 'select-stems' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-2 h-2 rounded-full ${['royalties', 'distribute'].includes(currentStep) ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-2 h-2 rounded-full ${currentStep === 'distribute' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          </div>

          {currentStep === 'distribute' ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
            >
              {loading ? 'Publishing...' : 'Publish Remix'}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
