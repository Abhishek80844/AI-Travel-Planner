import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, CloudSun, MapPin, ShieldCheck, Share2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-slate-950">
      {/* Hero Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-500/15 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card text-sky-400 border border-sky-500/30 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            <span>Next-Generation AI Travel Assistant</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]"
          >
            Plan Your Next Dream Journey in{' '}
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Seconds with AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Custom day-by-day itineraries tailored to your budget, travel style, destination weather forecasts, hotel recommendations, packing lists, and emergency support.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/create-trip"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-lg shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-3"
            >
              <span>Create AI Itinerary</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel hover:bg-slate-800/60 text-slate-200 font-semibold text-lg border border-slate-800 transition-all hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Explore Features</span>
            </Link>
          </motion.div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ y: -8 }}
            className="glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden"
          >
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 w-fit mb-6 border border-sky-500/20">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Structured AI Itineraries</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Get intelligent morning, afternoon, and evening daily breakdowns formatted strictly for your budget and group type.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            className="glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden"
          >
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 w-fit mb-6 border border-indigo-500/20">
              <CloudSun className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Real-time Weather & Caching</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Live weather forecasts backed by PostgreSQL caching so you always pack right and prepare for local climates.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            className="glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden"
          >
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 w-fit mb-6 border border-purple-500/20">
              <Share2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Shareable & PDF Export</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Generate public read-only trip links for your traveling companions and export offline PDF travel documents.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
