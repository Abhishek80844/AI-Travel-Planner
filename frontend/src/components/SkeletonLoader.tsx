import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, CloudSun, Hotel, Utensils } from 'lucide-react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
        className="inline-flex p-5 rounded-3xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-400 shadow-2xl"
      >
        <Compass className="w-12 h-12 animate-spin-slow" />
      </motion.div>

      <div className="space-y-3">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Crafting Your Smart AI Itinerary...
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Analysing weather patterns, curating top-rated hotels, finding local culinary gems, and building your personalized daily schedule.
        </p>
      </div>

      {/* Progress steps animation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col items-center space-y-2 animate-pulse">
          <Sparkles className="w-6 h-6 text-sky-400" />
          <span className="text-xs text-slate-300 font-medium">Daily Schedule</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col items-center space-y-2 animate-pulse delay-75">
          <CloudSun className="w-6 h-6 text-indigo-400" />
          <span className="text-xs text-slate-300 font-medium">Weather Forecast</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col items-center space-y-2 animate-pulse delay-150">
          <Hotel className="w-6 h-6 text-purple-400" />
          <span className="text-xs text-slate-300 font-medium">Lodging & Hotels</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col items-center space-y-2 animate-pulse delay-200">
          <Utensils className="w-6 h-6 text-emerald-400" />
          <span className="text-xs text-slate-300 font-medium">Dining & Cafes</span>
        </div>
      </div>

      {/* Content Skeleton Placeholders */}
      <div className="space-y-4 pt-6 text-left max-w-3xl mx-auto">
        <div className="h-8 bg-slate-900/80 rounded-xl w-3/4 animate-pulse border border-slate-800" />
        <div className="h-24 bg-slate-900/60 rounded-2xl w-full animate-pulse border border-slate-800/80" />
        <div className="h-24 bg-slate-900/60 rounded-2xl w-full animate-pulse border border-slate-800/80" />
      </div>
    </div>
  );
};
