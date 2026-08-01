import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { AuthResponse } from '../types';
import { Compass, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      login(response.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-8 glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden"
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/30 mb-4">
            <Compass className="w-8 h-8 text-white animate-spin-slow" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your saved trips and smart itineraries
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  placeholder="alex@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="flex items-center space-x-2">
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>

          <div className="text-center text-sm">
            <span className="text-slate-400">Don't have an account? </span>
            <Link to="/register" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors">
              Create one now
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
