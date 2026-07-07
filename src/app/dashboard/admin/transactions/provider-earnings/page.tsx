'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../lib/apiClient';
import {
  Search, Loader2, AlertCircle, Percent, DollarSign, ArrowUpRight, TrendingUp, Filter
} from 'lucide-react';

interface ProviderUserInfo {
  name: string;
  email: string;
  avatar?: string;
}

interface ProviderEarning {
  provider: ProviderUserInfo;
  booking_id: string;
  total_earning: number;
  admin_earning: number;
  provider_pay_due: number;
  provider_paid_amount: number;
  handyman_total_earning: number;
}

// Simple SWR implementation
import { useEffect } from 'react';

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

  return { data, error, isLoading };
}

export default function ProviderEarningsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const earningsFetcher = useCallback(async (url: string) => {
    const res = await apiClient.get(url);
    return res.data as ProviderEarning[];
  }, []);

  const { data: earnings = [], error: fetchError, isLoading } = useSimpleSWR<ProviderEarning[]>(
    '/admin/transactions/provider-earnings',
    earningsFetcher
  );

  // Filter earnings by search query
  const filteredEarnings = useMemo(() => {
    if (!searchQuery.trim()) return earnings;
    const query = searchQuery.toLowerCase();
    return earnings.filter(e => 
      e.booking_id.toLowerCase().includes(query) ||
      e.provider.name.toLowerCase().includes(query) ||
      e.provider.email.toLowerCase().includes(query)
    );
  }, [earnings, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalVolume = filteredEarnings.reduce((acc, curr) => acc + curr.total_earning, 0);
    const totalAdmin = filteredEarnings.reduce((acc, curr) => acc + curr.admin_earning, 0);
    const totalProvider = filteredEarnings.reduce((acc, curr) => acc + (curr.total_earning - curr.admin_earning), 0);
    const totalHandyman = filteredEarnings.reduce((acc, curr) => acc + curr.handyman_total_earning, 0);
    return { totalVolume, totalAdmin, totalProvider, totalHandyman };
  }, [filteredEarnings]);

  const tabs = [
    { name: 'Online Payments', href: '/dashboard/admin/transactions/payments' },
    { name: 'Cash Payments', href: '/dashboard/admin/transactions/cash-payments' },
    { name: 'Provider Earnings', href: '/dashboard/admin/transactions/provider-earnings', active: true },
    { name: 'Withdrawal Requests', href: '/dashboard/admin/transactions/withdrawals' },
    { name: 'Wallet Management', href: '/dashboard/admin/transactions/wallet' },
  ];

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Percent className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Revenue Splits
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            Audit platform commission cuts, provider payouts, and handyman splits on all bookings.
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
                  : 'border-transparent text-zinc-550 hover:text-zinc-300'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Glassmorphic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Gross Booking Value</span>
            <h3 className="text-lg font-bold text-white mt-1">${stats.totalVolume.toFixed(2)}</h3>
          </div>
          <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
            <DollarSign className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Platform Earnings (Admin)</span>
            <h3 className="text-lg font-bold text-indigo-400 mt-1">${stats.totalAdmin.toFixed(2)}</h3>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Providers Share</span>
            <h3 className="text-lg font-bold text-emerald-450 mt-1">${stats.totalProvider.toFixed(2)}</h3>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <ArrowUpRight className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Handyman Pay Splits</span>
            <h3 className="text-lg font-bold text-amber-450 mt-1">${stats.totalHandyman.toFixed(2)}</h3>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Percent className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl">
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-400 font-semibold">Filter Splits</span>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by ID or Provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 pl-9 pr-4 bg-[#121214] border border-zinc-800/60 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5E5CE6]/60 transition-colors"
          />
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 bg-[#18181b] border border-zinc-850 rounded-xl">
          <Loader2 className="w-6 h-6 text-[#5E5CE6] animate-spin" />
        </div>
      ) : fetchError ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <span>Failed to load splits: {fetchError.message || 'Server error.'}</span>
        </div>
      ) : filteredEarnings.length === 0 ? (
        <div className="p-12 text-center bg-[#18181b] border border-zinc-850 rounded-xl">
          <span className="text-zinc-500 text-xs font-semibold">No earnings records found.</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800/60">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#5E5CE6]/90">
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Booking ID</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Provider</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Gross Total</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Platform Cut</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Provider Paid</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Provider Due</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Handyman Cut</th>
              </tr>
            </thead>
            <tbody>
              {filteredEarnings.map((e) => (
                <tr key={e.booking_id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-indigo-400 font-medium text-xs cursor-pointer hover:underline">
                      #{e.booking_id.slice(-8)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                        {e.provider.avatar ? (
                          <img src={e.provider.avatar} alt={e.provider.name} className="w-full h-full object-cover" />
                        ) : (
                          e.provider.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white text-xs font-semibold">{e.provider.name}</span>
                        <span className="text-zinc-550 text-[10px]">{e.provider.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-white">
                    ${e.total_earning.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-[#5E5CE6]">
                    ${e.admin_earning.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-emerald-400">
                    ${e.provider_paid_amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-amber-400">
                    ${e.provider_pay_due.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-zinc-400">
                    ${e.handyman_total_earning.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
