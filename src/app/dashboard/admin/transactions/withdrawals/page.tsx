'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../lib/apiClient';
import {
  Search, Loader2, AlertCircle, Inbox, DollarSign, CheckCircle, XCircle, ArrowUpRight, TrendingUp, Filter, Check, X
} from 'lucide-react';

interface ProviderUserInfo {
  name: string;
  email: string;
  avatar?: string;
}

interface Withdrawal {
  id: string;
  provider_id: string;
  bank_name: string;
  amount: number;
  payment_type: string;
  status: string;
  created_at: string;
  provider: ProviderUserInfo;
}

// Simple SWR implementation
import { useEffect } from 'react';

const swrCache: { [key: string]: any } = {};

function useSimpleSWR<T>(key: string | null, fetcher: (url: string) => Promise<T>) {
  const [data, setData] = useState<T | undefined>(key ? swrCache[key] : undefined);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!data);

  const revalidate = useCallback(async () => {
    if (!key) return;
    try {
      const result = await fetcher(key);
      swrCache[key] = result;
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    }
  }, [key, fetcher]);

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

  const mutate = useCallback((newData?: T | ((prev?: T) => T | undefined), options = { revalidate: true }) => {
    if (!key) return;
    if (newData !== undefined) {
      const resolvedData = typeof newData === 'function' ? (newData as Function)(swrCache[key]) : newData;
      swrCache[key] = resolvedData;
      setData(resolvedData);
    }
    if (options.revalidate) {
      revalidate();
    }
  }, [key, revalidate]);

  return { data, error, isLoading, mutate };
}

export default function WithdrawalsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const withdrawalsFetcher = useCallback(async (url: string) => {
    const res = await apiClient.get(url);
    return res.data as Withdrawal[];
  }, []);

  const { data: withdrawals = [], error: fetchError, isLoading, mutate } = useSimpleSWR<Withdrawal[]>(
    '/admin/transactions/withdrawals',
    withdrawalsFetcher
  );

  // Filter withdrawals by search query
  const filteredWithdrawals = useMemo(() => {
    if (!searchQuery.trim()) return withdrawals;
    const query = searchQuery.toLowerCase();
    return withdrawals.filter(w => 
      w.id.toLowerCase().includes(query) ||
      w.bank_name.toLowerCase().includes(query) ||
      w.provider.name.toLowerCase().includes(query) ||
      w.provider.email.toLowerCase().includes(query)
    );
  }, [withdrawals, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const pendingCount = filteredWithdrawals.filter(w => w.status === 'Pending').length;
    const pendingVolume = filteredWithdrawals.filter(w => w.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
    const approvedVolume = filteredWithdrawals.filter(w => w.status === 'Approved').reduce((acc, curr) => acc + curr.amount, 0);
    return { pendingCount, pendingVolume, approvedVolume };
  }, [filteredWithdrawals]);

  // Handle action
  const handleAction = async (id: string, actionStatus: 'Approved' | 'Rejected') => {
    const originalWithdrawals = [...withdrawals];
    
    // Optimistic UI Update
    const nextWithdrawals = withdrawals.map(w => {
      if (w.id === id) {
        return { ...w, status: actionStatus };
      }
      return w;
    });
    mutate(nextWithdrawals, { revalidate: false });
    showToast(`Optimistically marked request as ${actionStatus}.`);

    try {
      await apiClient.put(`/admin/transactions/withdrawals/${id}/action`, { status: actionStatus });
      showToast(`Withdrawal request successfully ${actionStatus.toLowerCase()}.`);
      mutate(); // Trigger revalidation
    } catch (err: any) {
      // Revert optimistic update
      mutate(originalWithdrawals, { revalidate: false });
      showToast(err.response?.data?.detail || 'Failed to update withdrawal request. Reverted change.', 'error');
    }
  };

  const tabs = [
    { name: 'Online Payments', href: '/dashboard/admin/transactions/payments' },
    { name: 'Cash Payments', href: '/dashboard/admin/transactions/cash-payments' },
    { name: 'Provider Earnings', href: '/dashboard/admin/transactions/provider-earnings' },
    { name: 'Withdrawal Requests', href: '/dashboard/admin/transactions/withdrawals', active: true },
    { name: 'Wallet Management', href: '/dashboard/admin/transactions/wallet' },
  ];

  return (
    <div className="space-y-6 text-zinc-300 relative">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200 bg-[#1c1c1e] border-zinc-800">
          {toastType === 'success' ? (
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-450 border border-emerald-500/30">
              <Check className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-455 border border-rose-500/30">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-xs font-semibold text-zinc-200">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-zinc-550 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Inbox className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Withdrawal Requests
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            Process partner provider withdrawal balance requests. Approve to atomically deduct provider wallet balances.
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
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Pending Requests</span>
            <h3 className="text-xl font-bold text-white mt-1">{stats.pendingCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#5E5CE6]/10 flex items-center justify-center text-[#5E5CE6]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Pending Volume</span>
            <h3 className="text-xl font-bold text-amber-450 mt-1">${stats.pendingVolume.toFixed(2)}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Approved Volume Paid</span>
            <h3 className="text-xl font-bold text-emerald-450 mt-1">${stats.approvedVolume.toFixed(2)}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl">
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-400 font-semibold">Filter Withdrawals</span>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by ID, Bank or Provider..."
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
          <span>Failed to load withdrawals: {fetchError.message || 'Server error.'}</span>
        </div>
      ) : filteredWithdrawals.length === 0 ? (
        <div className="p-12 text-center bg-[#18181b] border border-zinc-850 rounded-xl">
          <span className="text-zinc-500 text-xs font-semibold">No withdrawal requests found.</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800/60">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#5E5CE6]/90">
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Request ID</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Provider</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Bank Name</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Type</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Requested Amount</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.map((w) => (
                <tr key={w.id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-indigo-400 font-medium text-xs cursor-pointer hover:underline">
                      #{w.id.slice(-8)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                        {w.provider.avatar ? (
                          <img src={w.provider.avatar} alt={w.provider.name} className="w-full h-full object-cover" />
                        ) : (
                          w.provider.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white text-xs font-semibold">{w.provider.name}</span>
                        <span className="text-zinc-550 text-[10px]">{w.provider.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-zinc-200">
                    {w.bank_name}
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-zinc-400">
                    {w.payment_type}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      w.status === 'Approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : w.status === 'Rejected'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-white">
                    ${Number(w.amount).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {w.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAction(w.id, 'Approved')}
                          className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 flex items-center justify-center transition-all hover:scale-105"
                          title="Approve Payout"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(w.id, 'Rejected')}
                          className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-450 hover:text-white border border-rose-500/20 flex items-center justify-center transition-all hover:scale-105"
                          title="Reject Payout"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider">Processed</span>
                    )}
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
