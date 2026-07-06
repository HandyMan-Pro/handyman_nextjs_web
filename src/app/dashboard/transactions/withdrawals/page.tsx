'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/apiClient';
import { getUserData } from '../../../../lib/auth';
import { TransactionsTabs } from '../TransactionsTabs';
import { Search, Loader2, CircleDollarSign, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

interface WithdrawalItem {
  id: string;
  bank_name: string;
  amount: number;
  payment_type: string;
  created_at: string;
  status: string;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bankName, setBankName] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
    fetchWalletBalance();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/provider/transactions/withdrawals');
      setWithdrawals(res.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const user = getUserData();
      if (user?.id) {
        const res = await apiClient.get(`/user-detail?id=${user.id}`);
        // Support both data.wallet_amount and data.data.wallet_amount depending on serializer structure
        const amount = res.data?.data?.wallet_amount ?? res.data?.wallet_amount ?? 0;
        setWalletBalance(amount);
      }
    } catch (err) {
      console.error('Failed to fetch wallet balance', err);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !amount) {
      alert('Please fill out all fields.');
      return;
    }

    const requestAmount = parseFloat(amount);
    if (isNaN(requestAmount) || requestAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (requestAmount > walletBalance) {
      alert(`Insufficient clear balance. Your maximum withdrawal is $${walletBalance.toFixed(2)}.`);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.post('/provider/transactions/withdrawals', {
        bank_name: bankName,
        amount: requestAmount
      });
      setSuccess('Withdrawal request submitted successfully!');
      setBankName('');
      setAmount('');
      setIsModalOpen(false);
      fetchWithdrawals();
      fetchWalletBalance();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to request withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter logic
  const filtered = withdrawals.filter(w =>
    w.bank_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.payment_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalEntries = filtered.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const paginatedData = filtered.slice(startIndex, endIndex);

  // Format Date Helper
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-zinc-100 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CircleDollarSign className="w-6 h-6 text-[#5E5CE6]" />
            Financial Hub
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Manage, aggregate and request payouts for your transactions.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#18181b] border border-zinc-800/60 px-4 py-2 rounded-xl text-right shadow-md">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Wallet Balance</span>
            <span className="text-lg font-bold text-white">${walletBalance.toFixed(2)}</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#5E5CE6] hover:bg-[#4E4CD6] active:bg-[#3E3CB6] text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20"
          >
            <Plus className="w-4 h-4" />
            Request Withdrawal
          </button>
        </div>
      </div>

      {/* Tabs */}
      <TransactionsTabs />

      {/* Main Table Card */}
      <div className="bg-[#18181b] border border-zinc-800/60 rounded-xl overflow-hidden shadow-xl">
        
        {/* Filter Bar */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800/60 bg-[#121214]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#18181b] border border-zinc-800/60 text-zinc-200 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-[#5E5CE6]"
            >
              <option value={10}>10 entries</option>
              <option value={25}>25 entries</option>
              <option value={50}>50 entries</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search withdrawal history..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#18181b] border border-zinc-800/60 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#5E5CE6] transition-all"
            />
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-900/20 border-b border-red-900/40 text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-900/20 border-b border-emerald-900/40 text-emerald-400 text-sm">
            {success}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
            <span className="text-zinc-400 text-sm">Loading withdrawals history...</span>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CircleDollarSign className="w-12 h-12 text-zinc-700 mb-3" />
            <p className="text-zinc-400 text-sm">No withdrawals requested yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5E5CE6]/90 border-b border-zinc-800/60">
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Bank Name</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Payment Type</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 bg-[#18181b]">
                {paginatedData.map((w, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-zinc-200 font-semibold">
                      {w.bank_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white text-right">
                      ${w.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {w.payment_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {formatDate(w.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        w.status.toLowerCase() === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : w.status.toLowerCase() === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        {!loading && totalEntries > 0 && (
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/60 bg-[#121214]">
            <span className="text-xs text-zinc-400">
              Showing {startIndex + 1} to {endIndex} of {totalEntries} entries
            </span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-zinc-800 bg-[#18181b] hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      currentPage === page
                        ? 'bg-[#5E5CE6] text-white shadow-lg'
                        : 'border border-zinc-800 bg-[#18181b] text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-zinc-800 bg-[#18181b] hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Withdrawal Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 flex items-center justify-between border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CircleDollarSign className="w-5 h-5 text-[#5E5CE6]" />
                Request Payout
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateRequest}>
              <div className="p-6 space-y-4">
                <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/60 mb-2 flex justify-between items-center">
                  <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Available Balance</span>
                  <span className="text-lg font-bold text-white">${walletBalance.toFixed(2)}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Bank Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your bank name..."
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-[#121214] border border-zinc-800/60 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#5E5CE6] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-sm font-bold text-zinc-500">$</span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-[#121214] border border-zinc-800/60 rounded-xl pl-8 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#5E5CE6] transition-all"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-[#121214] border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-[#5E5CE6] hover:bg-[#4E4CD6] active:bg-[#3E3CB6] disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-all shadow-md shadow-[#5E5CE6]/10"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
