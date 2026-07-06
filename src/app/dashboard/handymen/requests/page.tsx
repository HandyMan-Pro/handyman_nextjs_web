'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/apiClient';
import { getUserData } from '../../../../lib/auth';
import { HandymenTabs } from '../HandymenTabs';
import {
  Search, Loader2, Check
} from 'lucide-react';

interface RequestItem {
  id: string;
  handyman_id: string;
  display_name: string;
  email: string;
  contact_number: string;
  address: string;
  wallet_amount: number;
  status: string;
  created_at: string;
}

export default function HandymanRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('No Action');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Action Loading states
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUser(getUserData());
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/provider/handymen/requests');
      setRequests(res.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    setAcceptingId(id);
    setError('');
    setSuccess('');
    try {
      await apiClient.post(`/provider/handymen/requests/${id}/accept`);
      setSuccess('Handyman request accepted successfully!');
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to accept handyman request');
    } finally {
      setAcceptingId(null);
    }
  };

  // Bulk Apply Action
  const handleApplyAction = () => {
    if (selectedIds.length === 0) {
      alert('Please select entries to apply action.');
      return;
    }
    if (selectedAction === 'Accept Selected') {
      if (confirm(`Accept all ${selectedIds.length} selected join requests?`)) {
        Promise.all(selectedIds.map(id => apiClient.post(`/provider/handymen/requests/${id}/accept`)))
          .then(() => {
            setSuccess('Selected join requests accepted successfully.');
            setSelectedIds([]);
            fetchRequests();
          })
          .catch(err => setError(err.message));
      }
    } else {
      alert(`Action "${selectedAction}" triggered for selected rows.`);
    }
  };

  // Search logic
  const filtered = requests.filter(r =>
    r.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.contact_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalEntries = filtered.length;
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;

  const toggleSelectAll = () => {
    if (selectedIds.length === currentEntries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentEntries.map(r => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Handyman Requests</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Review and accept pending connection requests from independent handymen.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <HandymenTabs />

      {/* Alerts */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-zinc-500 hover:text-white">✕</button>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter / Actions Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#121214] border border-zinc-800/60 p-4 rounded-xl">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="h-10 px-3 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5E5CE6]"
          >
            <option>No Action</option>
            <option>Accept Selected</option>
          </select>
          <button
            onClick={handleApplyAction}
            className="h-10 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg text-sm transition-all"
          >
            Apply
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search..."
            className="w-full h-10 pl-9 pr-4 bg-zinc-900 border border-zinc-800 text-zinc-300 placeholder:text-zinc-600 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5E5CE6]"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#18181b] border border-zinc-800/60 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse">
            <thead>
              <tr className="bg-[#5E5CE6]/90 border-b border-zinc-800/60 text-left">
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={currentEntries.length > 0 && selectedIds.length === currentEntries.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-[#5E5CE6] focus:ring-0 focus:ring-offset-0"
                  />
                </th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider px-6 py-4">Name</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider px-4 py-4">Joining Date</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider px-6 py-4">Provider</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider px-4 py-4">Contact Number</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider px-6 py-4">Address</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider px-4 py-4">Wallet Amount</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider px-4 py-4 text-center">Status</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-20 text-sm text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#5E5CE6]" />
                    Loading requests...
                  </td>
                </tr>
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-sm text-zinc-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                currentEntries.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-800/25 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r.id)}
                        onChange={() => toggleSelectOne(r.id)}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-[#5E5CE6] focus:ring-0 focus:ring-offset-0"
                      />
                    </td>
                    {/* Name column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-bold text-white text-sm">
                          {r.display_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{r.display_name}</p>
                          <p className="text-xs text-zinc-400">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Joining date */}
                    <td className="px-4 py-4 text-sm text-zinc-300">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                    </td>
                    {/* Provider column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#5E5CE6]/10 flex items-center justify-center text-[10px] font-bold text-[#5E5CE6]">
                          {currentUser?.display_name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{currentUser?.display_name || 'Owner'}</p>
                          <p className="text-[10px] text-zinc-500">{currentUser?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    {/* Contact Number */}
                    <td className="px-4 py-4 text-sm text-zinc-300">{r.contact_number || '—'}</td>
                    {/* Address */}
                    <td className="px-6 py-4 text-sm text-zinc-400 max-w-[200px] truncate" title={r.address}>
                      {r.address || '—'}
                    </td>
                    {/* Wallet Amount */}
                    <td className="px-4 py-4 text-sm font-semibold text-[#5E5CE6]">
                      ${r.wallet_amount.toFixed(2)}
                    </td>
                    {/* Status Button Accept */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleAccept(r.id)}
                        disabled={acceptingId !== null}
                        className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-md shadow-emerald-950/20"
                      >
                        {acceptingId === r.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          'Accept'
                        )}
                      </button>
                    </td>
                    {/* Action */}
                    <td className="px-6 py-4 text-center text-zinc-500">—</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-zinc-800/60 bg-[#141416]">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Display</span>
            <select
              value={entriesPerPage}
              onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded px-1.5 py-1 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="text-xs text-zinc-400">
            {totalEntries === 0 ? '0 to 0' : `${indexOfFirst + 1} to ${Math.min(indexOfLast, totalEntries)}`} of {totalEntries} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg disabled:opacity-50 disabled:hover:text-zinc-400 transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 px-3 text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg disabled:opacity-50 disabled:hover:text-zinc-400 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
