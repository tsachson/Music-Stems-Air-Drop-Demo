import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Music, Edit2, Check, X, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Stem {
  id: string;
  stem_type: string;
  stem_name: string;
  instrument: string;
  price_usd: number;
  quantity_minted: number;
  quantity_available: number;
  rarity: string;
  quantity_sold?: number;
  is_sponsored?: boolean;
}

interface Song {
  id: string;
  title: string;
  genre: string;
  album_cover_url?: string;
  created_at: string;
}

interface SongCardProps {
  song: Song;
  stems: Stem[];
  onUpdate: () => void;
  onDelete?: (songId: string) => void;
}

export function SongCard({ song, stems, onUpdate, onDelete }: SongCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingStemId, setEditingStemId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editQuantityMinted, setEditQuantityMinted] = useState<number>(0);
  const [editQuantityAvailable, setEditQuantityAvailable] = useState<number>(0);
  const [originalQuantityMinted, setOriginalQuantityMinted] = useState<number>(0);
  const [originalQuantityAvailable, setOriginalQuantityAvailable] = useState<number>(0);
  const [deleting, setDeleting] = useState(false);

  const coreStems = stems.filter(s => s.stem_type === 'Core');
  const additiveStems = stems.filter(s => s.stem_type === 'Additive');

  const potentialRevenue = additiveStems.reduce((sum, stem) => {
    return sum + (stem.quantity_minted * parseFloat(stem.price_usd.toString()));
  }, 0);

  const displayStems = expanded ? stems : stems.slice(0, 8);

  const startEdit = (stem: Stem) => {
    if (stem.stem_type === 'Additive') {
      setEditingStemId(stem.id);
      setEditPrice(parseFloat(stem.price_usd.toString()));
      setEditQuantityMinted(stem.quantity_minted);
      setEditQuantityAvailable(stem.quantity_available);
      setOriginalQuantityMinted(stem.quantity_minted);
      setOriginalQuantityAvailable(stem.quantity_available);
    }
  };

  const cancelEdit = () => {
    setEditingStemId(null);
    setEditPrice(0);
    setEditQuantityMinted(0);
    setEditQuantityAvailable(0);
    setOriginalQuantityMinted(0);
    setOriginalQuantityAvailable(0);
  };

  const saveStem = async (stemId: string) => {
    if (editQuantityMinted > originalQuantityMinted || editQuantityAvailable > originalQuantityAvailable) {
      alert('You cannot increase quantity. Only decreases are allowed to maintain scarcity.');
      return;
    }

    if (editQuantityAvailable > editQuantityMinted) {
      alert('Available quantity cannot exceed minted quantity');
      return;
    }

    const { error } = await supabase
      .from('stems')
      .update({
        price_usd: editPrice,
        quantity_minted: editQuantityMinted,
        quantity_available: editQuantityAvailable,
      })
      .eq('id', stemId);

    if (error) {
      alert('Failed to update stem');
      return;
    }

    setEditingStemId(null);
    onUpdate();
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    const soldStems = stems.filter(s => s.is_sponsored || (s.quantity_sold && s.quantity_sold > 0));
    if (soldStems.length > 0) {
      alert(`Cannot delete this song. ${soldStems.length} stem(s) have already been purchased by sponsors and cannot be removed.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${song.title}"? This will remove the song and all its stems permanently.`)) {
      return;
    }

    setDeleting(true);
    onDelete(song.id);
  };

  return (
    <div className="p-6 border-b hover:bg-gray-50 transition-colors">
      <div className="flex gap-4 mb-4">
        {song.album_cover_url ? (
          <img
            src={song.album_cover_url}
            alt={song.title}
            className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200 flex-shrink-0"
          />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Music className="w-10 h-10 text-white" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900">{song.title}</h3>
              <p className="text-sm text-gray-600">{song.genre}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {coreStems.length} Core • {additiveStems.length} Additive
                </p>
                <p className="text-sm font-semibold text-green-600">
                  ${potentialRevenue.toFixed(2)} potential
                </p>
              </div>
              {onDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete song"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
            {displayStems.map(stem => (
              <div
                key={stem.id}
                className={`border rounded p-3 text-sm relative ${
                  stem.stem_type === 'Core'
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-green-200 bg-green-50'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-gray-900 text-xs">{stem.stem_name}</p>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      stem.stem_type === 'Core'
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-green-200 text-green-800'
                    }`}
                  >
                    {stem.stem_type}
                  </span>
                </div>

                {stem.stem_type === 'Core' ? (
                  <p className="text-xs text-blue-700 font-medium mt-1">
                    Generated on-demand for Creators
                  </p>
                ) : editingStemId === stem.id ? (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-600 block">Price</label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-700">$</span>
                        <input
                          type="number"
                          min="0.50"
                          max="5.00"
                          step="0.10"
                          value={editPrice}
                          onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-600 block">Total Minted</label>
                      <input
                        type="number"
                        min="1"
                        max={originalQuantityMinted}
                        value={editQuantityMinted}
                        onChange={(e) => setEditQuantityMinted(parseInt(e.target.value))}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-600 block">Available</label>
                      <input
                        type="number"
                        min="0"
                        max={Math.min(originalQuantityAvailable, editQuantityMinted)}
                        value={editQuantityAvailable}
                        onChange={(e) => setEditQuantityAvailable(parseInt(e.target.value))}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <p className="text-xs text-amber-600 italic">
                      Note: Can only decrease quantities
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => saveStem(stem.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        <Check className="w-3 h-3" />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-green-700 font-semibold">
                        ${parseFloat(stem.price_usd.toString()).toFixed(2)}
                      </p>
                      <button
                        onClick={() => startEdit(stem)}
                        className="text-gray-500 hover:text-green-600 p-1"
                        title="Edit stem"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">
                      {stem.quantity_available}/{stem.quantity_minted} available
                    </p>
                    <p className="text-xs text-gray-500">{stem.rarity}</p>
                  </>
                )}
              </div>
            ))}
          </div>

          {stems.length > 8 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show {stems.length - 8} more stems
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
