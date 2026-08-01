import React, { useState } from 'react';
import { getDirections } from '../api/maps';
import { RouteDirections } from '../types/maps';
import { DestinationAutocomplete } from './DestinationAutocomplete';
import { Navigation, Car, Bus, Footprints, Bike, Clock, MapPin, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

interface DirectionsPanelProps {
  initialOrigin?: string;
  initialDestination?: string;
  onRouteCalculated?: (route: RouteDirections) => void;
}

export const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  initialOrigin = 'New Delhi',
  initialDestination = 'Taj Mahal, Agra',
  onRouteCalculated,
}) => {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [travelMode, setTravelMode] = useState<'driving' | 'transit' | 'walking' | 'bicycling'>('driving');
  const [route, setRoute] = useState<RouteDirections | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculateRoute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      setError('Please enter both origin and destination.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await getDirections(origin, destination, travelMode);
      setRoute(data);
      if (onRouteCalculated) {
        onRouteCalculated(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to calculate directions.');
    } finally {
      setLoading(false);
    }
  };

  const travelModes = [
    { id: 'driving', label: 'Driving', icon: Car },
    { id: 'transit', label: 'Transit', icon: Bus },
    { id: 'walking', label: 'Walking', icon: Footprints },
    { id: 'bicycling', label: 'Cycling', icon: Bike },
  ];

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20 text-white">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Route & Directions Calculator</h3>
            <p className="text-xs text-slate-400">Calculate exact distance, travel time & turn-by-turn route</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleCalculateRoute} className="space-y-4">
        {/* Origin & Destination inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Origin City / Location
            </label>
            <DestinationAutocomplete
              value={origin}
              onChange={setOrigin}
              placeholder="e.g. New Delhi, Mumbai, Jaipur..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Destination Location
            </label>
            <DestinationAutocomplete
              value={destination}
              onChange={setDestination}
              placeholder="e.g. Taj Mahal, Goa, Bengaluru..."
            />
          </div>
        </div>

        {/* Travel Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
            {travelModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = travelMode === mode.id;
              return (
                <button
                  type="button"
                  key={mode.id}
                  onClick={() => setTravelMode(mode.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            <span>Calculate Route</span>
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Calculated Route Results */}
      {route && (
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Total Distance</span>
              <div className="text-xl font-extrabold text-white tracking-tight flex items-center gap-1">
                <span>{route.totalDistanceText}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Travel Duration</span>
              <div className="text-xl font-extrabold text-emerald-400 tracking-tight flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{route.totalDurationText}</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Travel Mode</span>
              <div className="text-base font-bold text-sky-400 capitalize tracking-tight">
                {route.travelMode} Route
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Steps */}
          {route.steps && route.steps.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Step-by-Step Directions ({route.steps.length} steps)
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {route.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-3 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-400 font-bold flex items-center justify-center shrink-0">
                      {step.stepNumber}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 font-medium">{step.instruction}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                        {step.distanceText && <span>Dist: {step.distanceText}</span>}
                        {step.durationText && <span>Est: {step.durationText}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
