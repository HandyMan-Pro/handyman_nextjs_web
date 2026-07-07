'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../../lib/apiClient';
import {
  Sliders, Loader2, AlertCircle, Plus, Search, Trash2, ToggleLeft, ToggleRight, Link
} from 'lucide-react';

interface Slider {
  id: string;
  title: string;
  image_url: string;
  description: string;
  status: boolean;
  service_id?: string;
  service_name: string;
}

const swrCache: { [key: string]: any } = {};

function useSimpleSWR<T>(key: string | null, fetcher: (url: string) => Promise<T>) {
  const [data, setData] = useState<T | undefined>(key ? swrCache[key] : undefined);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!data);

  useEffect(() => {
    if (!key) return;
    let active = true;
    setIsLoading(true);
    fetcher(key)
      .then((res) => {
        if (active) {
          swrCache[key] = res;
          setData(res);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err);
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [key, fetcher]);

  return { data, setData, error, isLoading };
}

export default function SlidersListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const slidersFetcher = useCallback(async (url: string) => {
    const res = await apiClient.get(url);
    return res.data as Slider[];
  }, []);

  const { data: sliders = [], setData: setSliders, error: fetchError, isLoading } = useSimpleSWR<Slider[]>(
    '/admin/promotions/sliders',
    slidersFetcher
  );

  // Filter sliders by search query
  const filteredSliders = useMemo(() => {
    if (!searchQuery.trim()) return sliders;
    const query = searchQuery.toLowerCase();
    return sliders.filter(s => 
      s.title.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      s.service_name.toLowerCase().includes(query)
    );
  }, [sliders, searchQuery]);

  const handleToggleStatus = async (sliderId: string) => {
    setActionId(sliderId);
    const originalSliders = [...sliders];
    
    // Optimistic Update
    setSliders(sliders.map(s => s.id === sliderId ? { ...s, status: !s.status } : s));

    try {
      await apiClient.put(`/admin/promotions/sliders/${sliderId}/toggle`);
    } catch (err) {
      setSliders(originalSliders);
      alert('Failed to toggle slider status. Reverting changes.');
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteSlider = async (sliderId: string) => {
    if (!confirm('Are you sure you want to delete this slider?')) return;
    
    setActionId(sliderId);
    const originalSliders = [...sliders];
    
    // Optimistic Update
    setSliders(sliders.filter(s => s.id !== sliderId));

    try {
      await apiClient.delete(`/admin/promotions/sliders/${sliderId}`);
    } catch (err) {
      setSliders(originalSliders);
      alert('Failed to delete slider. Reverting changes.');
    } finally {
      setActionId(null);
    }
  };

  const tabs = [
    { name: 'Promotional Banners', href: '/dashboard/admin/promotions/banners', active: false },
    { name: 'Coupons', href: '/dashboard/admin/promotions/coupons/list', active: false },
    { name: 'Loyalty Rules', href: '/dashboard/admin/promotions/loyalty/rules', active: false },
    { name: 'Loyalty History', href: '/dashboard/admin/promotions/loyalty/history', active: false },
    { name: 'Sliders', href: '/dashboard/admin/promotions/sliders/list', active: true },
  ];

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sliders className="w-5.5 h-5.5 text-[#5E5CE6]" />
              Homepage Sliders
            </h1>
            <p className="text-zinc-550 text-xs mt-0.5">
              Manage sliding banners displayed on the customer mobile app home page.
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard/admin/promotions/sliders/add')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-bold text-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Slider
          </button>
        </div>

        {/* Tab Row */}
        <div className="flex border-b border-zinc-800/80 overflow-x-auto whitespace-nowrap scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.name}
              onClick={() => router.push(t.href)}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
                t.active
                  ? 'border-[#5E5CE6] text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="p-3 bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md rounded-xl flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search sliders by title, description or linked service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950/60 border border-zinc-800/60 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-zinc-550 focus:outline-none focus:border-[#5E5CE6] transition-colors"
          />
        </div>
      </div>

      {/* Main Glassmorphic Panel */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
            <span className="text-xs text-zinc-550">Fetching homepage sliders...</span>
          </div>
        ) : fetchError ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs">Failed to load sliders.</span>
          </div>
        ) : filteredSliders.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No homepage sliders set up yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5E5CE6]/90 text-white text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-tl-xl">Thumbnail</th>
                  <th className="py-3 px-4">Title / Info</th>
                  <th className="py-3 px-4">Linked Action</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-tr-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs">
                {filteredSliders.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-850/20 transition-colors">
                    {/* Circular slider thumbnail */}
                    <td className="py-4 px-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800">
                        <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                      </div>
                    </td>

                    {/* Double line Title & Description */}
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-bold text-white text-xs">{s.title}</div>
                        <div className="text-zinc-500 text-[10px] mt-0.5 max-w-sm truncate">{s.description}</div>
                      </div>
                    </td>

                    {/* Linked Action / Service */}
                    <td className="py-4 px-4 text-zinc-350">
                      <div className="flex items-center gap-1.5">
                        <Link className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Service: {s.service_name}</span>
                      </div>
                    </td>

                    {/* Status switch */}
                    <td className="py-4 px-4">
                      <button
                        disabled={actionId === s.id}
                        onClick={() => handleToggleStatus(s.id)}
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        {s.status ? (
                          <ToggleRight className="w-8 h-8 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-zinc-650" />
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <button
                        disabled={actionId === s.id}
                        onClick={() => handleDeleteSlider(s.id)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
