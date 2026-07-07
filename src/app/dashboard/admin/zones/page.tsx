'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/apiClient';
import {
  MapPin, Search, Loader2, AlertCircle, CheckCircle,
  Users, Wrench, RefreshCw, X, ShieldAlert
} from 'lucide-react';

interface Zone {
  id: string;
  zone_name: string;
  provider_count: number;
  service_count: number;
  status: boolean | string;
}

export default function AdminZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/zones');
      setZones(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch service zones.');
    } finally {
      setLoading(false);
    }
  };

  const filteredZones = zones.filter(zone =>
    zone.zone_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <MapPin className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Coverage Zones
          </h1>
          <p className="text-zinc-550 text-xs mt-0.5">
            Monitor provider density and service count allocations across geographical service areas.
          </p>
        </div>

        <button
          onClick={fetchZones}
          className="h-8.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-2.5 text-xs flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span className="font-semibold">{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-550" />
          <input
            type="text"
            placeholder="Search zones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 pl-9 pr-4 bg-[#2c2c2e] border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-655 focus:outline-none focus:border-[#5E5CE6]/60 transition-colors"
          />
        </div>
        <div className="text-xs text-zinc-500 font-semibold">
          Found {filteredZones.length} coverage zones
        </div>
      </div>

      {/* Grid Cards of Zones */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-zinc-850 rounded-2xl p-5 bg-[#18181b] animate-pulse space-y-4">
              <div className="h-4 bg-zinc-800 rounded w-1/3" />
              <div className="h-3 bg-zinc-800 rounded w-2/3" />
              <div className="h-6 bg-zinc-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredZones.length === 0 ? (
        <div className="border border-zinc-850 rounded-xl p-12 text-center bg-[#18181b] text-zinc-550 text-xs">
          No coverage zones configured.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredZones.map(zone => (
            <div key={zone.id} className="border border-zinc-850 rounded-2xl bg-[#18181b] p-5 flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-300 shadow-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#5E5CE6]/15 flex items-center justify-center border border-[#5E5CE6]/20">
                      <MapPin className="w-4 h-4 text-[#5E5CE6]" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{zone.zone_name}</h3>
                  </div>
                  
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    zone.status === true || zone.status === 'Active' || zone.status === 'active'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-800 border border-zinc-700 text-zinc-500'
                  }`}>
                    {zone.status === true || zone.status === 'Active' || zone.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-4 border-t border-zinc-850">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider flex items-center gap-1">
                      <Users className="w-3 h-3 text-zinc-500" />
                      Active Providers
                    </p>
                    <p className="text-base font-black text-white">{zone.provider_count}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-zinc-500" />
                      Services Count
                    </p>
                    <p className="text-base font-black text-white">{zone.service_count}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
