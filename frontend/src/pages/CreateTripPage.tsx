import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip } from '../api/trips';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { DestinationAutocomplete } from '../components/DestinationAutocomplete';
import { Compass, MapPin, DollarSign, Calendar, Users, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const CreateTripPage: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState<number>(1200);
  const [days, setDays] = useState<number>(5);
  const [travelStyle, setTravelStyle] = useState<string>('Couple');
  const [travelers, setTravelers] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const travelStyles = [
    { id: 'Solo', label: 'Solo Traveler', icon: '🧭' },
    { id: 'Couple', label: 'Couple Escape', icon: '❤️' },
    { id: 'Family', label: 'Family Vacation', icon: '👨‍👩‍👧‍👦' },
    { id: 'Friends', label: 'Friends Getaway', icon: '🎉' },
  ];

  const popularDestinations = [
    'Taj Mahal, Agra',
    'Jaipur, Rajasthan',
    'Goa Beaches',
    'Mumbai, Maharashtra',
    'New Delhi',
    'Bengaluru, Karnataka',
    'Kerala Backwaters',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setError('Please enter a destination');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const trip = await createTrip({
        destination: destination.trim(),
        budget,
        days,
        travelStyle,
        travelers,
      });
      navigate(`/trips/${trip.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate trip itinerary. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20 mb-2">
          <Compass className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Design Your Smart AI Trip
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Set your travel parameters and our AI engine will generate a customized day-by-day itinerary with weather & hotels.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        {/* Destination */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Target Destination (Google Maps Search & Autocomplete)
          </label>
          <DestinationAutocomplete
            value={destination}
            onChange={setDestination}
            placeholder="Search destination (e.g. Taj Mahal Agra, Jaipur, Goa, New Delhi, Mumbai)..."
          />

          {/* Quick selection chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs text-slate-500 flex items-center py-1 font-semibold">Popular (India & Global):</span>
            {popularDestinations.map((dest) => (
              <button
                type="button"
                key={dest}
                onClick={() => setDestination(dest)}
                className="text-xs px-3 py-1 rounded-xl glass-card hover:bg-slate-800 text-slate-300 hover:text-sky-400 border border-slate-800 transition-colors"
              >
                {dest}
              </button>
            ))}
          </div>
        </div>

        {/* Days & Budget Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Trip Duration (Days)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Calendar className="w-5 h-5 text-indigo-400" />
              </div>
              <input
                type="number"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                className="block w-full pl-10 pr-4 py-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Budget ($ USD)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <input
                type="number"
                min={50}
                step={50}
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 100)}
                className="block w-full pl-10 pr-4 py-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Travel Style Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Travel Style & Companions
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {travelStyles.map((style) => (
              <button
                type="button"
                key={style.id}
                onClick={() => setTravelStyle(style.id)}
                className={`p-4 rounded-2xl border flex flex-col items-center text-center space-y-1 transition-all ${
                  travelStyle === style.id
                    ? 'bg-sky-500/10 border-sky-500 text-white shadow-lg shadow-sky-500/10'
                    : 'glass-card border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-2xl">{style.icon}</span>
                <span className="text-xs font-bold">{style.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Travelers Count */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Number of Travelers
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <input
              type="number"
              min={1}
              max={20}
              value={travelers}
              onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
              className="block w-full pl-10 pr-4 py-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <span>Generate Full AI Itinerary</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
