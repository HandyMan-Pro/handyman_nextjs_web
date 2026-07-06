'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/apiClient';
import { TransactionsTabs } from '../TransactionsTabs';
import { Search, Loader2, CreditCard, ChevronLeft, ChevronRight, User } from 'lucide-react';

interface PaymentItem {
  booking_id: string;
  transaction_id: string;
  service_name: string;
  customer_name: string;
  customer_email: string;
  payment_method: string;
  status: string;
  date_time: string;
  total_amount: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/provider/transactions/payments');
      setPayments(res.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filtered = payments.filter(p =>
    p.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.booking_id.toLowerCase().includes(searchQuery.toLowerCase())
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
            <CreditCard className="w-6 h-6 text-[#5E5CE6]" />
            Financial Hub
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Manage, aggregate and request payouts for your transactions.</p>
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
              placeholder="Search bookings/transactions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#18181b] border border-zinc-800/60 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#5E5CE6] transition-all"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-900/20 border-b border-red-900/40 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
            <span className="text-zinc-400 text-sm">Loading transactions data...</span>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CreditCard className="w-12 h-12 text-zinc-700 mb-3" />
            <p className="text-zinc-400 text-sm">No transaction payments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5E5CE6]/90 border-b border-zinc-800/60">
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">User</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Payment Type</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-white uppercase tracking-wider text-right">Total Paid Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 bg-[#18181b]">
                {paginatedData.map((p, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-[#5E5CE6]">
                      #{p.booking_id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300 font-mono">
                      {p.transaction_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-200">
                      {p.service_name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                          <User className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-200">{p.customer_name}</span>
                          <span className="text-xs text-zinc-500">{p.customer_email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {p.payment_method}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {formatDate(p.date_time)}
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-bold text-right">
                      ${p.total_amount.toFixed(2)}
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
    </div>
  );
}
