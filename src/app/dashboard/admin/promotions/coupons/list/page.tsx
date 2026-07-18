'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../../lib/apiClient';
import {
  Tag, Loader2, AlertCircle, Plus, Search, Trash2, ToggleLeft, ToggleRight
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount: number;
  expire_date: string;
  service_id?: string;
  status: boolean;
  created_at: string;
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

export default function CouponsListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const couponsFetcher = useCallback(async (url: string) => {
    const res = await apiClient.get(url);
    return res.data as Coupon[];
  }, []);

  const { data: coupons = [], setData: setCoupons, error: fetchError, isLoading } = useSimpleSWR<Coupon[]>(
    '/admin/promotions/coupons',
    couponsFetcher
  );

  // Filter coupons by search query
  const filteredCoupons = useMemo(() => {
    if (!searchQuery.trim()) return coupons;
    const query = searchQuery.toLowerCase();
    return coupons.filter(c => 
      c.code.toLowerCase().includes(query) ||
      c.discount_type.toLowerCase().includes(query)
    );
  }, [coupons, searchQuery]);

  const handleToggleStatus = async (couponId: string) => {
    setActionId(couponId);
    
    // Store original list for rollback
    const originalCoupons = [...coupons];
    
    // Optimistic Update
    setCoupons(coupons.map(c => c.id === couponId ? { ...c, status: !c.status } : c));

    try {
      await apiClient.put(`/admin/promotions/coupons/${couponId}/toggle`);
    } catch (err) {
      // Revert if error
      setCoupons(originalCoupons);
      alert('Failed to toggle coupon status. Reverting changes.');
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon? This action is irreversible.')) return;
    
    setActionId(couponId);
    const originalCoupons = [...coupons];
    
    // Optimistic Update
    setCoupons(coupons.filter(c => c.id !== couponId));

    try {
      await apiClient.delete(`/admin/promotions/coupons/${couponId}`);
    } catch (err) {
      setCoupons(originalCoupons);
      alert('Failed to delete coupon. Reverting changes.');
    } finally {
      setActionId(null);
    }
  };

  const tabs = [
    { name: 'Promotional Banners', href: '/dashboard/admin/promotions/banners', active: false },
    { name: 'Coupons', href: '/dashboard/admin/promotions/coupons/list', active: true },
    { name: 'Loyalty Rules', href: '/dashboard/admin/promotions/loyalty/rules', active: false },
    { name: 'Loyalty History', href: '/dashboard/admin/promotions/loyalty/history', active: false },
    { name: 'Sliders', href: '/dashboard/admin/promotions/sliders/list', active: false },
  ];

  return (
    <div className="space-y-8 relative text-zinc-300">
      {/* Background ambient glows */}
      <div className="fixed top-0 left-[20%] w-[600px] h-[600px] bg-[#5E5CE6]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 flex items-center gap-3">
              <Tag className="w-5.5 h-5.5 text-[#5E5CE6]" />
              Coupon Management
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">
              Create, delete, toggle, and view all system and service-specific discount coupons.
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard/admin/promotions/coupons/add')}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(94,92,230,0.3)] hover:shadow-[0_0_25px_rgba(94,92,230,0.5)] hover:-translate-y-0.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Coupon
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
      <div className="p-4 bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center gap-3 shadow-lg relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search coupons by code or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0c]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#5E5CE6]/50 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Main Glassmorphic Panel */}
      <div className="bg-[#0a0a0c]/60 border border-white/5 backdrop-blur-2xl rounded-[28px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] relative z-10">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
            <span className="text-xs text-zinc-550">Fetching coupons...</span>
          </div>
        ) : fetchError ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs">Failed to load coupons.</span>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-16 text-center text-zinc-400 font-medium text-sm bg-[#0a0a0c]/40">
            No coupons found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-white text-[11px] font-extrabold uppercase tracking-widest">
                  <th className="py-3 px-4 rounded-tl-xl">Code</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Discount Value</th>
                  <th className="py-3 px-4">Expiration Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-tr-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs">
                {filteredCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0 hover:shadow-lg">
                    {/* Upper case Coupon Code */}
                    <td className="py-4 px-4 font-mono font-bold text-white tracking-wider">
                      <span className="bg-[#5E5CE6]/10 px-2 py-0.5 rounded border border-[#5E5CE6]/20">
                        {c.code}
                      </span>
                    </td>

                    {/* Coupon Type */}
                    <td className="py-4 px-4 capitalize text-zinc-350">
                      {c.discount_type}
                    </td>

                    {/* Discount Value */}
                    <td className="py-4 px-4 font-bold text-white">
                      {c.discount_type === 'percentage' ? (
                        <span>{c.discount}% Off</span>
                      ) : (
                        <span>${c.discount.toFixed(2)} Off</span>
                      )}
                    </td>

                    {/* Expiration date */}
                    <td className="py-4 px-4 text-zinc-500">
                      {new Date(c.expire_date).toLocaleDateString()}
                    </td>

                    {/* Status Switch */}
                    <td className="py-4 px-4">
                      <button
                        disabled={actionId === c.id}
                        onClick={() => handleToggleStatus(c.id)}
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        {c.status ? (
                          <ToggleRight className="w-8 h-8 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-zinc-650" />
                        )}
                      </button>
                    </td>

                    {/* Delete Action */}
                    <td className="py-4 px-4 text-right">
                      <button
                        disabled={actionId === c.id}
                        onClick={() => handleDeleteCoupon(c.id)}
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
