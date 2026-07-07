'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/apiClient';
import {
  Wrench, Search, Loader2, AlertCircle, CheckCircle,
  User, CheckSquare, Square, RefreshCw, X, HelpCircle
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  price_type: string;
  status: boolean;
  type: string;
  image?: string;
  category_name: string;
  provider: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export default function AdminSingleServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesCount, setEntriesCount] = useState(10);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/services/single');
      setServices(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch catalog items.');
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(svc =>
    svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    svc.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    svc.provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    svc.provider.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEntries = filteredServices.length;
  const totalPages = Math.ceil(totalEntries / entriesCount) || 1;
  const paginatedServices = filteredServices.slice((currentPage - 1) * entriesCount, currentPage * entriesCount);

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wrench className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Master Single Services
          </h1>
          <p className="text-zinc-550 text-xs mt-0.5">
            Supervise all provider-published single service catalog offerings across the entire platform.
          </p>
        </div>

        <button
          onClick={fetchServices}
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
            placeholder="Search service name, category, provider..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-8.5 pl-9 pr-4 bg-[#2c2c2e] border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-[#5E5CE6]/60 transition-colors"
          />
        </div>
        <div className="text-xs text-zinc-500 font-semibold">
          Showing {filteredServices.length} single services
        </div>
      </div>

      {/* Table container */}
      <div className="border border-zinc-850 rounded-xl overflow-hidden bg-[#18181b]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#5E5CE6]/90 border-b border-zinc-850 text-xs">
                <th className="py-3 px-4 text-left font-bold text-white uppercase tracking-wider">Service Name</th>
                <th className="py-3 px-4 text-left font-bold text-white uppercase tracking-wider">Provider</th>
                <th className="py-3 px-4 text-left font-bold text-white uppercase tracking-wider">Category</th>
                <th className="py-3 px-4 text-left font-bold text-white uppercase tracking-wider">Base Price</th>
                <th className="py-3 px-4 text-center font-bold text-white uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-850 animate-pulse">
                    <td className="py-4.5 px-4"><div className="h-4 bg-zinc-800 rounded w-44" /></td>
                    <td className="py-4.5 px-4"><div className="h-4 bg-zinc-800 rounded w-32" /></td>
                    <td className="py-4.5 px-4"><div className="h-4 bg-zinc-800 rounded w-20" /></td>
                    <td className="py-4.5 px-4"><div className="h-4 bg-zinc-800 rounded w-16" /></td>
                    <td className="py-4.5 px-4 text-center"><div className="h-4 bg-zinc-800 rounded w-12 mx-auto" /></td>
                  </tr>
                ))
              ) : paginatedServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-zinc-550">
                    No single services found in catalog.
                  </td>
                </tr>
              ) : (
                paginatedServices.map(svc => (
                  <tr key={svc.id} className="border-b border-zinc-850 hover:bg-zinc-900/50 transition-colors text-xs">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {svc.image ? (
                          <img src={svc.image} alt={svc.name} className="w-9 h-9 rounded-lg object-cover border border-zinc-800" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-850">
                            <Wrench className="w-4 h-4 text-zinc-650" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white">{svc.name}</p>
                          <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{svc.description || 'No description provided.'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {svc.provider.avatar ? (
                          <img src={svc.provider.avatar} alt={svc.provider.name} className="w-6 h-6 rounded-full object-cover border border-zinc-800" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-850">
                            <User className="w-3.5 h-3.5 text-zinc-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-zinc-300">{svc.provider.name}</p>
                          <p className="text-[10px] text-zinc-500">{svc.provider.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 font-semibold">{svc.category_name}</td>
                    <td className="py-3.5 px-4 font-bold text-white">${svc.price.toFixed(2)} - {svc.price_type}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        svc.status 
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                          : 'bg-zinc-800 border border-zinc-700 text-zinc-500'
                      }`}>
                        {svc.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-[#121214] border-t border-zinc-850 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-zinc-550 font-semibold">
          <div className="flex items-center gap-1.5">
            <span>Display</span>
            <select
              value={entriesCount}
              onChange={(e) => {
                setEntriesCount(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-7 px-2 bg-[#2c2c2e] border border-zinc-800 rounded text-zinc-300 focus:outline-none"
            >
              {[10, 25, 50].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span>entries</span>
          </div>

          <div>
            {totalEntries > 0 ? (
              <span>
                {(currentPage - 1) * entriesCount + 1} to {Math.min(currentPage * entriesCount, totalEntries)} of {totalEntries} entries
              </span>
            ) : (
              <span>0 entries</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 px-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 px-3.5 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-bold rounded-lg disabled:opacity-40 disabled:hover:bg-[#5E5CE6] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
