'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../lib/apiClient';
import {
  Search, Loader2, AlertCircle, Wallet, Plus, Trash2, ToggleLeft, ToggleRight, ArrowUpRight, TrendingUp, Filter, Check, X, User
} from 'lucide-react';

interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
}

interface WalletEntry {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  status: string; // "Active" | "Inactive"
  created_at: string;
  user: UserInfo;
}

interface DropdownUser {
  id: string;
  display_name?: string;
  username?: string;
  email: string;
  user_type: string;
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

export default function WalletPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formUserId, setFormUserId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown users
  const [dropdownUsers, setDropdownUsers] = useState<DropdownUser[]>([]);

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

  const walletsFetcher = useCallback(async (url: string) => {
    const res = await apiClient.get(url);
    return res.data as WalletEntry[];
  }, []);

  const { data: wallets = [], error: fetchError, isLoading, mutate } = useSimpleSWR<WalletEntry[]>(
    '/admin/transactions/wallet',
    walletsFetcher
  );

  // Fetch users for dropdown list when opening modal
  const fetchUsersForDropdown = async () => {
    try {
      const res = await apiClient.get('/admin/users/all');
      setDropdownUsers(res.data);
    } catch (err: any) {
      showToast('Failed to load users list.', 'error');
    }
  };

  const handleOpenCreateModal = () => {
    setFormUserId('');
    setFormTitle('');
    setFormAmount('');
    fetchUsersForDropdown();
    setIsModalOpen(true);
  };

  // Filter wallets by search query
  const filteredWallets = useMemo(() => {
    if (!searchQuery.trim()) return wallets;
    const query = searchQuery.toLowerCase();
    return wallets.filter(w => 
      w.id.toLowerCase().includes(query) ||
      w.title.toLowerCase().includes(query) ||
      w.user.name.toLowerCase().includes(query) ||
      w.user.email.toLowerCase().includes(query)
    );
  }, [wallets, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalEntries = filteredWallets.length;
    const activeFunds = filteredWallets.filter(w => w.status === 'Active').reduce((acc, curr) => acc + curr.amount, 0);
    const inactiveFunds = filteredWallets.filter(w => w.status === 'Inactive').reduce((acc, curr) => acc + curr.amount, 0);
    return { totalEntries, activeFunds, inactiveFunds };
  }, [filteredWallets]);

  // Handle Toggle Switch
  const handleToggle = async (id: string) => {
    const originalWallets = [...wallets];
    
    // Optimistic UI update
    const nextWallets = wallets.map(w => {
      if (w.id === id) {
        const nextStatus = w.status === 'Active' ? 'Inactive' : 'Active';
        return { ...w, status: nextStatus };
      }
      return w;
    });
    mutate(nextWallets, { revalidate: false });
    showToast('Toggled wallet entry status.');

    try {
      await apiClient.put(`/admin/transactions/wallet/${id}/toggle`);
      showToast('Wallet entry status successfully updated.');
      mutate();
    } catch (err: any) {
      mutate(originalWallets, { revalidate: false });
      showToast(err.response?.data?.detail || 'Failed to toggle status.', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wallet adjustment? This will deduct the amount from the user cumulative balance.')) {
      return;
    }
    const originalWallets = [...wallets];
    
    // Optimistic update
    mutate(wallets.filter(w => w.id !== id), { revalidate: false });
    showToast('Deleting wallet entry...');

    try {
      await apiClient.delete(`/admin/transactions/wallet/${id}`);
      showToast('Wallet entry successfully deleted.');
      mutate();
    } catch (err: any) {
      mutate(originalWallets, { revalidate: false });
      showToast(err.response?.data?.detail || 'Failed to delete wallet entry.', 'error');
    }
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserId || !formTitle || !formAmount) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        user_id: formUserId,
        title: formTitle,
        amount: parseFloat(formAmount)
      };

      await apiClient.post('/admin/transactions/wallet', payload);
      showToast('Wallet balance adjustment created successfully.');
      setIsModalOpen(false);
      mutate();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to create adjustment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { name: 'Online Payments', href: '/dashboard/admin/transactions/payments' },
    { name: 'Cash Payments', href: '/dashboard/admin/transactions/cash-payments' },
    { name: 'Provider Earnings', href: '/dashboard/admin/transactions/provider-earnings' },
    { name: 'Withdrawal Requests', href: '/dashboard/admin/transactions/withdrawals' },
    { name: 'Wallet Management', href: '/dashboard/admin/transactions/wallet', active: true },
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Wallet className="w-5.5 h-5.5 text-[#5E5CE6]" />
              Wallet Ledger Management
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">
              Direct administrative control over user wallet statements. Apply adjustments, toggles, and audits.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#5E5CE6]/15 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Adjustment
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
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Adjustment Entries</span>
            <h3 className="text-xl font-bold text-white mt-1">{stats.totalEntries}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#5E5CE6]/10 flex items-center justify-center text-[#5E5CE6]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Active Adjusted Funds</span>
            <h3 className="text-xl font-bold text-emerald-450 mt-1">${stats.activeFunds.toFixed(2)}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Check className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Disabled Adjusted Funds</span>
            <h3 className="text-xl font-bold text-rose-455 mt-1">${stats.inactiveFunds.toFixed(2)}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-450">
            <X className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl">
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-400 font-semibold">Filter Ledgers</span>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search adjustments..."
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
          <span>Failed to load wallets: {fetchError.message || 'Server error.'}</span>
        </div>
      ) : filteredWallets.length === 0 ? (
        <div className="p-12 text-center bg-[#18181b] border border-zinc-850 rounded-xl">
          <span className="text-zinc-500 text-xs font-semibold">No wallet adjustment logs.</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800/60">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#5E5CE6]/90">
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Adjustment ID</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">User</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Title</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Amount</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWallets.map((w) => (
                <tr key={w.id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-indigo-400 font-medium text-xs cursor-pointer hover:underline">
                      #{w.id.slice(-8)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                        {w.user.avatar ? (
                          <img src={w.user.avatar} alt={w.user.name} className="w-full h-full object-cover" />
                        ) : (
                          w.user.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white text-xs font-semibold">{w.user.name}</span>
                        <span className="text-zinc-550 text-[10px]">{w.user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-zinc-200">
                    {w.title}
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-white">
                    ${Number(w.amount).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggle(w.id)}
                      className="focus:outline-none transition-transform hover:scale-105 active:scale-95"
                    >
                      {w.status === 'Active' ? (
                        <ToggleRight className="w-7 h-7 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-zinc-650" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="p-1 text-rose-500 hover:text-rose-400 transition-transform hover:scale-110"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjustments Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#121214] p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#5E5CE6]" />
                New Adjustment Entry
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">Target User</label>
                <select
                  required
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-white focus:outline-none focus:border-[#5E5CE6]/60"
                >
                  <option value="">Select a user...</option>
                  {dropdownUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.display_name || u.username} ({u.email}) - {u.user_type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">Adjustment Title / Description</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Wallet Credit Adjustment"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-[#5E5CE6]/60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">Adjustment Amount (positive or negative)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="e.g. 50.00 or -25.50"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-[#5E5CE6]/60"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
