import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserTrips, deleteTrip } from '../api/trips';
import { Trip } from '../types';
import { PlusCircle, MapPin, Calendar, DollarSign, Users, Trash2, Share2, Compass, Search, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export const DashboardPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchTrips = async () => {
    try {
      const data = await getUserTrips();
      setTrips(data);
    } catch (err) {
      console.error('Failed to fetch user trips', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip itinerary?')) return;

    try {
      await deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete trip', err);
    }
  };

  const handleCopyShare = (e: React.MouseEvent, shareToken?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!shareToken) return;

    const shareUrl = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedToken(shareToken);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const filteredTrips = trips.filter((t) =>
    t.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Saved Trips</h1>
          <p className="text-slate-400 text-sm mt-1">Manage, edit, and share your AI itineraries</p>
        </div>

        <Link
          to="/create-trip"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-sky-500/25 transition-all hover:scale-105"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* Search Bar */}
      {trips.length > 0 && (
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search trips by destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading saved itineraries...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-sky-400">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {search ? 'No trips match your search' : 'No trips created yet'}
          </h3>
          <p className="text-slate-400 text-sm">
            {search
              ? 'Try searching for a different destination.'
              : 'Start your first journey by entering your destination, budget, and travel dates.'}
          </p>
          <Link
            to="/create-trip"
            className="inline-block pt-2 text-sky-400 font-semibold hover:text-sky-300 transition-colors text-sm"
          >
            Create trip now &rarr;
          </Link>
        </div>
      ) : (
        /* Trips Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <motion.div
              key={trip.id}
              whileHover={{ y: -6 }}
              className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition-all shadow-xl"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {trip.travelStyle} Trip
                    </span>
                    <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors flex items-center space-x-1.5 pt-1">
                      <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>{trip.destination}</span>
                    </h3>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleCopyShare(e, trip.shareToken)}
                      title="Copy Public Share Link"
                      className="p-2 text-slate-400 hover:text-sky-400 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, trip.id)}
                      title="Delete Trip"
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {copiedToken === trip.shareToken && (
                  <div className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-center font-medium">
                    Share link copied to clipboard!
                  </div>
                )}

                {/* Trip Stats */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px]">Duration</span>
                    <span className="font-semibold text-slate-200 flex items-center">
                      <Calendar className="w-3 h-3 text-indigo-400 mr-1" />
                      {trip.days} Days
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px]">Budget</span>
                    <span className="font-semibold text-slate-200 flex items-center">
                      <DollarSign className="w-3 h-3 text-emerald-400 mr-1" />
                      ${trip.budget}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px]">Travelers</span>
                    <span className="font-semibold text-slate-200 flex items-center">
                      <Users className="w-3 h-3 text-purple-400 mr-1" />
                      {trip.travelers}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Created {new Date(trip.createdDate).toLocaleDateString()}
                </span>
                <Link
                  to={`/trips/${trip.id}`}
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center space-x-1"
                >
                  <span>View Itinerary</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
