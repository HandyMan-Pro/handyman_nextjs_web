'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import {
  Briefcase, CheckCircle, XCircle, Search, Edit,
  Shield, Mail, Phone, IndianRupee, Star,
  AlertTriangle, RefreshCw, X, Loader2
} from 'lucide-react';

interface Provider {
  id: string;
  display_name: string;
  email: string;
  phone?: string;
  status: number; // 1 = Active, 0 = Inactive
  is_verified?: boolean;
  commission_rate?: number; // custom commission
  wallet_balance?: number;
  rating?: number;
  user_type: string;
  created_at?: string;
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
  id_proof_type?: string;
  id_proof_number?: string;
  documents?: string[];
  verification_rejection_reason?: string;
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Edit states
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commRate, setCommRate] = useState<number>(15);
  const [verifiedStatus, setVerifiedStatus] = useState<boolean>(false);
  const [statusVal, setStatusVal] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  const [verifyingProvider, setVerifyingProvider] = useState<Provider | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/providers');
      // Filter for providers only
      const list = (res.data || []).filter((u: Provider) => u.user_type === 'provider');
      setProviders(list);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAction = async (providerId: string, status: 'verified' | 'rejected', reason?: string) => {
    setActionLoading(true);
    setError('');
    try {
      const res = await apiClient.put(`/admin/providers/${providerId}/verify`, {
        status,
        reason
      });
      if (res.data?.status) {
        showSuccess(res.data.message || `Provider verification status updated to ${status}`);
        setProviders(prev => prev.map(p => {
          if (p.id === providerId) {
            return {
              ...p,
              verification_status: status,
              is_verified: status === 'verified',
              verification_rejection_reason: status === 'rejected' ? reason : undefined
            };
          }
          return p;
        }));
        setShowRejectModal(false);
        setRejectReason('');
        setVerifyingProvider(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to update verification status.');
    } finally {
      setActionLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const openEditModal = (provider: Provider) => {
    setEditingProvider(provider);
    setCommRate(provider.commission_rate ?? 15);
    setVerifiedStatus(provider.is_verified ?? false);
    setStatusVal(provider.status);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider) return;

    setSaving(true);
    try {
      await apiClient.put(`/providers/${editingProvider.id}`, {
        commission_rate: Number(commRate),
        is_verified: verifiedStatus,
        status: statusVal
      });
      showSuccess(`Provider "${editingProvider.display_name}" updated successfully!`);
      setIsModalOpen(false);
      fetchProviders();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update provider');
    } finally {
      setSaving(false);
    }
  };

  const toggleVerification = async (provider: Provider) => {
    try {
      const nextVal = !provider.is_verified;
      await apiClient.put(`/providers/${provider.id}`, {
        is_verified: nextVal
      });
      showSuccess(`Verification status of "${provider.display_name}" updated.`);
      fetchProviders();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update verification status');
    }
  };

  const filteredProviders = providers.filter(p =>
    p.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.phone || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Providers</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Manage partner listings, custom commission rates, and verifications.</p>
        </div>
        <button
          onClick={fetchProviders}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm animate-fade-in">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800/60 pb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search providers by name, email, phone..."
            className="w-full h-10 pl-9 pr-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
          />
        </div>
      </div>

      {/* Grid or Table */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-zinc-900/50 border border-zinc-800/30 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-800/60 bg-zinc-900/40">
                  <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Provider info</th>
                  <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Contact</th>
                  <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Rating</th>
                  <th className="text-right text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Wallet</th>
                  <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Commission</th>
                  <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Verified</th>
                  <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filteredProviders.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center font-bold text-primary">
                          {p.display_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-100">{p.display_name}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.25 rounded text-[10px] font-medium mt-1 ${
                            p.status === 1 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {p.status === 1 ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs space-y-1 text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{p.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{p.phone || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-zinc-800/80 border border-zinc-700/30 px-2 py-0.5 rounded-lg text-xs font-semibold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{p.rating ?? '5.0'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-zinc-200">
                      ₹{(p.wallet_balance ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-zinc-300">
                      {p.commission_rate ?? 'Default'}%
                    </td>
                    <td className="px-4 py-4 text-center">
                      {p.verification_status === 'pending' ? (
                        <div className="flex flex-col items-center gap-1.5 py-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-405 border border-amber-500/20">
                            Pending Review
                          </span>
                          <div className="text-[10px] text-zinc-500 max-w-[150px] truncate">
                            {p.id_proof_type}: {p.id_proof_number}
                          </div>
                          {p.documents && p.documents.length > 0 && (
                            <a
                              href={p.documents[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-primary hover:underline font-semibold"
                            >
                              View Doc ({p.documents.length})
                            </a>
                          )}
                          <div className="flex items-center gap-1.5 mt-1">
                            <button
                              onClick={() => handleVerifyAction(p.id, 'verified')}
                              className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-450 rounded text-[10px] font-bold border border-emerald-500/30 transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setVerifyingProvider(p);
                                setShowRejectModal(true);
                              }}
                              className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-455 rounded text-[10px] font-bold border border-rose-500/30 transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ) : p.verification_status === 'verified' || p.is_verified ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Verified
                          </span>
                          {p.id_proof_type && (
                            <span className="text-[9px] text-zinc-550">
                              {p.id_proof_type}
                            </span>
                          )}
                        </div>
                      ) : p.verification_status === 'rejected' ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-455 border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" />
                            Rejected
                          </span>
                          {p.verification_rejection_reason && (
                            <span className="text-[9px] text-rose-400/70 max-w-[120px] truncate" title={p.verification_rejection_reason}>
                              {p.verification_rejection_reason}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-550 border border-zinc-700/50">
                          Not Submitted
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openEditModal(p)}
                        className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors inline-flex items-center justify-center"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProviders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-sm text-zinc-500">
                      No service providers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      {/* Edit Provider Modal */}
      {isModalOpen && editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Configure Partner Settings
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/20 space-y-1">
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Partner Account</p>
                <p className="text-sm font-bold">{editingProvider.display_name}</p>
                <p className="text-xs text-zinc-400">{editingProvider.email}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Custom Commission Rate (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={commRate}
                  onChange={(e) => setCommRate(Number(e.target.value))}
                  placeholder="e.g. 15"
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Verification Status</label>
                <select
                  value={verifiedStatus ? 'yes' : 'no'}
                  onChange={(e) => setVerifiedStatus(e.target.value === 'yes')}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value="yes">Verified / Approved</option>
                  <option value="no">Pending Verification</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Account Access</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Suspended / Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Verification Modal */}
      {showRejectModal && verifyingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-850 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2 text-rose-455">
                <AlertTriangle className="w-5 h-5" />
                Reject ID Verification
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/20">
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Partner Name</p>
                <p className="text-sm font-bold text-zinc-200">{verifyingProvider.display_name}</p>
                <p className="text-xs text-zinc-400">{verifyingProvider.email}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                  Reason for Rejection
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. ID details do not match the profile name or document is blurry."
                  className="w-full p-3 bg-zinc-850 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/60"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerifyAction(verifyingProvider.id, 'rejected', rejectReason)}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="flex-1 h-11 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
