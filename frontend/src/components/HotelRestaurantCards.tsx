import React from 'react';
import { Hotel, Restaurant } from '../types';
import { Hotel as HotelIcon, Utensils, Star, MapPin, DollarSign } from 'lucide-react';

interface HotelRestaurantCardsProps {
  hotels: Hotel[];
  restaurants: Restaurant[];
}

export const HotelRestaurantCards: React.FC<HotelRestaurantCardsProps> = ({ hotels, restaurants }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recommended Hotels */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 pb-2 border-b border-slate-800">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <HotelIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Recommended Lodging</h3>
            <p className="text-xs text-slate-400">Curated hotels fitting your budget profile</p>
          </div>
        </div>

        <div className="space-y-3">
          {hotels.map((hotel, idx) => (
            <div
              key={idx}
              className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-slate-100 text-sm">{hotel.name}</h4>
                <p className="text-xs text-slate-400 flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
                  <span>{hotel.address}</span>
                </p>
              </div>

              <div className="text-right shrink-0 pl-4 space-y-1">
                <span className="inline-flex items-center text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Star className="w-3 h-3 fill-amber-400 mr-1" />
                  {hotel.rating}
                </span>
                <p className="text-sm font-extrabold text-sky-400">
                  ${hotel.price} <span className="text-[10px] text-slate-400 font-normal">/ night</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Restaurants */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 pb-2 border-b border-slate-800">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Top Dining & Cafes</h3>
            <p className="text-xs text-slate-400">Popular culinary spots near your activities</p>
          </div>
        </div>

        <div className="space-y-3">
          {restaurants.map((rest, idx) => (
            <div
              key={idx}
              className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-slate-100 text-sm">{rest.name}</h4>
                <p className="text-xs text-slate-400 flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
                  <span>{rest.location}</span>
                </p>
              </div>

              <div className="text-right shrink-0 pl-4 space-y-1">
                <span className="inline-flex items-center text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Star className="w-3 h-3 fill-amber-400 mr-1" />
                  {rest.rating}
                </span>
                <p className="text-xs font-bold text-emerald-400">{rest.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
