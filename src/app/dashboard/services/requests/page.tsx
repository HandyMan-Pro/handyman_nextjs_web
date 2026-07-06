'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/apiClient';
import {
  ClipboardList, Search, User, Edit2, Trash2, HelpCircle,
  AlertCircle, CheckCircle
} from 'lucide-react';

interface ServiceRequest {
  id: string;
  customer_name: string;
  category: string;
  price_quote: number;
  status: string; // "pending", "accepted", "declined"
  created_at: string;
  updated_at: string;
}

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Table filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [entriesCount, setEntriesCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/provider/catalog/requests');
      setRequests(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch service requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: 'accepted' | 'declined') => {
    const originalRequests = [...requests];
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));

    try {
      await apiClient.put(`/provider/catalog/requests/${requestId}`, { status });
      setSuccess(`Request successfully ${status}!`);
    } catch (err: any) {
      setRequests(originalRequests);
      setError(err.response?.data?.detail || err.message || 'Failed to update request status.');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'pending' && req.status === 'pending') ||
      (statusFilter === 'accepted' && req.status === 'accepted') ||
      (statusFilter === 'declined' && req.status === 'declined');

    return matchesSearch && matchesStatus;
  });

  const totalEntries = filteredRequests.length;
  const totalPages = Math.ceil(totalEntries / entriesCount) || 1;
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * entriesCount, currentPage * entriesCount);

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ClipboardList className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Service Request List
          </h1>
          <p className="text-zinc-550 text-xs mt-0.5">
            Accept or decline custom service requests from customers.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-2.5 text-xs flex justify-between items-center animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold">{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-zinc-500 hover:text-white">
            <span className="sr-only">Dismiss</span>
            &times;
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-2.5 text-xs flex justify-between items-center animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span className="font-semibold">{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">
            <span className="sr-only">Dismiss</span>
            &times;
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#1c1c1e]/60 border border-zinc-800/80 p-3 rounded-xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select className="h-8.5 px-3 bg-[#2c2c2e] border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none">
            <option>No Action</option>
          </select>
          <button className="h-8.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-xs transition-colors">
            Apply
          </button>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8.5 px-3 bg-[#2c2c2e] border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 pl-9 pr-4 bg-[#2c2c2e] border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-[#5E5CE6]/60 transition-colors"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-zinc-850 rounded-xl overflow-hidden bg-[#18181b]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#5E5CE6]/90 border-b border-zinc-855">
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white uppercase tracking-wider">
                  Customer
                </th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white uppercase tracking-wider">
                  Category
                </th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white uppercase tracking-wider">
                  Price Quote
                </th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-right text-[11px] font-bold text-white uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-850 animate-pulse">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800" />
                        <div className="h-4 bg-zinc-800 rounded w-24" />
                      </div>
                    </td>
                    <td className="py-4 px-4"><div className="h-4 bg-zinc-800 rounded w-20" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-zinc-800 rounded w-16" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-zinc-800 rounded w-14" /></td>
                    <td className="py-4 px-4 text-right"><div className="h-4 bg-zinc-800 rounded w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-zinc-550">
                    No custom service requests found.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map(req => (
                  <tr key={req.id} className="border-b border-zinc-850 hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3.5 px-4 text-xs font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#5E5CE6]/10 flex items-center justify-center border border-zinc-800">
                          <User className="w-3.5 h-3.5 text-[#5E5CE6]" />
                        </div>
                        <span>{req.customer_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-zinc-400">
                      {req.category}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-white">
                      ${req.price_quote.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        req.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        req.status === 'declined' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'accepted')}
                            className="h-7 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-[10px] transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'declined')}
                            className="h-7 px-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-[10px] transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-550 font-bold">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-[#121214] border-t border-zinc-850 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-zinc-500 font-semibold">
          <div className="flex items-center gap-1.5">
            <span>Display</span>
            <select
              value={entriesCount}
              onChange={(e) => {
                setEntriesCount(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-7 px-2 bg-[#2c2c2e] border border-zinc-800 rounded text-zinc-300 focus:outline-none"
            >
              {[10, 25, 50].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span>entries</span>
          </div>

          <div>
            {totalEntries > 0 ? (
              <span>
                {(currentPage - 1) * entriesCount + 1} to {Math.min(currentPage * entriesCount, totalEntries)} of {totalEntries} entries
              </span>
            ) : (
              <span>0 entries</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 px-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 px-3.5 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-bold rounded-lg disabled:opacity-40 disabled:hover:bg-[#5E5CE6] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
