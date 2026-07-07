'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../lib/apiClient';
import {
  Image, Loader2, AlertCircle, Calendar, DollarSign, CheckCircle2, XCircle, Clock
} from 'lucide-react';

interface ProviderInfo {
  name: string;
  email: string;
  avatar: string;
}

interface Banner {
  id: string;
  provider_id: string;
  image_url: string;
  start_date: string;
  end_date: string;
  price: number;
  status: string;
  reason?: string;
  created_at: string;
  payment_status: string;
  provider: ProviderInfo;
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

export default function BannersPage() {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const bannersFetcher = useCallback(async (url: string) => {
    const res = await apiClient.get(url);
    return res.data as Banner[];
  }, []);

  const { data: banners = [], setData: setBanners, error: fetchError, isLoading } = useSimpleSWR<Banner[]>(
    '/admin/promotions/banners',
    bannersFetcher
  );

  const handleStatusUpdate = async (bannerId: string, newStatus: 'Accepted' | 'Rejected') => {
    setUpdatingId(bannerId);
    
    // Store original list for rollback
    const originalBanners = [...banners];
    
    // Optimistic Update
    setBanners(banners.map(b => b.id === bannerId ? { ...b, status: newStatus } : b));

    try {
      await apiClient.put(`/admin/promotions/banners/${bannerId}/status`, {
        status: newStatus
      });
    } catch (err) {
      // Revert if error
      setBanners(originalBanners);
      alert('Failed to update banner status. Reverting changes.');
    } finally {
      setUpdatingId(null);
    }
  };

  const tabs = [
    { name: 'Promotional Banners', href: '/dashboard/admin/promotions/banners', active: true },
    { name: 'Coupons', href: '/dashboard/admin/promotions/coupons/list', active: false },
    { name: 'Loyalty Rules', href: '/dashboard/admin/promotions/loyalty/rules', active: false },
    { name: 'Loyalty History', href: '/dashboard/admin/promotions/loyalty/history', active: false },
    { name: 'Sliders', href: '/dashboard/admin/promotions/sliders/list', active: false },
  ];

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Image className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Promotions & Banners
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            Manage provider promotional banner approvals, toggle campaigns, and monitor fee collections.
          </p>
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

      {/* Main Glassmorphic Panel */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
            <span className="text-xs text-zinc-550">Fetching promotional banners...</span>
          </div>
        ) : fetchError ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs">Failed to load promotional banners.</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No promotional banners requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5E5CE6]/90 text-white text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-tl-xl">Provider</th>
                  <th className="py-3 px-4">Banner Preview</th>
                  <th className="py-3 px-4">Run Dates</th>
                  <th className="py-3 px-4">Amount / Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-tr-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs">
                {banners.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-850/20 transition-colors">
                    {/* Double line: Provider Name & Email */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border border-zinc-700">
                          {b.provider.avatar ? (
                            <img src={b.provider.avatar} alt={b.provider.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">{b.provider.name.substring(0, 2)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{b.provider.name}</div>
                          <div className="text-zinc-500 text-[10px] mt-0.5">{b.provider.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Banner Image Preview */}
                    <td className="py-4 px-4">
                      <div className="w-24 h-12 rounded-md overflow-hidden bg-zinc-800 border border-zinc-700">
                        <img src={b.image_url} alt="Promotional Banner" className="w-full h-full object-cover" />
                      </div>
                    </td>

                    {/* Double line: Start Date & End Date */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-zinc-350">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Start: {new Date(b.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>End: {new Date(b.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>

                    {/* Double line: Price & Payment Status */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-white flex items-center gap-0.5">
                          <DollarSign className="w-3.5 h-3.5 text-green-500" />
                          {b.price.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${b.payment_status === 'Paid' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                          {b.payment_status}
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      {b.status === 'Accepted' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Accepted
                        </span>
                      )}
                      {b.status === 'Rejected' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                      {b.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      {b.status === 'Pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={updatingId === b.id}
                            onClick={() => handleStatusUpdate(b.id, 'Accepted')}
                            className="px-2.5 py-1 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold text-[11px] transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            disabled={updatingId === b.id}
                            onClick={() => handleStatusUpdate(b.id, 'Rejected')}
                            className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-[11px] transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-650 text-[11px]">Processed</span>
                      )}
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
