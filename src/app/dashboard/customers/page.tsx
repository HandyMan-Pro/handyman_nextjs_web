'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import {
  Users, CheckCircle, XCircle, Search, Mail, Phone,
  RefreshCw, X, Loader2, Edit, Calendar, UserMinus, ShieldAlert
} from 'lucide-react';

interface Customer {
  id: string;
  display_name: string;
  email: string;
  phone?: string;
  status: number; // 1 = Active, 0 = Suspended
  wallet_balance?: number;
  created_at?: string;
  referral_code?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Edit states
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusVal, setStatusVal] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/customers');
      setCustomers(res.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setStatusVal(c.status);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setSaving(true);
    try {
      await apiClient.put(`/admin/customers/${editingCustomer.id}`, {
        status: statusVal
      });
      showSuccess(`Customer "${editingCustomer.display_name}" updated successfully!`);
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatusDirect = async (c: Customer) => {
    try {
      const nextStatus = c.status === 1 ? 0 : 1;
      await apiClient.put(`/admin/customers/${c.id}`, {
        status: nextStatus
      });
      showSuccess(`Status of "${c.display_name}" updated.`);
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to toggle status');
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-zinc-500 text-sm mt-0.5">View registered app users, manage status, and track referrals.</p>
        </div>
        <button
          onClick={fetchCustomers}
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
            placeholder="Search customers by name, email, phone..."
            className="w-full h-10 pl-9 pr-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
          />
        </div>
      </div>

      {/* Table */}
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
                  <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Customer info</th>
                  <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Contact</th>
                  <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Referral Code</th>
                  <th className="text-right text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Wallet</th>
                  <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center font-bold text-sky-400">
                          {c.display_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-100">{c.display_name}</p>
                          {c.created_at && (
                            <span className="text-[10px] text-zinc-500 block mt-0.5">
                              Joined {new Date(c.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs space-y-1 text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{c.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{c.phone || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-xs font-mono text-zinc-400">
                      {c.referral_code || '—'}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-zinc-200">
                      ₹{(c.wallet_balance ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleStatusDirect(c)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all ${
                          c.status === 1
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        {c.status === 1 ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {c.status === 1 ? 'Active' : 'Suspended'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openEditModal(c)}
                        className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors inline-flex items-center justify-center"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-sm text-zinc-500">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-sky-400" />
                Customer Account Access
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/20 space-y-1">
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Customer Profile</p>
                <p className="text-sm font-bold">{editingCustomer.display_name}</p>
                <p className="text-xs text-zinc-400">{editingCustomer.email}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Account Access</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Suspended / Blocked</option>
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
                  className="flex-1 h-11 bg-primary hover:bg-primary/95 text-zinc-950 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
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
