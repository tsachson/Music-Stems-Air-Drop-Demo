import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ArrowRight, Check, ShoppingBag, Calendar, DollarSign, MapPin, Package, Plus, Minus, X, Music, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface CreateCampaignProps {
  sponsorId: string;
  onClose: () => void;
  onComplete: () => void;
}

interface SelectedStem {
  stemId: string;
  stemName: string;
  songTitle: string;
  artistName: string;
  price: number;
  quantity: number;
  availableQty: number;
  stemType: string;
  rarity: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

type SortField = 'stem_name' | 'song' | 'artist' | 'rarity' | 'price' | 'available';
type SortDirection = 'asc' | 'desc';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

function LocationPicker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} icon={defaultIcon} /> : null;
}

export function CreateCampaign({ sponsorId, onClose, onComplete }: CreateCampaignProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableStems, setAvailableStems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [campaignData, setCampaignData] = useState({
    campaign_name: '',
    start_date: '',
    end_date: '',
    budget_usd: '',
  });
  const [selectedStems, setSelectedStems] = useState<SelectedStem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
  });
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [quantityInput, setQuantityInput] = useState<{ [key: string]: string }>({});
  const [sortField, setSortField] = useState<SortField>('rarity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    if (currentStep === 2) {
      loadStems();
    }
  }, [currentStep]);

  const loadStems = async () => {
    setLoading(true);

    let allStems: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: stemsData } = await supabase
        .from('stems')
        .select(`
          *,
          songs(
            *,
            artists(*)
          )
        `)
        .eq('stem_type', 'Additive')
        .gt('quantity_available', 0)
        .range(from, from + pageSize - 1);

      if (stemsData && stemsData.length > 0) {
        allStems = [...allStems, ...stemsData];
        from += pageSize;
        hasMore = stemsData.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    setAvailableStems(allStems);
    setLoading(false);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const rarityOrder = { 'Common': 1, 'Uncommon': 2, 'Rare': 3, 'Epic': 4, 'Legendary': 5 };

  const filteredStems = availableStems.filter(stem => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      stem.stem_name?.toLowerCase().includes(query) ||
      stem.songs?.title?.toLowerCase().includes(query) ||
      stem.songs?.artists?.artist_name?.toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    let aVal, bVal;

    switch (sortField) {
      case 'stem_name':
        aVal = a.stem_name?.toLowerCase() || '';
        bVal = b.stem_name?.toLowerCase() || '';
        break;
      case 'song':
        aVal = a.songs?.title?.toLowerCase() || '';
        bVal = b.songs?.title?.toLowerCase() || '';
        break;
      case 'artist':
        aVal = a.songs?.artists?.artist_name?.toLowerCase() || '';
        bVal = b.songs?.artists?.artist_name?.toLowerCase() || '';
        break;
      case 'rarity':
        aVal = rarityOrder[a.rarity as keyof typeof rarityOrder] || 0;
        bVal = rarityOrder[b.rarity as keyof typeof rarityOrder] || 0;
        break;
      case 'price':
        aVal = parseFloat(a.price_usd) || 0;
        bVal = parseFloat(b.price_usd) || 0;
        break;
      case 'available':
        aVal = a.quantity_available || 0;
        bVal = b.quantity_available || 0;
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const addStemToCart = (stem: any) => {
    const existing = selectedStems.find(s => s.stemId === stem.id);
    if (existing) {
      alert('This stem is already in your cart');
      return;
    }

    const qty = parseInt(quantityInput[stem.id] || '1');
    if (qty < 1 || qty > stem.quantity_available) {
      alert(`Please enter a quantity between 1 and ${stem.quantity_available}`);
      return;
    }

    setSelectedStems([...selectedStems, {
      stemId: stem.id,
      stemName: stem.stem_name,
      songTitle: stem.songs?.title || '',
      artistName: stem.songs?.artists?.artist_name || '',
      price: parseFloat(stem.price_usd),
      quantity: qty,
      availableQty: stem.quantity_available,
      stemType: stem.stem_type,
      rarity: stem.rarity || 'Common',
    }]);

    setQuantityInput(prev => ({ ...prev, [stem.id]: '' }));
  };

  const updateStemQuantity = (stemId: string, delta: number) => {
    setSelectedStems(selectedStems.map(stem => {
      if (stem.stemId === stemId) {
        const newQty = Math.max(1, Math.min(stem.availableQty, stem.quantity + delta));
        return { ...stem, quantity: newQty };
      }
      return stem;
    }));
  };

  const removeStem = (stemId: string) => {
    setSelectedStems(selectedStems.filter(s => s.stemId !== stemId));
  };

  const addLocation = () => {
    if (!newLocation.name || !newLocation.address) {
      alert('Please enter location name and address');
      return;
    }

    if (!mapPosition) {
      alert('Please drop a pin on the map to select the location coordinates');
      return;
    }

    setLocations([...locations, {
      id: Math.random().toString(36).substr(2, 9),
      name: newLocation.name,
      address: newLocation.address,
      latitude: mapPosition[0],
      longitude: mapPosition[1],
    }]);

    setNewLocation({ name: '', address: '' });
    setMapPosition(null);
  };

  const removeLocation = (id: string) => {
    setLocations(locations.filter(l => l.id !== id));
  };

  const calculateTotalCost = () => {
    return selectedStems.reduce((sum, stem) => sum + (stem.price * stem.quantity), 0);
  };

  const handleNext = () => {
    if (currentStep === 1 && !campaignData.campaign_name) {
      alert('Please enter a campaign name');
      return;
    }
    if (currentStep === 1 && (!campaignData.start_date || !campaignData.end_date)) {
      alert('Please select start and end dates');
      return;
    }
    if (currentStep === 1 && !campaignData.budget_usd) {
      alert('Please enter a budget');
      return;
    }
    if (currentStep === 2 && selectedStems.length === 0) {
      alert('Please select at least one stem for your campaign');
      return;
    }
    if (currentStep === 3 && locations.length === 0) {
      alert('Please add at least one drop location');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        sponsor_id: sponsorId,
        campaign_name: campaignData.campaign_name,
        start_date: campaignData.start_date,
        end_date: campaignData.end_date,
        budget_usd: parseFloat(campaignData.budget_usd),
      })
      .select()
      .single();

    if (campaignError || !campaign) {
      console.error('Error creating campaign:', campaignError);
      alert('Failed to create campaign. Please try again.');
      setLoading(false);
      return;
    }

    const stemInserts = selectedStems.map(stem => ({
      campaign_id: campaign.id,
      stem_id: stem.stemId,
      quantity_purchased: stem.quantity,
      purchase_price_usd: stem.price,
    }));

    const { error: stemsError } = await supabase
      .from('campaign_stems')
      .insert(stemInserts);

    if (stemsError) {
      console.error('Error adding stems:', stemsError);
      alert('Campaign created but failed to add stems. Please contact support.');
    }

    for (const stem of selectedStems) {
      const { data: currentStem } = await supabase
        .from('stems')
        .select('quantity_available')
        .eq('id', stem.stemId)
        .single();

      if (currentStem) {
        await supabase
          .from('stems')
          .update({ quantity_available: currentStem.quantity_available - stem.quantity })
          .eq('id', stem.stemId);
      }
    }

    const locationInserts = locations.map(loc => ({
      campaign_id: campaign.id,
      location_name: loc.name,
      address: loc.address,
      latitude: loc.latitude,
      longitude: loc.longitude,
    }));

    const { error: locationsError } = await supabase
      .from('campaign_locations')
      .insert(locationInserts);

    if (locationsError) {
      console.error('Error adding locations:', locationsError);
      alert('Campaign created but failed to add locations. Please contact support.');
    }

    setLoading(false);
    alert('Campaign created successfully with all stems and locations!');
    onComplete();
  };

  const steps = [
    { number: 1, title: 'Details', icon: ShoppingBag },
    { number: 2, title: 'Select Stems', icon: Package },
    { number: 3, title: 'Locations', icon: MapPin },
    { number: 4, title: 'Review', icon: Check },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Campaign</h1>
            <p className="text-sm text-gray-600">Set up your marketing campaign to distribute music stems</p>
          </div>

          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        currentStep >= step.number
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs mt-2 font-medium text-gray-600">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-colors ${
                        currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="p-8 min-h-[500px]">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={campaignData.campaign_name}
                    onChange={(e) => setCampaignData({ ...campaignData, campaign_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Summer Music Festival 2026"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={campaignData.start_date}
                      onChange={(e) => setCampaignData({ ...campaignData, start_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={campaignData.end_date}
                      onChange={(e) => setCampaignData({ ...campaignData, end_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Budget (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={campaignData.budget_usd}
                      onChange={(e) => setCampaignData({ ...campaignData, budget_usd: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Stems for Campaign</h3>

                  {selectedStems.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Selected Stems ({selectedStems.length})</h4>
                        <span className="text-lg font-bold text-blue-600">
                          Total: ${calculateTotalCost().toFixed(2)}
                        </span>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedStems.map(stem => {
                          const rarityColors = {
                            'Common': 'bg-gray-100 text-gray-800',
                            'Uncommon': 'bg-green-100 text-green-800',
                            'Rare': 'bg-blue-100 text-blue-800',
                            'Epic': 'bg-purple-100 text-purple-800',
                            'Legendary': 'bg-orange-100 text-orange-800',
                          };
                          const rarityColor = rarityColors[stem.rarity as keyof typeof rarityColors] || 'bg-gray-100 text-gray-800';

                          return (
                            <div key={stem.stemId} className="flex items-center justify-between bg-white p-3 rounded border">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-sm">{stem.stemName}</p>
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${rarityColor}`}>
                                    {stem.rarity}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600">{stem.songTitle} by {stem.artistName}</p>
                                <p className="text-xs text-gray-500">${stem.price} each</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateStemQuantity(stem.stemId, -1)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-12 text-center font-medium">{stem.quantity.toLocaleString()}</span>
                                  <button
                                    onClick={() => updateStemQuantity(stem.stemId, 1)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                <span className="text-sm font-medium w-20 text-right">
                                  ${(stem.price * stem.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <button
                                  onClick={() => removeStem(stem.stemId)}
                                  className="p-1 hover:bg-red-100 text-red-600 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search stems by name, song, or artist..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {loading ? (
                      <div className="text-center py-8 text-gray-500">Loading stems...</div>
                    ) : filteredStems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No Additive stems found</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th
                                onClick={() => handleSort('stem_name')}
                                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  Stem Name
                                  {getSortIcon('stem_name')}
                                </div>
                              </th>
                              <th
                                onClick={() => handleSort('song')}
                                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  Song
                                  {getSortIcon('song')}
                                </div>
                              </th>
                              <th
                                onClick={() => handleSort('artist')}
                                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  Artist
                                  {getSortIcon('artist')}
                                </div>
                              </th>
                              <th
                                onClick={() => handleSort('rarity')}
                                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  Rarity
                                  {getSortIcon('rarity')}
                                </div>
                              </th>
                              <th
                                onClick={() => handleSort('price')}
                                className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center justify-end gap-2">
                                  Price
                                  {getSortIcon('price')}
                                </div>
                              </th>
                              <th
                                onClick={() => handleSort('available')}
                                className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center justify-end gap-2">
                                  Available
                                  {getSortIcon('available')}
                                </div>
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Qty
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Total
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStems.map(stem => {
                              const rarityColors = {
                                'Common': 'bg-gray-100 text-gray-800',
                                'Uncommon': 'bg-green-100 text-green-800',
                                'Rare': 'bg-blue-100 text-blue-800',
                                'Epic': 'bg-purple-100 text-purple-800',
                                'Legendary': 'bg-orange-100 text-orange-800',
                              };
                              const rarityColor = rarityColors[stem.rarity as keyof typeof rarityColors] || 'bg-gray-100 text-gray-800';
                              const isAdded = selectedStems.some(s => s.stemId === stem.id);
                              const qty = parseInt(quantityInput[stem.id] || '0');
                              const total = qty > 0 ? stem.price_usd * qty : 0;

                              return (
                                <tr key={stem.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {stem.stem_name}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    {stem.songs?.title}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {stem.songs?.artists?.artist_name}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${rarityColor}`}>
                                      {stem.rarity}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                                    ${stem.price_usd}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                                    {stem.quantity_available.toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right">
                                    <input
                                      type="number"
                                      min="1"
                                      max={stem.quantity_available}
                                      value={quantityInput[stem.id] || ''}
                                      onChange={(e) => setQuantityInput(prev => ({ ...prev, [stem.id]: e.target.value }))}
                                      placeholder="0"
                                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                      disabled={isAdded}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                    ${total.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-center">
                                    <button
                                      onClick={() => addStemToCart(stem)}
                                      disabled={isAdded || !quantityInput[stem.id] || qty < 1}
                                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                      {isAdded ? 'Added' : 'Add'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Drop Locations</h3>

                  {locations.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Added Locations ({locations.length})</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {locations.map(loc => (
                          <div key={loc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                            <div>
                              <p className="font-medium text-sm">{loc.name}</p>
                              <p className="text-xs text-gray-600">{loc.address}</p>
                            </div>
                            <button
                              onClick={() => removeLocation(loc.id)}
                              className="p-1 hover:bg-red-100 text-red-600 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border border-gray-300 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">New Location</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location Name
                        </label>
                        <input
                          type="text"
                          value={newLocation.name}
                          onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Downtown Cafe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          value={newLocation.address}
                          onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="123 Main St, City, State ZIP"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Drop Pin on Map
                        </label>
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-2 mb-2">
                          <p className="text-xs text-gray-600 mb-2">
                            Click anywhere on the map to drop a pin at the location
                          </p>
                          {mapPosition && (
                            <p className="text-xs text-blue-600 font-medium">
                              Pin dropped at: {mapPosition[0].toFixed(6)}, {mapPosition[1].toFixed(6)}
                            </p>
                          )}
                        </div>
                        <div className="relative bg-white rounded-lg border-2 border-gray-300 overflow-hidden" style={{ height: '300px' }}>
                          <MapContainer
                            center={[34.0522, -118.2437]}
                            zoom={10}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationPicker position={mapPosition} setPosition={setMapPosition} />
                          </MapContainer>
                        </div>
                      </div>
                      <button
                        onClick={addLocation}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        disabled={!mapPosition}
                      >
                        <Plus className="w-4 h-4" />
                        Add Location
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Campaign</h3>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Campaign Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Name:</span>
                          <span className="font-medium text-gray-900">{campaignData.campaign_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Duration:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(campaignData.start_date).toLocaleDateString()} - {new Date(campaignData.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Budget:</span>
                          <span className="font-medium text-gray-900">${parseFloat(campaignData.budget_usd).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Selected Stems ({selectedStems.length})</h4>
                      <div className="space-y-2">
                        {selectedStems.map(stem => {
                          const rarityColors = {
                            'Common': 'bg-gray-100 text-gray-800',
                            'Uncommon': 'bg-green-100 text-green-800',
                            'Rare': 'bg-blue-100 text-blue-800',
                            'Epic': 'bg-purple-100 text-purple-800',
                            'Legendary': 'bg-orange-100 text-orange-800',
                          };
                          const rarityColor = rarityColors[stem.rarity as keyof typeof rarityColors] || 'bg-gray-100 text-gray-800';

                          return (
                            <div key={stem.stemId} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700 flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${rarityColor}`}>
                                  {stem.rarity}
                                </span>
                                {stem.stemName} ({stem.quantity.toLocaleString()}x @ ${stem.price})
                              </span>
                              <span className="font-medium">${(stem.price * stem.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          );
                        })}
                        <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                          <span>Total Stems Cost:</span>
                          <span className="text-blue-600">${calculateTotalCost().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Drop Locations ({locations.length})</h4>
                      <div className="space-y-2">
                        {locations.map(loc => (
                          <div key={loc.id} className="text-sm">
                            <p className="font-medium text-gray-900">{loc.name}</p>
                            <p className="text-gray-600">{loc.address}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Ready to create your campaign! All stems will be purchased and locations will be assigned.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t flex items-center justify-between">
            <button
              onClick={currentStep === 1 ? onClose : handleBack}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
