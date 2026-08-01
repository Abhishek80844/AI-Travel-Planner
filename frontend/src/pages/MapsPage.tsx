import React, { useState, useEffect } from 'react';
import { DestinationAutocomplete } from '../components/DestinationAutocomplete';
import { InteractiveMap } from '../components/InteractiveMap';
import { DirectionsPanel } from '../components/DirectionsPanel';
import { getNearbyPlaces, geocodeAddress } from '../api/maps';
import { PlaceSearchResult, NearbyPlace } from '../types/maps';
import { MapPin, Navigation, Compass, Sparkles, Star, Building2, Utensils, ShieldAlert, Layers } from 'lucide-react';

export const MapsPage: React.FC = () => {
  const [destination, setDestination] = useState('Taj Mahal, Agra');
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [placeType, setPlaceType] = useState<string>('tourist_attraction');
  const [loadingNearby, setLoadingNearby] = useState(false);

  const fetchNearby = async (dest: string, type: string) => {
    setLoadingNearby(true);
    try {
      const results = await getNearbyPlaces(dest, 5000, type);
      setNearbyPlaces(results);
    } catch (err) {
      console.error('Failed to fetch nearby places', err);
    } finally {
      setLoadingNearby(false);
    }
  };

  useEffect(() => {
    if (destination) {
      fetchNearby(destination, placeType);
    }
  }, [destination, placeType]);

  const categories = [
    { id: 'tourist_attraction', label: 'Attractions', icon: Compass },
    { id: 'lodging', label: 'Hotels', icon: Building2 },
    { id: 'restaurant', label: 'Dining', icon: Utensils },
    { id: 'hospital', label: 'Emergency Services', icon: ShieldAlert },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
            <MapPin className="w-3.5 h-3.5" /> Google Maps API Integration
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Google Maps & Navigation Explorer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Search destinations, view interactive maps, discover nearby places, and calculate distance & travel time.
          </p>
        </div>

        {/* Quick Region Selector */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            className="text-xs px-3 py-1.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
          >
            🇮🇳 Indian Region Priority
          </button>
        </div>
      </div>

      {/* Main Grid: Map & Autocomplete */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Destination Search Bar */}
          <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Search Destination (Autocomplete & Geocoding)
            </label>
            <DestinationAutocomplete
              value={destination}
              onChange={setDestination}
              onSelectPlace={(place) => {
                setSelectedPlace(place);
                setDestination(place.name);
              }}
              placeholder="Search Indian cities or global landmarks (e.g., Goa, Jaipur, Mumbai, New Delhi)..."
            />
          </div>

          {/* Interactive Map */}
          <InteractiveMap
            destination={destination}
            location={selectedPlace?.location}
            nearbyPlaces={nearbyPlaces}
            height="h-[480px]"
          />

          {/* Nearby Places Explorer */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Nearby Places in {destination}
                </h3>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = placeType === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setPlaceType(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                          : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nearby Cards Grid */}
            {loadingNearby ? (
              <div className="py-8 flex justify-center text-slate-400 text-xs">
                Loading nearby places...
              </div>
            ) : nearbyPlaces.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nearbyPlaces.map((place) => (
                  <div
                    key={place.placeId}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-sky-500/40 transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        {place.name}
                      </h4>
                      {place.rating && (
                        <span className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0">
                          <Star className="w-3 h-3 fill-amber-400" /> {place.rating}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{place.address}</span>
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                      <span className="text-sky-400 font-semibold">{place.category}</span>
                      {place.distanceKm && (
                        <span className="text-slate-400">{place.distanceKm} km away</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No nearby places found.</p>
            )}
          </div>
        </div>

        {/* Sidebar: Route & Directions Calculator */}
        <div className="space-y-6">
          <DirectionsPanel initialDestination={destination} />
        </div>
      </div>
    </div>
  );
};
