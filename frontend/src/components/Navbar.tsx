import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, LogOut, User as UserIcon, PlusCircle, LayoutDashboard, MapPin } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-6 h-6 text-white animate-pulse" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              WanderAI <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">Planner</span>
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800/50"
                >
                  <LayoutDashboard className="w-4 h-4 text-sky-400" />
                  <span>My Trips</span>
                </Link>

                <Link
                  to="/maps"
                  className="flex items-center space-x-2 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800/50"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Maps & Directions</span>
                </Link>

                <Link
                  to="/create-trip"
                  className="flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-sky-500/25 transition-all hover:scale-105 active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Trip</span>
                </Link>

                <div className="h-6 w-px bg-slate-800" />

                <div className="flex items-center space-x-3 text-sm text-slate-300 pl-1">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                  <span className="hidden sm:inline font-medium text-slate-200">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800/50"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
