import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTripByShareToken } from '../api/trips';
import { Trip } from '../types';
import { WeatherWidget } from '../components/WeatherWidget';
import { ItineraryTimeline } from '../components/ItineraryTimeline';
import { HotelRestaurantCards } from '../components/HotelRestaurantCards';
import { PackingChecklist } from '../components/PackingChecklist';
import { Compass, MapPin, Calendar, DollarSign, Users, Sparkles } from 'lucide-react';

export const SharedTripPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedTrip = async () => {
      if (!shareToken) return;
      try {
        const data = await getTripByShareToken(shareToken);
        setTrip(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Shared trip not found or expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedTrip();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading shared itinerary...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="glass-panel p-8 rounded-3xl border border-rose-500/20 space-y-3">
          <h3 className="text-xl font-bold text-white">Itinerary Not Found</h3>
          <p className="text-slate-400 text-sm">{error || 'This shared link is invalid.'}</p>
          <Link
            to="/"
            className="inline-block pt-2 text-sky-400 font-semibold hover:text-sky-300 transition-colors text-sm"
          >
            Go to Homepage &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner Notice */}
      <div className="glass-card p-4 rounded-2xl border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center space-x-2 text-sky-400 text-sm font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>You are viewing a shared travel itinerary</span>
        </div>
        <Link
          to="/register"
          className="text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-xl transition-all"
        >
          Create Your Own AI Trip &rarr;
        </Link>
      </div>

      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {trip.travelStyle} Trip
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight flex items-center space-x-3 pt-1">
              <MapPin className="w-8 h-8 text-sky-400 shrink-0" />
              <span>{trip.destination}</span>
            </h1>
            <p className="text-slate-400 text-sm">
              Shared AI Itinerary for {trip.travelers} traveler(s)
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 glass-card p-4 rounded-2xl border border-slate-800/80 text-center shrink-0">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Duration</span>
              <span className="text-sm font-extrabold text-white flex items-center justify-center mt-1">
                <Calendar className="w-4 h-4 text-indigo-400 mr-1" />
                {trip.days} Days
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Budget</span>
              <span className="text-sm font-extrabold text-sky-400 flex items-center justify-center mt-1">
                <DollarSign className="w-4 h-4 text-emerald-400 mr-0.5" />
                ${trip.budget}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Group</span>
              <span className="text-sm font-extrabold text-white flex items-center justify-center mt-1">
                <Users className="w-4 h-4 text-purple-400 mr-1" />
                {trip.travelers}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Widget */}
      <WeatherWidget forecasts={trip.weatherForecasts || []} destination={trip.destination} />

      {/* Itinerary Timeline (Read Only) */}
      <ItineraryTimeline itineraries={trip.itineraries} isReadOnly={true} />

      {/* Lodging & Dining */}
      <HotelRestaurantCards hotels={trip.hotels} restaurants={trip.restaurants} />

      {/* Packing Checklist (Read Only) */}
      <PackingChecklist items={trip.packingLists} isReadOnly={true} />
    </div>
  );
};
