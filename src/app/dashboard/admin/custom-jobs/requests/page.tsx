'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../../lib/apiClient';
import {
  Search, Trash2, Eye, Loader2, AlertCircle, CheckCircle, X, ClipboardList
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Provider {
  id: string;
  name: string;
  email: string;
}

interface CustomJobRequest {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  customer: Customer;
  provider?: Provider;
  image_url?: string;
}

export default function AdminCustomJobRequestsPage() {
  const [requests, setRequests] = useState<CustomJobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewingRequest, setViewingRequest] = useState<CustomJobRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/custom-jobs/requests');
      setRequests(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch custom job requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom job request?')) return;
    setError('');
    setSuccess('');
    try {
      await apiClient.delete(`/admin/custom-jobs/requests/${id}`);
      setSuccess('Custom job request deleted successfully.');
      setRequests(prev => prev.filter(r => r.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
      if (viewingRequest?.id === id) setViewingRequest(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete custom job request.');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredRequests.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const filteredRequests = requests.filter(req =>
    req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (req.provider?.name && req.provider.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ClipboardList className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Job Request List
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            Moderate and view customer custom job requests posted to the bidding market.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-2.5 text-xs flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold">{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-zinc-500 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-2.5 text-xs flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span className="font-semibold">{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select className="bg-[#121214] border border-zinc-800/60 text-xs text-zinc-400 rounded-lg px-3 h-8.5 focus:outline-none">
            <option>No Action</option>
            <option>Delete Selected</option>
          </select>
          <button className="bg-[#5E5CE6] hover:bg-[#5E5CE6]/80 text-white font-semibold text-xs px-3 h-8.5 rounded-lg transition-colors">
            Apply
          </button>
          <select className="bg-[#121214] border border-zinc-800/60 text-xs text-zinc-400 rounded-lg px-3 h-8.5 focus:outline-none">
            <option>All Statuses</option>
            <option>Requested</option>
            <option>Assigned</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search job title, description, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 pl-9 pr-4 bg-[#121214] border border-zinc-800/60 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5E5CE6]/60 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-[#18181b] border border-zinc-850 rounded-xl">
          <Loader2 className="w-6 h-6 text-[#5E5CE6] animate-spin" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="border border-zinc-850 rounded-xl p-12 text-center bg-[#18181b] text-zinc-500 text-xs">
          No custom job requests found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800/50">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#5E5CE6]/90">
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredRequests.length && filteredRequests.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-zinc-600 bg-zinc-800 text-[#5E5CE6] focus:ring-[#5E5CE6] h-3.5 w-3.5"
                  />
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Title</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Provider</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Customer</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider">Price</th>
                <th className="py-3 px-4 text-[11px] font-bold text-white uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(req.id)}
                      onChange={(e) => handleSelectOne(req.id, e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-800 text-[#5E5CE6] focus:ring-[#5E5CE6] h-3.5 w-3.5"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {req.image_url ? (
                        <img
                          src={req.image_url}
                          alt={req.title}
                          className="w-10 h-10 object-cover rounded-lg border border-zinc-800/80 bg-zinc-900"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-800/60 border border-zinc-800/80 flex items-center justify-center text-zinc-550">
                          <ClipboardList className="w-5 h-5 text-zinc-600" />
                        </div>
                      )}
                      <div>
                        <button
                          onClick={() => setViewingRequest(req)}
                          className="text-[#5E5CE6] hover:underline font-semibold text-xs transition-all text-left block"
                        >
                          {req.title}
                        </button>
                        <p className="text-zinc-500 text-[10px] mt-0.5 line-clamp-1 max-w-[200px]">{req.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {req.provider ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-200">{req.provider.name}</span>
                        <span className="text-[10px] text-zinc-500">{req.provider.email}</span>
                      </div>
                    ) : (
                      <div className="text-center w-16 text-zinc-600 font-bold">-</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {req.customer.avatar ? (
                        <img
                          src={req.customer.avatar}
                          alt={req.customer.name}
                          className="w-7 h-7 rounded-full object-cover border border-zinc-800"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-bold uppercase">
                          {req.customer.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white leading-tight">{req.customer.name}</span>
                        <span className="text-[10px] text-zinc-400 leading-tight">{req.customer.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-md text-xs font-semibold inline-block">
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-black text-white text-xs">
                    ${req.budget ? req.budget.toFixed(2) : '0.00'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => setViewingRequest(req)}
                        title="View details"
                        className="text-zinc-500 hover:text-white p-1 hover:bg-zinc-800 rounded transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(req.id)}
                        title="Delete request"
                        className="text-rose-500 hover:text-rose-400 p-1 hover:bg-rose-950/30 rounded transition-all"
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

      {/* Details Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1c1c1e] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <ClipboardList className="w-4.5 h-4.5 text-[#5E5CE6]" />
                Custom Job Request Details
              </h3>
              <button
                onClick={() => setViewingRequest(null)}
                className="text-zinc-550 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Job Title</p>
                <p className="text-sm font-semibold text-white">{viewingRequest.title}</p>
              </div>

              {viewingRequest.image_url && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Reference Image</p>
                  <img
                    src={viewingRequest.image_url}
                    alt={viewingRequest.title}
                    className="w-full max-h-48 object-cover rounded-xl border border-zinc-800"
                  />
                </div>
              )}

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Description</p>
                <p className="text-xs text-zinc-400 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/40 leading-relaxed max-h-24 overflow-y-auto">
                  {viewingRequest.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-zinc-800/80 pt-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Budget Price</p>
                  <p className="text-sm font-extrabold text-white">${viewingRequest.budget ? viewingRequest.budget.toFixed(2) : '0.00'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Job Status</p>
                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[11px] font-bold inline-block">
                    {viewingRequest.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-zinc-800/80 pt-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Customer</p>
                  <p className="text-xs text-zinc-200 font-semibold">{viewingRequest.customer.name}</p>
                  <p className="text-[10px] text-zinc-500">{viewingRequest.customer.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Awarded Provider</p>
                  <p className="text-xs text-zinc-200 font-semibold">
                    {viewingRequest.provider?.name || 'Unassigned'}
                  </p>
                  {viewingRequest.provider && (
                    <p className="text-[10px] text-zinc-500">{viewingRequest.provider.email}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 py-3.5 bg-zinc-900/30 border-t border-zinc-800">
              <button
                onClick={() => setViewingRequest(null)}
                className="h-8.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
