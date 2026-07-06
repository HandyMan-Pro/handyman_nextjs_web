'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { 
  Search, Loader2, Eye, X, ChevronLeft, ChevronRight, Coins, DollarSign, Wallet, ArrowUpDown, User
} from 'lucide-react';

interface HandymanEarning {
  booking_id: string;
  service_name: string;
  handyman_id: string;
  handyman_name: string;
  handyman_avatar: string | null;
  total_earning: number;
  admin_earning: number;
  provider_earning: number;
  handyman_due: number;
  handyman_paid: number;
}

export default function HandymanEarningsPage() {
  const [earnings, setEarnings] = useState<HandymanEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Details Modal
  const [selectedEarning, setSelectedEarning] = useState<HandymanEarning | null>(null);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/provider/transactions/handyman-earnings');
      setEarnings(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch handyman earnings');
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search Logic
  const filteredEarnings = earnings.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.handyman_name.toLowerCase().includes(query) ||
      item.service_name.toLowerCase().includes(query) ||
      item.booking_id.toLowerCase().includes(query)
    );
  });

  // Pagination Logic
  const totalItems = filteredEarnings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEarnings = filteredEarnings.slice(startIndex, startIndex + itemsPerPage);

  // Stats
  const totalBookingRevenue = earnings.reduce((sum, item) => sum + item.total_earning, 0);
  const totalHandymanDue = earnings.reduce((sum, item) => sum + item.handyman_due, 0);
  const totalHandymanPaid = earnings.reduce((sum, item) => sum + item.handyman_paid, 0);
  const netProviderEarning = earnings.reduce((sum, item) => sum + item.provider_earning, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5E5CE6] to-[#8E8DFF] flex items-center justify-center shadow-lg shadow-[#5E5CE6]/10">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Handyman Earnings</h1>
              <p className="text-zinc-400 text-sm mt-0.5">
                Track job payouts, provider margins, and commission distributions for your handyman team.
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchEarnings}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700/80 active:bg-zinc-800 border border-zinc-700/60 rounded-xl text-sm font-medium transition-all"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#18181b] border border-zinc-800/60 rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Total Booking Revenue</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-100">{formatCurrency(totalBookingRevenue)}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-semibold">
              REV
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] border border-zinc-800/60 rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Net Provider Margin</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-400">{formatCurrency(netProviderEarning)}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] border border-zinc-800/60 rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Handyman Pay Due</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold tracking-tight text-amber-400">{formatCurrency(totalHandymanDue)}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] border border-zinc-800/60 rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Handyman Paid Amount</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold tracking-tight text-[#5E5CE6]">{formatCurrency(totalHandymanPaid)}</span>
            <div className="w-8 h-8 rounded-lg bg-[#5E5CE6]/10 flex items-center justify-center text-[#5E5CE6]">
              <Coins className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-[#18181b] border border-zinc-800/60 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search handyman, service..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-850 hover:border-zinc-800 focus:border-zinc-700 rounded-xl text-xs font-medium placeholder-zinc-500 focus:outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-zinc-900 border border-zinc-850 rounded-lg text-xs font-medium focus:outline-none focus:border-zinc-700"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Earning Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
              <span className="text-zinc-500 text-xs font-medium">Loading handyman earnings...</span>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3 text-red-400">
                <span className="text-lg">⚠️</span>
              </div>
              <p className="text-red-400 text-xs font-medium">{error}</p>
            </div>
          ) : paginatedEarnings.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-xs font-medium">
              No data available in table
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5E5CE6]/90 text-white select-none">
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-3">Handyman</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-3">Booking</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-3">Handyman Pay Due</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-3">Handyman Paid Amount</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-3">Provider Total Earning</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-3">Admin Earning</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-3">Total Earning</th>
                  <th className="text-center text-[11px] font-semibold uppercase tracking-wider px-4 py-3 w-20">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {paginatedEarnings.map((item, idx) => (
                  <tr 
                    key={idx}
                    className="hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* Handyman */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {item.handyman_avatar ? (
                          <img 
                            src={item.handyman_avatar} 
                            alt={item.handyman_name}
                            className="w-8 h-8 rounded-full object-cover border border-zinc-700/50"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5E5CE6]/20 to-[#8E8DFF]/20 border border-[#5E5CE6]/20 flex items-center justify-center text-[#5E5CE6] font-bold text-xs">
                            {getInitials(item.handyman_name)}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-zinc-200">{item.handyman_name}</span>
                      </div>
                    </td>

                    {/* Booking Stacked */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#5E5CE6]">#{item.booking_id.slice(-6)}</span>
                        <span className="text-[11px] text-zinc-400 mt-0.5">{item.service_name}</span>
                      </div>
                    </td>

                    {/* Handyman Pay Due */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-bold text-amber-400">{formatCurrency(item.handyman_due)}</span>
                    </td>

                    {/* Handyman Paid Amount */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-zinc-300">{formatCurrency(item.handyman_paid)}</span>
                    </td>

                    {/* Provider Total Earning */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-emerald-400">{formatCurrency(item.provider_earning)}</span>
                    </td>

                    {/* Admin Earning */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-zinc-400">{formatCurrency(item.admin_earning)}</span>
                    </td>

                    {/* Total Earning */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-bold text-zinc-100">{formatCurrency(item.total_earning)}</span>
                    </td>

                    {/* Action Eye */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => setSelectedEarning(item)}
                        className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-[#5E5CE6] border border-transparent hover:border-zinc-700/60 rounded-lg transition-all"
                        title="View Detailed Earning Breakdown"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Pagination */}
        {!loading && !error && filteredEarnings.length > 0 && (
          <div className="p-4 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
            <span className="text-xs text-zinc-500 font-medium">
              Showing <span className="text-zinc-300 font-semibold">{startIndex + 1}</span> to{' '}
              <span className="text-zinc-300 font-semibold">
                {Math.min(startIndex + itemsPerPage, totalItems)}
              </span>{' '}
              of <span className="text-zinc-300 font-semibold">{totalItems}</span> entries
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 bg-zinc-900 border border-zinc-850 hover:border-zinc-800 rounded-lg text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:text-zinc-200 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      currentPage === page
                        ? 'bg-[#5E5CE6] text-white shadow-md shadow-[#5E5CE6]/25'
                        : 'bg-zinc-900 border border-zinc-850 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 bg-zinc-900 border border-zinc-850 hover:border-zinc-800 rounded-lg text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:text-zinc-200 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Breakdown Modal */}
      {selectedEarning && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-zinc-800/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#5E5CE6]" />
                <h3 className="text-sm font-bold text-zinc-100">Financial Earning Breakdown</h3>
              </div>
              <button
                onClick={() => setSelectedEarning(null)}
                className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Handyman Context */}
              <div className="bg-zinc-900/50 border border-zinc-850 rounded-xl p-3 flex items-center gap-3">
                {selectedEarning.handyman_avatar ? (
                  <img 
                    src={selectedEarning.handyman_avatar} 
                    alt={selectedEarning.handyman_name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5E5CE6]/20 to-[#8E8DFF]/20 border border-[#5E5CE6]/20 flex items-center justify-center text-[#5E5CE6] font-bold text-sm">
                    {getInitials(selectedEarning.handyman_name)}
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">{selectedEarning.handyman_name}</h4>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Assigned Handyman</span>
                </div>
              </div>

              {/* Booking Context */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Booking Source</span>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#5E5CE6]">#{selectedEarning.booking_id}</span>
                  <span className="text-zinc-300 font-medium">{selectedEarning.service_name}</span>
                </div>
              </div>

              <div className="border-t border-zinc-800/60 my-2"></div>

              {/* Financial Split Breakdown */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Split Details</span>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Total Booking Amount</span>
                  <span className="font-bold text-zinc-200">{formatCurrency(selectedEarning.total_earning)}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Platform Comm. (Admin)</span>
                  <span className="font-medium text-zinc-400">-{formatCurrency(selectedEarning.admin_earning)}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Provider Gross Earning</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(selectedEarning.provider_earning)}</span>
                </div>

                <div className="border-t border-zinc-800/40 my-1"></div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Handyman Share (Due)</span>
                  <span className="font-bold text-amber-400">{formatCurrency(selectedEarning.handyman_due)}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Handyman Paid Amount</span>
                  <span className="font-semibold text-[#5E5CE6]">{formatCurrency(selectedEarning.handyman_paid)}</span>
                </div>

                <div className="bg-zinc-900/80 rounded-xl p-3 border border-zinc-800/60 flex justify-between items-center mt-2">
                  <span className="text-xs font-semibold text-zinc-300">Remaining Balance Due</span>
                  <span className={`text-sm font-bold ${
                    (selectedEarning.handyman_due - selectedEarning.handyman_paid) > 0 ? 'text-amber-400' : 'text-zinc-400'
                  }`}>
                    {formatCurrency(Math.max(0, selectedEarning.handyman_due - selectedEarning.handyman_paid))}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800/60 bg-zinc-900/30 flex justify-end">
              <button
                onClick={() => setSelectedEarning(null)}
                className="px-4 py-2 bg-[#5E5CE6] hover:bg-[#4d4cbd] active:bg-[#5E5CE6] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#5E5CE6]/10 transition-all"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
