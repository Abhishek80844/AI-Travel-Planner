import React, { useState } from 'react';
import { LocationCoordinates, NearbyPlace } from '../types/maps';
import { MapPin, Navigation, Layers, Maximize2, Sparkles, Compass } from 'lucide-react';

interface InteractiveMapProps {
  destination: string;
  location?: LocationCoordinates;
  nearbyPlaces?: NearbyPlace[];
  routePath?: LocationCoordinates[];
  height?: string;
  zoom?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  destination,
  location = { lat: 26.9124, lng: 75.7873 }, // Default to Jaipur
  nearbyPlaces = [],
  routePath = [],
  height = 'h-96',
  zoom = 12,
}) => {
  const [mapMode, setMapMode] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);

  // Encode Google Maps Embed URL for clean display
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    destination
  )}&t=${mapMode === 'satellite' ? 'k' : mapMode === 'terrain' ? 'p' : 'm'}&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className={`relative w-full ${height} rounded-3xl overflow-hidden border border-slate-800 shadow-2xl glass-panel group`}>
      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-2xl backdrop-blur-xl shadow-lg">
          <div className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Google Maps Target</span>
            <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              {destination || 'Explore Destination'}
            </span>
          </div>
        </div>

        {/* Map Type Controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl backdrop-blur-xl shadow-lg">
          <button
            type="button"
            onClick={() => setMapMode('standard')}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
              mapMode === 'standard'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Default
          </button>
          <button
            type="button"
            onClick={() => setMapMode('satellite')}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
              mapMode === 'satellite'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setMapMode('terrain')}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
              mapMode === 'terrain'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Terrain
          </button>
        </div>
      </div>

      {/* Embedded Google Map */}
      <iframe
        title={`Google Map - ${destination}`}
        src={mapEmbedUrl}
        className="w-full h-full border-0 filter grayscale-[20%] contrast-[105%] brightness-[95%] transition-all"
        loading="lazy"
        allowFullScreen
      />

      {/* Nearby Places Overlay Drawer */}
      {nearbyPlaces.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-auto">
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3 backdrop-blur-xl shadow-2xl flex items-center gap-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider px-2 shrink-0">
              <Sparkles className="w-3.5 h-3.5" /> Nearby Places:
            </div>
            {nearbyPlaces.map((place) => (
              <button
                type="button"
                key={place.placeId}
                onClick={() => setSelectedPlace(place)}
                className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border shrink-0 transition-all ${
                  selectedPlace?.placeId === place.placeId
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-semibold'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>{place.name}</span>
                {place.rating && <span className="text-amber-400 font-bold">★ {place.rating}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
