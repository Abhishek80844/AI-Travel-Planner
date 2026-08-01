import React from 'react';
import { WeatherDay } from '../types';
import { CloudSun, CloudRain, Droplets, Wind, Thermometer } from 'lucide-react';

interface WeatherWidgetProps {
  forecasts: WeatherDay[];
  destination: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ forecasts, destination }) => {
  if (!forecasts || forecasts.length === 0) return null;

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Weather Forecast</h3>
            <p className="text-xs text-slate-400">24-hour cached climate data for {destination}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
        {forecasts.map((day, idx) => (
          <div
            key={idx}
            className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col items-center text-center space-y-2"
          >
            <span className="text-xs font-semibold text-slate-400">
              {new Date(day.forecastDate).toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' })}
            </span>

            <div className="my-1 p-2 rounded-xl bg-slate-900 text-sky-400 border border-slate-800">
              {day.rainChance > 30 ? <CloudRain className="w-6 h-6 text-sky-400" /> : <CloudSun className="w-6 h-6 text-amber-400" />}
            </div>

            <span className="text-xl font-extrabold text-white flex items-center">
              <Thermometer className="w-4 h-4 text-rose-400 mr-0.5" />
              {day.temperature}°C
            </span>

            <div className="w-full pt-2 border-t border-slate-800/80 flex items-center justify-around text-[11px] text-slate-400">
              <span className="flex items-center" title="Rain probability">
                <Droplets className="w-3 h-3 text-sky-400 mr-0.5" />
                {Math.round(day.rainChance)}%
              </span>
              <span className="flex items-center" title="Wind speed">
                <Wind className="w-3 h-3 text-indigo-400 mr-0.5" />
                {Math.round(day.wind)} km/h
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
