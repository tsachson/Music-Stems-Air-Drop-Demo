import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, ImagePlus, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { faker } from '@faker-js/faker';

const GENRES = ['Rock', 'Pop', 'Hip-Hop', 'Electronic', 'Jazz', 'R&B', 'Gospel', 'Country', 'World', 'Other'];
const INSTRUMENTS = ['Vocals', 'Drums', 'Bass', 'Guitar', 'Keys', 'Synth', 'Strings', 'Horns', 'Percussion', 'FX'];
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

interface StemConfig {
  id: string;
  instrument: string;
  price: number;
  quantity: number;
  rarity: string;
}

interface SongUploadWizardProps {
  artistId: string;
  onClose: () => void;
  onComplete: () => void;
}

export function SongUploadWizard({ artistId, onClose, onComplete }: SongUploadWizardProps) {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);

  const [songTitle, setSongTitle] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [albumCover, setAlbumCover] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const [additiveStems, setAdditiveStems] = useState<StemConfig[]>([
    { id: '1', instrument: 'Vocals', price: 2.50, quantity: 100, rarity: 'Common' },
    { id: '2', instrument: 'Guitar', price: 2.00, quantity: 150, rarity: 'Common' },
    { id: '3', instrument: 'Synth', price: 3.00, quantity: 100, rarity: 'Uncommon' },
  ]);

  const generateAlbumCover = () => {
    const colors = ['dc2626', '2563eb', '16a34a', 'ea580c', '7c3aed', 'db2777'];
    const color = faker.helpers.arrayElement(colors);
    const seed = encodeURIComponent(songTitle || 'music');
    setAlbumCover(`https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=${color}`);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setAlbumCover(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setAlbumCover(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const addStem = () => {
    const newStem: StemConfig = {
      id: Date.now().toString(),
      instrument: faker.helpers.arrayElement(INSTRUMENTS),
      price: 2.50,
      quantity: 100,
      rarity: 'Common',
    };
    setAdditiveStems([...additiveStems, newStem]);
  };

  const removeStem = (id: string) => {
    if (additiveStems.length > 1) {
      setAdditiveStems(additiveStems.filter(s => s.id !== id));
    }
  };

  const updateStem = (id: string, field: keyof StemConfig, value: any) => {
    setAdditiveStems(additiveStems.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const handleSubmit = async () => {
    setUploading(true);

    try {
      const { data: song, error: songError } = await supabase
        .from('songs')
        .insert({
          artist_id: artistId,
          title: songTitle,
          genre: genre,
          album_cover_url: albumCover || null,
          duration_seconds: faker.number.int({ min: 120, max: 300 }),
        })
        .select()
        .single();

      if (songError || !song) {
        alert('Error creating song');
        return;
      }

      const coreInstruments = ['Vocals', 'Drums', 'Bass', 'Guitar', 'Keys'];
      for (const instrument of coreInstruments) {
        await supabase.from('stems').insert({
          song_id: song.id,
          stem_type: 'Core',
          stem_name: `${instrument} - Core`,
          instrument: instrument,
          price_usd: 0.00,
          quantity_minted: 1000,
          quantity_available: 1000,
          rarity: null,
        });
      }

      for (let i = 0; i < additiveStems.length; i++) {
        const stem = additiveStems[i];
        await supabase.from('stems').insert({
          song_id: song.id,
          stem_type: 'Additive',
          stem_name: `${stem.instrument} - Additive ${i + 1}`,
          instrument: stem.instrument,
          price_usd: stem.price,
          quantity_minted: stem.quantity,
          quantity_available: stem.quantity,
          rarity: stem.rarity,
        });
      }

      onComplete();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload New Song</h2>
            <p className="text-sm text-gray-600">Step {step} of 2</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Song Title *
                </label>
                <input
                  type="text"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter song title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre *
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {GENRES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Album Cover
                </label>
                <div className="space-y-3">
                  {albumCover && (
                    <div className="flex items-center gap-4">
                      <img src={albumCover} alt="Album cover" className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200" />
                      <button
                        onClick={() => setAlbumCover('')}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <ImagePlus className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop an image, or
                    </p>
                    <label className="inline-block">
                      <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                        browse files
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <button
                    onClick={generateAlbumCover}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Generate Random Cover
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!songTitle}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  Next: Configure Stems
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Core Stems:</strong> 5 stems (Vocals, Drums, Bass, Guitar, Keys) will be automatically created for free distribution to Creators.
                </p>
                <p className="text-sm text-blue-900 mt-2">
                  <strong>Additive Stems:</strong> Configure the premium stems below that Sponsors can purchase.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Additive Stems ({additiveStems.length})
                  </label>
                  <button
                    onClick={addStem}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Stem
                  </button>
                </div>

                <div className="space-y-3">
                  {additiveStems.map((stem, index) => (
                    <div key={stem.id} className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Stem {index + 1}</span>
                        {additiveStems.length > 1 && (
                          <button
                            onClick={() => removeStem(stem.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Instrument</label>
                          <select
                            value={stem.instrument}
                            onChange={(e) => updateStem(stem.id, 'instrument', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            {INSTRUMENTS.map(inst => (
                              <option key={inst} value={inst}>{inst}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Rarity</label>
                          <select
                            value={stem.rarity}
                            onChange={(e) => updateStem(stem.id, 'rarity', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            {RARITIES.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Price (USD)</label>
                          <input
                            type="number"
                            min="0.50"
                            max="5.00"
                            step="0.10"
                            value={stem.price}
                            onChange={(e) => updateStem(stem.id, 'price', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            max="1000"
                            value={stem.quantity}
                            onChange={(e) => updateStem(stem.id, 'quantity', parseInt(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload Song'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
