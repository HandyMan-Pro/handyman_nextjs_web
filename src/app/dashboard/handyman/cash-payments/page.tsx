'use client';

import { useEffect, useState, useMemo } from 'react';
import useSWR from 'swr';
import { apiClient } from '../../../../lib/apiClient';
import {
  Search,
  Calendar as CalendarIcon,
  DollarSign,
  User,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Coins
} from 'lucide-react';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

interface Customer {
  name: string;
  email: string;
  avatar: string;
}

interface Payment {
  booking_id: string;
  transaction_id: string;
  service_name: string;
  customer: Customer;
  payment_type: string;
  status: string;
  date: string;
  amount: number;
}

export default function HandymanCashPayments() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: payments = [], error, isLoading, mutate } = useSWR<Payment[]>(
    mounted ? '/handyman/transactions/cash-payments' : null,
    fetcher
  );

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  };

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      // 1. Search Query Filter (Customer Name or Service Name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const customerName = payment.customer?.name?.toLowerCase() || '';
        const serviceName = payment.service_name?.toLowerCase() || '';
        if (!customerName.includes(query) && !serviceName.includes(query)) {
          return false;
        }
      }

      // 2. Date Range Filter
      if (startDate || endDate) {
        if (!payment.date) return false;
        const paymentDate = new Date(payment.date);
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (paymentDate < start) return false;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (paymentDate > end) return false;
        }
      }

      return true;
    });
  }, [payments, searchQuery, startDate, endDate]);

  // Aggregate Stats
  const stats = useMemo(() => {
    let collected = 0;
    let pending = 0;
    let count = 0;

    filteredPayments.forEach(p => {
      const isPaid = p.status.toLowerCase() === 'paid' || p.status.toLowerCase() === 'completed' || p.status.toLowerCase() === 'collected';
      if (isPaid) {
        collected += p.amount;
      } else {
        pending += p.amount;
      }
      count++;
    });

    return { collected, pending, count };
  }, [filteredPayments]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Cash Payments
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage and log all physical on-site cash payments collected from customers.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading || refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-sm transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading || refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Collected */}
        <div className="bg-[#18181b] border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-[#7367F0]/5 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110" />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[#7367F0]/10 text-[#7367F0]">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Total Cash Collected</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                ${stats.collected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>

        {/* Pending Collection */}
        <div className="bg-[#18181b] border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110" />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Uncollected / Pending</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                ${stats.pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="bg-[#18181b] border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110" />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Total Cash Jobs</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stats.count} <span className="text-sm font-normal text-zinc-500">jobs</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-[#18181b] border border-zinc-800/80 rounded-xl p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by customer or service..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#7367F0] focus:ring-1 focus:ring-[#7367F0] transition-colors"
            />
          </div>

          {/* Date Range Start */}
          <div className="relative">
            <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 pointer-events-none" />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-[#7367F0] focus:ring-1 focus:ring-[#7367F0] transition-colors scheme-dark"
            />
          </div>

          {/* Date Range End */}
          <div className="relative">
            <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 pointer-events-none" />
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-[#7367F0] focus:ring-1 focus:ring-[#7367F0] transition-colors scheme-dark"
            />
          </div>
        </div>

        {/* Clear Filters helper */}
        {(searchQuery || startDate || endDate) && (
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setSearchQuery('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-[#7367F0] hover:text-[#7367F0]/80 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-[#18181b] border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#7367F0]/10 border-b border-zinc-800/50">
                <th className="py-4 px-6 text-[#7367F0] font-semibold text-xs uppercase tracking-wider">Booking ID</th>
                <th className="py-4 px-6 text-[#7367F0] font-semibold text-xs uppercase tracking-wider">Transaction ID</th>
                <th className="py-4 px-6 text-[#7367F0] font-semibold text-xs uppercase tracking-wider">Service</th>
                <th className="py-4 px-6 text-[#7367F0] font-semibold text-xs uppercase tracking-wider">Customer</th>
                <th className="py-4 px-6 text-[#7367F0] font-semibold text-xs uppercase tracking-wider">Type</th>
                <th className="py-4 px-6 text-[#7367F0] font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-[#7367F0] font-semibold text-xs uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-[#7367F0] font-semibold text-xs uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {isLoading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse bg-[#18181b]">
                    <td className="py-4 px-6"><div className="h-4 bg-zinc-800 rounded w-16" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-zinc-800 rounded w-24" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-zinc-800 rounded w-32" /></td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800" />
                        <div className="space-y-1">
                          <div className="h-3 bg-zinc-800 rounded w-20" />
                          <div className="h-3 bg-zinc-800 rounded w-28" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><div className="h-4 bg-zinc-800 rounded w-12" /></td>
                    <td className="py-4 px-6"><div className="h-6 bg-zinc-800 rounded-full w-16" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-zinc-800 rounded w-20" /></td>
                    <td className="py-4 px-6 text-right"><div className="h-4 bg-zinc-800 rounded w-12 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map(p => {
                  const isPaid = p.status.toLowerCase() === 'paid' || p.status.toLowerCase() === 'completed' || p.status.toLowerCase() === 'collected';
                  return (
                    <tr
                      key={p.booking_id}
                      className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Booking ID */}
                      <td className="py-4 px-6 font-mono text-xs text-zinc-400">
                        #{p.booking_id ? p.booking_id.substring(p.booking_id.length - 6).toUpperCase() : 'N/A'}
                      </td>

                      {/* Transaction ID */}
                      <td className="py-4 px-6 font-mono text-xs text-zinc-400 text-zinc-500">
                        {p.transaction_id || 'CASH-COLLECTED'}
                      </td>

                      {/* Service Name */}
                      <td className="py-4 px-6 text-sm font-medium text-white">
                        {p.service_name}
                      </td>

                      {/* Customer info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {p.customer?.avatar ? (
                            <img
                              src={p.customer.avatar}
                              alt={p.customer.name}
                              className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#7367F0]/10 flex items-center justify-center text-[#7367F0] font-semibold text-xs">
                              {p.customer?.name ? p.customer.name.charAt(0).toUpperCase() : '?'}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">{p.customer?.name || 'Customer'}</p>
                            <p className="text-xs text-zinc-500">{p.customer?.email || 'customer@example.com'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Payment Type */}
                      <td className="py-4 px-6 text-sm text-zinc-400">
                        {p.payment_type}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {isPaid ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {p.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-sm text-zinc-400">
                        {p.date ? new Date(p.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'N/A'}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6 text-sm font-semibold text-white text-right">
                        ${p.amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                // Empty State
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertCircle className="w-10 h-10 text-zinc-600" />
                      <div>
                        <p className="text-sm font-medium text-white">No Cash Payments Found</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          We couldn't find any cash payments matching your filters.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
