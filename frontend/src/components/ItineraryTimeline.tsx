import React, { useState } from 'react';
import { Itinerary } from '../types';
import { Sun, Sunset, Moon, Edit3, Save, X, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface ItineraryTimelineProps {
  itineraries: Itinerary[];
  onUpdateDay?: (itineraryId: number, updated: Partial<Itinerary>) => Promise<void>;
  isReadOnly?: boolean;
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  itineraries,
  onUpdateDay,
  isReadOnly = false,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMorning, setEditMorning] = useState('');
  const [editAfternoon, setEditAfternoon] = useState('');
  const [editEvening, setEditEvening] = useState('');
  const [saving, setSaving] = useState(false);

  if (!itineraries || itineraries.length === 0) return null;

  const currentItinerary = itineraries.find((i) => i.day === selectedDay) || itineraries[0];

  const handleStartEdit = (item: Itinerary) => {
    if (isReadOnly || !item.id) return;
    setEditingId(item.id);
    setEditMorning(item.morning);
    setEditAfternoon(item.afternoon);
    setEditEvening(item.evening);
  };

  const handleSave = async () => {
    if (!editingId || !onUpdateDay) return;
    setSaving(true);
    try {
      await onUpdateDay(editingId, {
        morning: editMorning,
        afternoon: editAfternoon,
        evening: editEvening,
      });
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update day itinerary', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <span>Day-by-Day Itinerary Timeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Select a day to view or edit morning, afternoon, and evening activities
          </p>
        </div>

        {!isReadOnly && currentItinerary.id && editingId !== currentItinerary.id && (
          <button
            onClick={() => handleStartEdit(currentItinerary)}
            className="self-start sm:self-auto inline-flex items-center space-x-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 px-3.5 py-2 rounded-xl transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Day {selectedDay}</span>
          </button>
        )}
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {itineraries.map((item) => (
          <button
            key={item.day}
            onClick={() => {
              setSelectedDay(item.day);
              setEditingId(null);
            }}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
              selectedDay === item.day
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25 scale-105'
                : 'glass-card text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
            }`}
          >
            Day {item.day}
          </button>
        ))}
      </div>

      {/* Timeline Cards */}
      <motion.div
        key={selectedDay}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 pt-2"
      >
        {editingId === currentItinerary.id ? (
          <div className="space-y-4 glass-card p-6 rounded-2xl border border-sky-500/30">
            <h4 className="text-sm font-bold text-sky-400 uppercase tracking-wider">
              Editing Activities for Day {selectedDay}
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1 flex items-center space-x-1">
                  <Sun className="w-4 h-4" /> <span>Morning Activity</span>
                </label>
                <textarea
                  rows={3}
                  value={editMorning}
                  onChange={(e) => setEditMorning(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sky-400 mb-1 flex items-center space-x-1">
                  <Sunset className="w-4 h-4" /> <span>Afternoon Activity</span>
                </label>
                <textarea
                  rows={3}
                  value={editAfternoon}
                  onChange={(e) => setEditAfternoon(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-400 mb-1 flex items-center space-x-1">
                  <Moon className="w-4 h-4" /> <span>Evening Activity</span>
                </label>
                <textarea
                  rows={3}
                  value={editEvening}
                  onChange={(e) => setEditEvening(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setEditingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 shadow-md transition-all flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Morning */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-all flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Sun className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Morning</span>
                <p className="text-slate-200 text-sm leading-relaxed">{currentItinerary.morning}</p>
              </div>
            </div>

            {/* Afternoon */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-sky-500/30 transition-all flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                <Sunset className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Afternoon</span>
                <p className="text-slate-200 text-sm leading-relaxed">{currentItinerary.afternoon}</p>
              </div>
            </div>

            {/* Evening */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                <Moon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Evening</span>
                <p className="text-slate-200 text-sm leading-relaxed">{currentItinerary.evening}</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
