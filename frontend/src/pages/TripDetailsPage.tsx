import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripById, updateItineraryDay, togglePackingItem, addPackingItem, deletePackingItem } from '../api/trips';
import { Trip, Itinerary, PackingItem } from '../types';
import { WeatherWidget } from '../components/WeatherWidget';
import { ItineraryTimeline } from '../components/ItineraryTimeline';
import { HotelRestaurantCards } from '../components/HotelRestaurantCards';
import { PackingChecklist } from '../components/PackingChecklist';
import { AiChatDrawer } from '../components/AiChatDrawer';
import { EmergencyModal } from '../components/EmergencyModal';
import { MapPin, Calendar, DollarSign, Users, Share2, Download, ArrowLeft, Check, Compass } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchTrip = async () => {
    if (!id) return;
    try {
      const data = await getTripById(id);
      setTrip(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Trip not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const handleUpdateDay = async (itineraryId: number, updated: Partial<Itinerary>) => {
    if (!trip) return;
    try {
      const res = await updateItineraryDay(trip.id, itineraryId, updated);
      setTrip((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          itineraries: prev.itineraries.map((i) => (i.id === itineraryId ? { ...i, ...res } : i)),
        };
      });
    } catch (err) {
      console.error('Failed to update itinerary day', err);
    }
  };

  const handleTogglePacking = async (itemId: number) => {
    if (!trip) return;
    try {
      const res = await togglePackingItem(trip.id, itemId);
      setTrip((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          packingLists: prev.packingLists.map((p) => (p.id === itemId ? { ...p, isChecked: res.isChecked } : p)),
        };
      });
    } catch (err) {
      console.error('Failed to toggle packing item', err);
    }
  };

  const handleAddPacking = async (newItem: { item: string; category: string }) => {
    if (!trip) return;
    try {
      const res = await addPackingItem(trip.id, newItem);
      setTrip((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          packingLists: [...prev.packingLists, res],
        };
      });
    } catch (err) {
      console.error('Failed to add packing item', err);
    }
  };

  const handleDeletePacking = async (itemId: number) => {
    if (!trip) return;
    try {
      await deletePackingItem(trip.id, itemId);
      setTrip((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          packingLists: prev.packingLists.filter((p) => p.id !== itemId),
        };
      });
    } catch (err) {
      console.error('Failed to delete packing item', err);
    }
  };

  const handleCopyShare = () => {
    if (!trip?.shareToken) return;
    const shareUrl = `${window.location.origin}/share/${trip.shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportPDF = () => {
    if (!printRef.current || !trip) return;
    setExporting(true);

    const opt = {
      margin: 10,
      filename: `${trip.destination.replace(/ /g, '_')}_Itinerary.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf()
      .from(printRef.current)
      .set(opt)
      .save()
      .then(() => setExporting(false))
      .catch((err) => {
        console.error('PDF Export Error', err);
        setExporting(false);
      });
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Fetching trip details...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="glass-panel p-8 rounded-3xl border border-rose-500/20 space-y-3">
          <h3 className="text-xl font-bold text-white">Trip Not Found</h3>
          <p className="text-slate-400 text-sm">{error || 'The requested trip does not exist.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sky-400 font-semibold hover:text-sky-300 transition-colors text-sm"
          >
            &larr; Back to Saved Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <EmergencyModal tripId={trip.id} destination={trip.destination} />

          <button
            onClick={handleCopyShare}
            className="inline-flex items-center space-x-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-sky-400" />}
            <span>{copied ? 'Link Copied!' : 'Share Public Link'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="inline-flex items-center space-x-2 text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-4 py-2 rounded-xl shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Exporting PDF...' : 'Export to PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Printable Content Container */}
      <div ref={printRef} className="space-y-8">
        {/* Trip Banner Header */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {trip.travelStyle} Trip
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight flex items-center space-x-3 pt-1">
                <MapPin className="w-8 h-8 text-sky-400 shrink-0" />
                <span>{trip.destination}</span>
              </h1>
              <p className="text-slate-400 text-sm">
                Generated AI Itinerary tailored for {trip.travelers} traveler(s)
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

        {/* Itinerary Timeline */}
        <ItineraryTimeline itineraries={trip.itineraries} onUpdateDay={handleUpdateDay} />

        {/* Lodging & Dining */}
        <HotelRestaurantCards hotels={trip.hotels} restaurants={trip.restaurants} />

        {/* Packing Checklist */}
        <PackingChecklist
          items={trip.packingLists}
          onToggleItem={handleTogglePacking}
          onAddItem={handleAddPacking}
          onDeleteItem={handleDeletePacking}
        />
      </div>

      {/* Floating AI Chat Assistant Drawer */}
      <AiChatDrawer tripId={trip.id} destination={trip.destination} />
    </div>
  );
};
