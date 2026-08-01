import React, { useState } from 'react';
import { EmergencyLocation } from '../types';
import { getEmergencyLocations } from '../api/trips';
import { AlertTriangle, Phone, MapPin, Building2, ShieldAlert, X } from 'lucide-react';

interface EmergencyModalProps {
  tripId: number;
  destination: string;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ tripId, destination }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [locations, setLocations] = useState<EmergencyLocation[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setIsOpen(true);
    if (locations.length === 0) {
      setLoading(true);
      try {
        const data = await getEmergencyLocations(tripId);
        setLocations(data);
      } catch (err) {
        console.error('Failed to fetch emergency locations', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center space-x-2 text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3.5 py-2 rounded-xl transition-all"
      >
        <ShieldAlert className="w-4 h-4 text-rose-400" />
        <span>Emergency Lookup</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-xl w-full glass-panel p-6 rounded-3xl border border-rose-500/30 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Emergency Services Lookup</h3>
                <p className="text-xs text-slate-400">Nearest Hospitals, Police Stations & Embassies in {destination}</p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center space-y-3">
                <div className="w-8 h-8 border-3 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-medium">Scanning Google Places for local emergency care...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {locations.map((loc, idx) => (
                  <div key={idx} className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-rose-500/30 transition-all flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          loc.type === 'Hospital'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : loc.type === 'Police Station'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {loc.type}
                        </span>
                        {loc.distanceKm && (
                          <span className="text-[11px] text-slate-400">{loc.distanceKm} km away</span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-sm">{loc.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
                        <span>{loc.address}</span>
                      </p>
                    </div>

                    {loc.phone && (
                      <a
                        href={`tel:${loc.phone}`}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white px-3 py-2 rounded-xl shadow-lg transition-all shrink-0 ml-3"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
