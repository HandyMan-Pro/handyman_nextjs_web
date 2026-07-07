'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../../lib/apiClient';
import {
  Award, Loader2, AlertCircle, Search, Calendar, ChevronRight
} from 'lucide-react';

interface CustomerInfo {
  name: string;
  email: string;
  avatar: string;
}

interface LoyaltyHistoryEntry {
  id: string;
  customer_id: string;
  points: number;
  transaction_type: string;
  title: string;
  created_at: string;
  customer: CustomerInfo;
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

  return { data, setError, error, isLoading };
}

export default function LoyaltyHistoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const historyFetcher = useCallback(async (url: string) => {
    const res = await apiClient.get(url);
    return res.data as LoyaltyHistoryEntry[];
  }, []);

  const { data: history = [], error: fetchError, isLoading } = useSimpleSWR<LoyaltyHistoryEntry[]>(
    '/admin/promotions/loyalty/history',
    historyFetcher
  );

  // Filter history by customer search
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const query = searchQuery.toLowerCase();
    return history.filter(h => 
      h.customer.name.toLowerCase().includes(query) ||
      h.customer.email.toLowerCase().includes(query) ||
      h.title.toLowerCase().includes(query) ||
      h.transaction_type.toLowerCase().includes(query)
    );
  }, [history, searchQuery]);

  const tabs = [
    { name: 'Promotional Banners', href: '/dashboard/admin/promotions/banners', active: false },
    { name: 'Coupons', href: '/dashboard/admin/promotions/coupons/list', active: false },
    { name: 'Loyalty Rules', href: '/dashboard/admin/promotions/loyalty/rules', active: false },
    { name: 'Loyalty History', href: '/dashboard/admin/promotions/loyalty/history', active: true },
    { name: 'Sliders', href: '/dashboard/admin/promotions/sliders/list', active: false },
  ];

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Award className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Loyalty point history
          </h1>
          <p className="text-zinc-550 text-xs mt-0.5">
            Audit point accumulation and redemption logs across all customer accounts.
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

      {/* Search Input */}
      <div className="p-3 bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md rounded-xl flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search point logs by customer name, email, or transaction details..."
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
            <span className="text-xs text-zinc-550">Fetching point history...</span>
          </div>
        ) : fetchError ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs">Failed to load point logs.</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No point transactions found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5E5CE6]/90 text-white text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-tl-xl">Customer</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4">Type / Activity</th>
                  <th className="py-3 px-4 rounded-tr-xl">Logged At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs">
                {filteredHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-zinc-850/20 transition-colors">
                    {/* Double line Customer Details */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border border-zinc-700">
                          {entry.customer.avatar ? (
                            <img src={entry.customer.avatar} alt={entry.customer.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">{entry.customer.name.substring(0, 2)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{entry.customer.name}</div>
                          <div className="text-zinc-500 text-[10px] mt-0.5">{entry.customer.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Circular points indicator */}
                    <td className="py-4 px-4 font-bold">
                      {entry.points >= 0 ? (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] bg-green-500/10 text-green-400 border border-green-500/20">
                          +{entry.points} pts
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">
                          {entry.points} pts
                        </span>
                      )}
                    </td>

                    {/* Double line Activity Detail */}
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-white text-xs font-medium">{entry.title}</div>
                        <div className="text-zinc-550 text-[10px] mt-0.5">{entry.transaction_type}</div>
                      </div>
                    </td>

                    {/* Logged At */}
                    <td className="py-4 px-4 text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-650" />
                        <span>{new Date(entry.created_at).toLocaleString()}</span>
                      </div>
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
