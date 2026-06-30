'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import {
  Wrench, CheckCircle, XCircle, Search, Mail, Phone,
  Star, RefreshCw, X, Loader2, Edit
} from 'lucide-react';

interface Handyman {
  id: string;
  display_name: string;
  email: string;
  phone?: string;
  status: number; // 1 = Active, 0 = Inactive
  is_verified?: boolean;
  wallet_balance?: number;
  rating?: number;
  user_type: string;
  created_at?: string;
}

export default function HandymenPage() {
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Edit states
  const [editingHandyman, setEditingHandyman] = useState<Handyman | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusVal, setStatusVal] = useState<number>(1);
  const [verifiedVal, setVerifiedVal] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHandymen();
  }, []);

  const fetchHandymen = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/providers');
      // Filter for handymen only
      const list = (res.data || []).filter((u: Handyman) => u.user_type === 'handyman');
      setHandymen(list);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch handymen');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const openEditModal = (h: Handyman) => {
    setEditingHandyman(h);
    setStatusVal(h.status);
    setVerifiedVal(h.is_verified ?? false);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHandyman) return;

    setSaving(true);
    try {
      await apiClient.put(`/providers/${editingHandyman.id}`, {
        status: statusVal,
        is_verified: verifiedVal
      });
      showSuccess(`Handyman "${editingHandyman.display_name}" updated successfully!`);
      setIsModalOpen(false);
      fetchHandymen();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update handyman');
    } finally {
      setSaving(false);
    }
  };

  const filteredHandymen = handymen.filter(h =>
    h.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.phone || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Handymen</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Manage on-field handyman profiles, ratings, status, and verification.</p>
        </div>
        <button
          onClick={fetchHandymen}
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
            placeholder="Search handymen by name, email, phone..."
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
                  <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Handyman info</th>
                  <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Contact</th>
                  <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Rating</th>
                  <th className="text-right text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Wallet</th>
                  <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Verification</th>
                  <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filteredHandymen.map((h) => (
                  <tr key={h.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center font-bold text-amber-500">
                          {h.display_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-100">{h.display_name}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.25 rounded text-[10px] font-medium mt-1 ${
                            h.status === 1 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {h.status === 1 ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs space-y-1 text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{h.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{h.phone || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-zinc-800/80 border border-zinc-700/30 px-2 py-0.5 rounded-lg text-xs font-semibold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{h.rating ?? '5.0'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-zinc-200">
                      ₹{(h.wallet_balance ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        h.is_verified
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {h.is_verified ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {h.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openEditModal(h)}
                        className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors inline-flex items-center justify-center"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredHandymen.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-sm text-zinc-500">
                      No handymen found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Handyman Modal */}
      {isModalOpen && editingHandyman && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-500" />
                Configure Handyman Settings
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/20 space-y-1">
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Handyman Account</p>
                <p className="text-sm font-bold">{editingHandyman.display_name}</p>
                <p className="text-xs text-zinc-400">{editingHandyman.email}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Verification Status</label>
                <select
                  value={verifiedVal ? 'yes' : 'no'}
                  onChange={(e) => setVerifiedVal(e.target.value === 'yes')}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value="yes">Verified</option>
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
    </div>
  );
}
