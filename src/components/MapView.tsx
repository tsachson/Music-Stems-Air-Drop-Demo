import React, { useState, useEffect } from 'react';
import { Search, Music, Package, CheckCircle, MapPin, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { supabase } from '../lib/supabase';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  userType?: 'artist' | 'creator' | 'sponsor';
  userId?: string;
  creatorId?: string;
}

interface LocationData {
  id: string;
  location_name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  campaign_id: string;
  campaign_name: string;
  songs: Array<{
    title: string;
    artist_name: string;
    genre: string;
    stems: Array<{
      id: string;
      stem_name: string;
      stem_type: string;
      rarity: string;
    }>;
  }>;
}

export function MapView({ userType, userId, creatorId }: MapViewProps) {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [collecting, setCollecting] = useState<string | null>(null);
  const [collectedStems, setCollectedStems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMapData();
    if (creatorId) {
      loadCollectedStems();
    }
  }, [creatorId]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadMapData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadMapData = async () => {
    setLoading(true);

    const { data: locationsData, error } = await supabase
      .from('campaign_locations')
      .select(`
        id,
        location_name,
        address,
        latitude,
        longitude,
        campaign_id,
        campaigns!inner(
          id,
          campaign_name,
          end_date
        )
      `)
      .order('location_name');

    if (error) {
      console.error('Error loading map data:', error);
      setLoading(false);
      return;
    }

    console.log('Loaded map locations:', locationsData?.length || 0);

    const enrichedLocations: LocationData[] = await Promise.all(
      (locationsData || []).map(async (loc: any) => {
        const addressParts = loc.address?.split(',') || [];
        const city = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() : 'Unknown';
        const stateZip = addressParts[addressParts.length - 1]?.trim() || '';
        const state = stateZip.split(' ')[0] || 'Unknown';

        const { data: campaignStemsData, error: stemsError } = await supabase
          .from('campaign_stems')
          .select('stem_id')
          .eq('campaign_id', loc.campaign_id);

        if (stemsError) {
          console.error('Error loading campaign stems for', loc.location_name, ':', stemsError);
        }

        const stemIds = campaignStemsData?.map(cs => cs.stem_id) || [];
        console.log(`Campaign ${loc.campaign_id} (${loc.location_name}) has ${stemIds.length} stems`);

        let allStemsData: any[] = [];
        if (stemIds.length > 0) {
          const { data: stemsWithSongs, error: stemsWithSongsError } = await supabase
            .from('stems')
            .select(`
              id,
              stem_name,
              stem_type,
              rarity,
              song_id,
              songs(
                id,
                title,
                genre,
                artist_id,
                artists(
                  id,
                  artist_name
                )
              )
            `)
            .in('id', stemIds);

          if (stemsWithSongsError) {
            console.error('Error loading stems with songs for', loc.location_name, ':', stemsWithSongsError);
          } else {
            allStemsData = stemsWithSongs || [];
            console.log(`Loaded ${allStemsData.length} stems with songs for ${loc.location_name}`);
          }
        }

        const songsMap = new Map<string, any>();

        console.log(`Processing ${allStemsData.length} stems for ${loc.location_name}`);

        allStemsData.forEach((stem: any) => {
          if (stem.songs && stem.songs.id) {
            const song = stem.songs;
            const artist = stem.songs.artists;
            const songKey = `${song.id}`;

            if (!songsMap.has(songKey)) {
              songsMap.set(songKey, {
                title: song.title || 'Unknown Song',
                artist_name: artist?.artist_name || 'Unknown Artist',
                genre: song.genre || 'Other',
                stems: []
              });
            }

            songsMap.get(songKey).stems.push({
              id: stem.id,
              stem_name: stem.stem_name,
              stem_type: stem.stem_type,
              rarity: stem.rarity
            });
          } else {
            console.warn('Stem missing song data:', stem.id, stem.stem_name);
          }
        });

        console.log(`${loc.location_name}: ${songsMap.size} unique songs found`);

        const latitude = typeof loc.latitude === 'string' ? parseFloat(loc.latitude) : (loc.latitude || 0);
        const longitude = typeof loc.longitude === 'string' ? parseFloat(loc.longitude) : (loc.longitude || 0);

        return {
          id: loc.id,
          location_name: loc.location_name,
          address: loc.address,
          city: city,
          state: state,
          latitude: latitude,
          longitude: longitude,
          campaign_id: loc.campaign_id,
          campaign_name: loc.campaigns?.campaign_name || 'Unknown Campaign',
          songs: Array.from(songsMap.values())
        };
      })
    );

    console.log('Enriched locations:', enrichedLocations.length, enrichedLocations.slice(0, 2));
    setLocations(enrichedLocations);
    setLoading(false);
  };

  const loadCollectedStems = async () => {
    if (!creatorId) return;

    const { data } = await supabase
      .from('collected_stems')
      .select('stem_id')
      .eq('creator_id', creatorId);

    if (data) {
      setCollectedStems(new Set(data.map(cs => cs.stem_id)));
    }
  };

  const collectStem = async (stemId: string, campaignId: string) => {
    if (!creatorId) {
      alert('You must be logged in as a creator to collect stems.');
      return;
    }

    setCollecting(stemId);

    const { data: additiveStem } = await supabase
      .from('stems')
      .select('song_id')
      .eq('id', stemId)
      .maybeSingle();

    if (!additiveStem) {
      setCollecting(null);
      alert('Error: Stem not found.');
      return;
    }

    const { data: coreStems } = await supabase
      .from('stems')
      .select('id')
      .eq('song_id', additiveStem.song_id)
      .eq('stem_type', 'Core');

    const stemsToCollect = [
      { creator_id: creatorId, stem_id: stemId, campaign_id: campaignId },
      ...(coreStems || []).map(coreStem => ({
        creator_id: creatorId,
        stem_id: coreStem.id,
        campaign_id: campaignId,
      }))
    ];

    const { data: freshCollectedStems } = await supabase
      .from('collected_stems')
      .select('stem_id')
      .eq('creator_id', creatorId)
      .in('stem_id', stemsToCollect.map(s => s.stem_id));

    const alreadyCollectedSet = new Set(freshCollectedStems?.map(cs => cs.stem_id) || []);
    const stemsToInsert = stemsToCollect.filter(stem => !alreadyCollectedSet.has(stem.stem_id));

    if (stemsToInsert.length === 0) {
      setCollecting(null);
      alert('You have already collected this stem and all its Core stems.');
      return;
    }

    const { data: insertedStems, error } = await supabase
      .from('collected_stems')
      .insert(stemsToInsert)
      .select('stem_id');

    setCollecting(null);

    if (error) {
      console.error('Collection error:', error);
      alert('Error collecting stem. Please try again.');
      return;
    }

    const newStemIds = insertedStems?.map(s => s.stem_id) || [];
    await loadCollectedStems();
    const coreCount = newStemIds.length - 1;
    alert(`Stem collected successfully!${coreCount > 0 ? ` ${coreCount} Core stems automatically added.` : ''}`);
    await loadMapData();
  };

  const genreColors: { [key: string]: string } = {
    'Rock': '#dc2626',
    'Pop': '#16a34a',
    'Hip-Hop': '#eab308',
    'Electronic': '#2563eb',
    'Jazz': '#9333ea',
    'R&B': '#ec4899',
    'Gospel': '#f59e0b',
    'Country': '#ea580c',
    'World': '#06b6d4',
    'Other': '#6b7280',
  };

  const genres = ['All', ...Object.keys(genreColors)];

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = searchQuery === '' ||
      loc.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.campaign_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.songs.some(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist_name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesGenre = selectedGenre === 'All' ||
      loc.songs.some(song => song.genre === selectedGenre);

    return matchesSearch && matchesGenre;
  });

  console.log('Filtered locations for map:', filteredLocations.length);

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Drop Locations Map</h2>
          <button
            onClick={() => loadMapData()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by location, campaign, artist, or song..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Legend:</span>
          {Object.entries(genreColors).map(([genre, color]) => (
            <div key={genre} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-xs text-gray-600">{genre}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-gray-50">
        {loading ? (
          <div className="relative bg-white rounded-lg border-2 border-gray-300 overflow-hidden flex items-center justify-center" style={{ height: '600px' }}>
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading drop locations...</p>
            </div>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="relative bg-white rounded-lg border-2 border-gray-300 overflow-hidden flex items-center justify-center" style={{ height: '600px' }}>
            <div className="text-center p-8">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-2">No active drop locations found</p>
              <p className="text-gray-500 text-sm">Check back later for new campaigns</p>
            </div>
          </div>
        ) : (
          <div className="relative bg-white rounded-lg border-2 border-gray-300 overflow-hidden" style={{ height: '600px' }}>
            <MapContainer
              center={[39.8283, -98.5795]}
              zoom={4}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {filteredLocations.map((loc) => {
                if (!loc.latitude || !loc.longitude) {
                  console.warn('Location missing coordinates:', loc.location_name, loc.latitude, loc.longitude);
                  return null;
                }

              const primaryGenre = loc.songs[0]?.genre || 'Other';
              const color = genreColors[primaryGenre] || genreColors['Other'];
              const allGenres = [...new Set(loc.songs.map(s => s.genre))];

              return (
                <CircleMarker
                  key={loc.id}
                  center={[loc.latitude, loc.longitude]}
                  radius={12}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: 0.8,
                    color: '#ffffff',
                    weight: 3
                  }}
                  eventHandlers={{
                    click: () => setSelectedLocation(loc)
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <h3 className="font-bold">{loc.location_name}</h3>
                      <p className="text-gray-600">{loc.city}, {loc.state}</p>
                      <p className="text-blue-600 font-medium mt-1">{loc.songs.length} song(s) available</p>
                      <div className="mt-2">
                        {allGenres.map((genre) => (
                          <span
                            key={genre}
                            className="inline-block text-xs px-2 py-0.5 rounded-full text-white mr-1 mb-1"
                            style={{ backgroundColor: genreColors[genre] || genreColors['Other'] }}
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        )}

        {selectedLocation && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedLocation.location_name}</h3>
                <p className="text-sm text-gray-600">{selectedLocation.address}</p>
                <p className="text-sm text-gray-600">{selectedLocation.city}, {selectedLocation.state}</p>
                <p className="text-sm font-medium text-blue-700 mt-2">Campaign: {selectedLocation.campaign_name}</p>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Music className="w-5 h-5 text-blue-600" />
                Songs Available at This Location:
              </h4>
              <div className="space-y-3">
                {selectedLocation.songs.map((song, index) => (
                  <div key={index} className="bg-white border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{song.title}</p>
                        <p className="text-sm text-gray-600">by {song.artist_name}</p>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: genreColors[song.genre] || genreColors['Other'] }}
                      >
                        {song.genre}
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Available Stems:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {song.stems
                          .filter(stem => stem.stem_type === 'Additive')
                          .map((stem, stemIndex) => {
                          const isCollected = collectedStems.has(stem.id);
                          const isCollecting = collecting === stem.id;
                          const rarityColors = {
                            'Common': 'bg-gray-100 text-gray-800 border-gray-300',
                            'Uncommon': 'bg-green-100 text-green-800 border-green-300',
                            'Rare': 'bg-blue-100 text-blue-800 border-blue-300',
                            'Epic': 'bg-purple-100 text-purple-800 border-purple-300',
                            'Legendary': 'bg-orange-100 text-orange-800 border-orange-300',
                          };
                          const rarityColor = rarityColors[stem.rarity as keyof typeof rarityColors] || 'bg-gray-100 text-gray-800 border-gray-300';

                          return (
                            <div
                              key={stemIndex}
                              className={`border rounded-lg p-3 ${rarityColor.split(' ')[2] ? `border-${rarityColor.split(' ')[2]}` : 'border-gray-300'}`}
                            >
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-2 ${rarityColor.split(' ').slice(0, 2).join(' ')}`}>
                                {stem.rarity}
                              </span>
                              <p className="text-xs font-medium text-gray-900 mb-1">{stem.stem_name}</p>
                              <p className="text-xs text-gray-600 mb-2">({stem.stem_type})</p>
                              {creatorId && (
                                <button
                                  onClick={() => collectStem(stem.id, selectedLocation.campaign_id)}
                                  disabled={isCollected || isCollecting}
                                  className={`w-full py-1.5 px-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                                    isCollected
                                      ? 'bg-green-600 text-white cursor-not-allowed'
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                                >
                                  {isCollecting ? (
                                    'Collecting...'
                                  ) : isCollected ? (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      Collected
                                    </>
                                  ) : (
                                    'Collect'
                                  )}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && filteredLocations.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredLocations.map((loc) => {
            const primaryGenre = loc.songs[0]?.genre || 'Other';
            const allGenres = [...new Set(loc.songs.map(s => s.genre))];

            return (
              <div
                key={loc.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedLocation(loc)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: genreColors[primaryGenre] || genreColors['Other'] }}
                  >
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">{loc.location_name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{loc.city}, {loc.state}</p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">{loc.songs.length} song(s)</p>
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Artists:</p>
                      {loc.songs.slice(0, 2).map((song, index) => (
                        <p key={index} className="text-xs text-gray-600">
                          • {song.artist_name} - {song.title}
                        </p>
                      ))}
                      {loc.songs.length > 2 && (
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          +{loc.songs.length - 2} more
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {allGenres.map((genre) => (
                        <span
                          key={genre}
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: genreColors[genre] || genreColors['Other'] }}
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}
