import React, { useState, useEffect, useRef } from 'react';
import { searchDestinations } from '../api/maps';
import { PlaceSearchResult } from '../types/maps';
import { MapPin, Search, Star, Compass, Loader2, X } from 'lucide-react';

interface DestinationAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelectPlace?: (place: PlaceSearchResult) => void;
  placeholder?: string;
  className?: string;
  region?: string;
}

export const DestinationAutocomplete: React.FC<DestinationAutocompleteProps> = ({
  value,
  onChange,
  onSelectPlace,
  placeholder = 'Search destination (e.g. Jaipur, Goa, Taj Mahal, New Delhi)...',
  className = '',
  region = 'in',
}) => {
  const [suggestions, setSuggestions] = useState<PlaceSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchDestinations(value, region);
        setSuggestions(results);
        setShowDropdown(true);
      } catch (err) {
        console.error('Autocomplete fetch error', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, region]);

  const handleSelect = (place: PlaceSearchResult) => {
    onChange(place.name);
    setShowDropdown(false);
    if (onSelectPlace) {
      onSelectPlace(place);
    }
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-400">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={(e) => {
            e.target.select();
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          className="block w-full pl-10 pr-24 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm transition-all"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Clear text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {region === 'in' && (
            <div className="pointer-events-none flex items-center text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 shrink-0">
              🇮🇳 IN
            </div>
          )}
        </div>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl max-h-72 overflow-y-auto divide-y divide-slate-800/50">
          {suggestions.map((item) => (
            <button
              type="button"
              key={item.placeId}
              onClick={() => handleSelect(item)}
              className="w-full text-left p-3.5 hover:bg-slate-800/80 transition-colors flex items-start gap-3 group"
            >
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors shrink-0 mt-0.5">
                <Compass className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-white truncate group-hover:text-sky-300 transition-colors">
                    {item.name}
                  </h4>
                  {item.rating && (
                    <span className="flex items-center gap-1 text-xs text-amber-400 font-medium shrink-0">
                      <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{item.formattedAddress}</p>
                {item.category && (
                  <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {item.category}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
