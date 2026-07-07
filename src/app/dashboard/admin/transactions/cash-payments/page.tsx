'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../lib/apiClient';
import {
  Search, Loader2, AlertCircle, Coins, DollarSign, Wallet, ArrowUpRight, TrendingUp, Filter
} from 'lucide-react';

interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
}

interface Payment {
  booking_id: string;
  transaction_id: string;
  service_name: string;
  user: UserInfo;
  payment_type: string;
  status: string;
  date: string;
  total_amount: number;
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

export default function CashPaymentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const paymentsFetcher = useCallback(async (url: string) => {
    const res = await apiClient.get(url);
    return res.data as Payment[];
  }, []);

  const { data: payments = [], error: fetchError, isLoading } = useSimpleSWR<Payment[]>(
    '/admin/transactions/cash-payments',
    paymentsFetcher
  );

  // Filter payments by search query
  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) return payments;
    const query = searchQuery.toLowerCase();
    return payments.filter(p => 
      p.booking_id.toLowerCase().includes(query) ||
      p.transaction_id.toLowerCase().includes(query) ||
      p.service_name.toLowerCase().includes(query) ||
      p.user.name.toLowerCase().includes(query) ||
      p.user.email.toLowerCase().includes(query)
    );
  }, [payments, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalCount = filteredPayments.length;
    const totalVolume = filteredPayments.reduce((acc, curr) => acc + curr.total_amount, 0);
    const avgTicket = totalCount > 0 ? totalVolume / totalCount : 0;
    return { totalCount, totalVolume, avgTicket };
  }, [filteredPayments]);

  const tabs = [
    { name: 'Online Payments', href: '/dashboard/admin/transactions/payments' },
    { name: 'Cash Payments', href: '/dashboard/admin/transactions/cash-payments', active: true },
    { name: 'Provider Earnings', href: '/dashboard/admin/transactions/provider-earnings' },
    { name: 'Withdrawal Requests', href: '/dashboard/admin/transactions/withdrawals' },
    { name: 'Wallet Management', href: '/dashboard/admin/transactions/wallet' },
  ];

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Coins className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Cash Reconciliations
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            Audit and reconcile cash on delivery bookings completed on the platform.
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Cash Jobs</span>
            <h3 className="text-xl font-bold text-white mt-1">{stats.totalCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#5E5CE6]/10 flex items-center justify-center text-[#5E5CE6]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Cash Handled Volume</span>
            <h3 className="text-xl font-bold text-amber-450 mt-1">${stats.totalVolume.toFixed(2)}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Average Cash Ticket</span>
            <h3 className="text-xl font-bold text-indigo-400 mt-1">${stats.avgTicket.toFixed(2)}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl">
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-400 font-semibold">Filter Cash Logs</span>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search cash logs..."
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
          <span>Failed to load cash transactions: {fetchError.message || 'Server error.'}</span>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="p-12 text-center bg-[#18181b] border border-zinc-850 rounded-xl">
          <span className="text-zinc-500 text-xs font-semibold">No cash transactions match your search.</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800/60">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#5E5CE6]/90">
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Booking ID</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Transaction ID</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Service</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">User</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Method</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.booking_id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-indigo-400 font-medium text-xs cursor-pointer hover:underline">
                      #{p.booking_id.slice(-8)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-zinc-300">
                    {p.transaction_id}
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-zinc-200">
                    {p.service_name}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                        {p.user.avatar ? (
                          <img src={p.user.avatar} alt={p.user.name} className="w-full h-full object-cover" />
                        ) : (
                          p.user.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white text-xs font-semibold">{p.user.name}</span>
                        <span className="text-zinc-550 text-[10px]">{p.user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-zinc-400">
                    {p.payment_type}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      p.status.toLowerCase() === 'paid' || p.status.toLowerCase() === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-white">
                    ${p.total_amount.toFixed(2)}
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
