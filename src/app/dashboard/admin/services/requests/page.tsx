'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../../lib/apiClient';
import {
  ClipboardList, Search, Loader2, AlertCircle, CheckCircle,
  User, Check, X, Calendar, MapPin, Tag, RefreshCw
} from 'lucide-react';

interface ServiceRequest {
  id: string;
  service_name: string;
  provider: {
    id: string;
    name: string;
    email: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
  };
  status: string;
  amount: number;
  date: string;
  booking_slot: string;
}

export default function AdminServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/service-requests');
      setRequests(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch service requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActioningId(id);
    setError('');
    setSuccess('');
    try {
      await apiClient.put(`/admin/service-requests/${id}/action`, { action });
      setSuccess(`Service request has been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || `Failed to ${action} request.`);
    } finally {
      setActioningId(null);
    }
  };

  const filteredRequests = requests.filter(req =>
    req.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ClipboardList className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Service Request Approvals
          </h1>
          <p className="text-zinc-550 text-xs mt-0.5">
            Audit and authorize incoming customer service bookings before they are dispatched to handymen.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="h-8.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
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

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-550" />
          <input
            type="text"
            placeholder="Search service name, provider, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 pl-9 pr-4 bg-[#2c2c2e] border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-655 focus:outline-none focus:border-[#5E5CE6]/60 transition-colors"
          />
        </div>
        <div className="text-xs text-zinc-500 font-semibold">
          Found {filteredRequests.length} pending service requests
        </div>
      </div>

      {/* List / Cards for Approval */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border border-zinc-850 rounded-2xl p-5 bg-[#18181b] animate-pulse space-y-3">
              <div className="h-4 bg-zinc-800 rounded w-1/3" />
              <div className="h-3 bg-zinc-800 rounded w-2/3" />
              <div className="h-3 bg-zinc-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="border border-zinc-850 rounded-xl p-12 text-center bg-[#18181b] text-zinc-500 text-xs">
          No pending service requests waiting for approval.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(req => (
            <div key={req.id} className="border border-zinc-850 rounded-2xl bg-[#18181b] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-zinc-700/80 transition-all duration-300">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">{req.service_name}</h3>
                  <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-400">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Provider</p>
                    <p className="font-semibold text-zinc-200">{req.provider.name}</p>
                    <p className="text-[10px] text-zinc-500">{req.provider.email}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Customer</p>
                    <p className="font-semibold text-zinc-200">{req.customer.name}</p>
                    <p className="text-[10px] text-zinc-500">{req.customer.email}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Booking Slot</p>
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{req.date} at {req.booking_slot}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price and Action Buttons */}
              <div className="flex items-center justify-between md:justify-end gap-5 border-t border-zinc-850 pt-4 md:border-t-0 md:pt-0">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Booking Amount</p>
                  <p className="text-base font-black text-white">${req.amount.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={actioningId !== null}
                    onClick={() => handleAction(req.id, 'reject')}
                    className="h-8 px-3.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-bold rounded-lg border border-rose-500/20 text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    {actioningId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                    Reject
                  </button>

                  <button
                    disabled={actioningId !== null}
                    onClick={() => handleAction(req.id, 'approve')}
                    className="h-8 px-3.5 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white font-bold rounded-lg border border-emerald-500/20 text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    {actioningId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
