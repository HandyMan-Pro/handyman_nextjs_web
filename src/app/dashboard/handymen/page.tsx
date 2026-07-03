'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { getUserData } from '../../../lib/auth';
import {
  Wrench, CheckCircle, XCircle, Search, Mail, Phone,
  Star, RefreshCw, X, Loader2, Edit, Plus, UserPlus,
  Shield, Activity, Check, AlertCircle, Trash2, ShieldAlert
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
  is_available?: number; // 1 = Available, 0 = Offline/Unavailable
  designation?: string;
  created_at?: string;
}

export default function HandymenPage() {
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [role, setRole] = useState<'admin' | 'provider' | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Filtering
  const [searchQuery, setSearchQuery] = useState('');

  // Add Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFirstName, setAddFirstName] = useState('');
  const [addLastName, setAddLastName] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addDesignation, setAddDesignation] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit / Details Modal States
  const [editingHandyman, setEditingHandyman] = useState<Handyman | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<number>(1);
  const [editIsAvailable, setEditIsAvailable] = useState<number>(1);
  const [editVerified, setEditVerified] = useState<boolean>(false);
  const [editDesignation, setEditDesignation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getUserData();
    setCurrentUser(user);
    fetchHandymen();
  }, []);

  const fetchHandymen = async () => {
    setLoading(true);
    try {
      const user = getUserData();
      const userRole = (user?.user_type === 'provider' ? 'provider' : 'admin') as 'admin' | 'provider';
      setRole(userRole);

      let url = '/providers';
      if (userRole === 'provider') {
        url = `/providers?provider_id=${user?.id}`;
      }
      const res = await apiClient.get(url);
      
      let list = res.data || [];
      if (userRole === 'admin') {
        // Admin views all handymen
        list = list.filter((u: Handyman) => u.user_type === 'handyman');
      }
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

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFirstName.trim() || !addLastName.trim() || !addEmail.trim() || !addPassword.trim() || !addUsername.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setAdding(true);
    setError('');
    try {
      const providerId = currentUser?.id;
      const payload = {
        username: addUsername.trim(),
        email: addEmail.trim(),
        first_name: addFirstName.trim(),
        last_name: addLastName.trim(),
        password: addPassword,
        user_type: 'handyman',
        contact_number: addPhone.trim(),
        provider_id: providerId,
        designation: addDesignation.trim() || 'Handyman',
        status: 1,
        is_available: 1
      };

      await apiClient.post('/register', payload);
      showSuccess(`Handyman "${addFirstName} ${addLastName}" added successfully!`);
      setIsAddModalOpen(false);
      
      // Reset form
      setAddFirstName('');
      setAddLastName('');
      setAddUsername('');
      setAddEmail('');
      setAddPhone('');
      setAddPassword('');
      setAddDesignation('');

      fetchHandymen();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add handyman');
    } finally {
      setAdding(false);
    }
  };

  const openEditModal = (h: Handyman) => {
    setEditingHandyman(h);
    setEditStatus(h.status);
    setEditIsAvailable(h.is_available ?? 1);
    setEditVerified(h.is_verified ?? false);
    setEditDesignation(h.designation || '');
    setEditPhone(h.phone || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHandyman) return;

    setSaving(true);
    setError('');
    try {
      const payload: any = {
        status: editStatus,
        is_available: editIsAvailable,
        designation: editDesignation,
        phone: editPhone,
        contact_number: editPhone
      };

      // Admin can verify/unverify
      if (role === 'admin') {
        payload.is_verified = editVerified;
      }

      await apiClient.put(`/providers/${editingHandyman.id}`, payload);
      showSuccess(`Handyman "${editingHandyman.display_name}" updated successfully!`);
      setIsEditModalOpen(false);
      fetchHandymen();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update handyman');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHandyman = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete handyman "${name}"? This action cannot be undone.`)) return;

    try {
      await apiClient.delete(`/providers/${id}`);
      showSuccess(`Handyman "${name}" removed successfully!`);
      fetchHandymen();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete handyman');
    }
  };

  const filteredHandymen = handymen.filter(h =>
    h.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.designation || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {role === 'provider' ? 'My Handymen' : 'Handymen Management'}
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {role === 'provider'
              ? 'Manage your handyman staff, toggle availability, track designations, and view performance.'
              : 'Admin panel to view all handymen across the platform, manage verification, and control access.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchHandymen}
            className="flex items-center justify-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          {role === 'provider' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 h-10 px-4 bg-primary hover:bg-primary/95 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary/20"
            >
              <UserPlus className="w-4 h-4" />
              Add Handyman
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Controls */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800/60 pb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search handymen by name, email, designation..."
            className="w-full h-10 pl-9 pr-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
          />
        </div>
      </div>

      {/* Main Grid or Table */}
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
                  <th className="text-center text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Availability Status</th>
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
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-zinc-100">{h.display_name}</p>
                            <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                              {h.designation || 'Handyman'}
                            </span>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.25 rounded text-[10px] font-medium mt-1.5 ${
                            h.status === 1 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {h.status === 1 ? 'Active Access' : 'Suspended Access'}
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
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        h.is_available === 1
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700/30'
                      }`}>
                        <Activity className="w-3.5 h-3.5" />
                        {h.is_available === 1 ? 'Online & Free' : 'Offline / Busy'}
                      </span>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(h)}
                          title="Edit Handyman"
                          className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors inline-flex items-center justify-center"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {role === 'provider' && (
                          <button
                            onClick={() => handleDeleteHandyman(h.id, h.display_name)}
                            title="Delete Handyman"
                            className="w-8 h-8 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 transition-colors inline-flex items-center justify-center border border-red-900/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredHandymen.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-sm text-zinc-500">
                      No handymen staff listed. Click &quot;Add Handyman&quot; to onboard staff.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Handyman Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Onboard New Handyman Staff
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">First Name *</label>
                  <input
                    type="text"
                    required
                    value={addFirstName}
                    onChange={(e) => setAddFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={addLastName}
                    onChange={(e) => setAddLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Username *</label>
                <input
                  type="text"
                  required
                  value={addUsername}
                  onChange={(e) => setAddUsername(e.target.value)}
                  placeholder="johndoe123"
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Email Address *</label>
                <input
                  type="email"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Phone Number</label>
                  <input
                    type="tel"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Designation</label>
                  <input
                    type="text"
                    value={addDesignation}
                    onChange={(e) => setAddDesignation(e.target.value)}
                    placeholder="Electrician / Plumber"
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Login Password *</label>
                <input
                  type="password"
                  required
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 h-11 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {adding && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Handyman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Handyman Modal */}
      {isEditModalOpen && editingHandyman && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-500" />
                Configure Handyman Settings
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/20 space-y-1">
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Handyman Account</p>
                <p className="text-sm font-bold text-zinc-100">{editingHandyman.display_name}</p>
                <p className="text-xs text-zinc-400">{editingHandyman.email}</p>
              </div>

              {role === 'admin' ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Verification Status</label>
                    <select
                      value={editVerified ? 'yes' : 'no'}
                      onChange={(e) => setEditVerified(e.target.value === 'yes')}
                      className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    >
                      <option value="yes">Verified</option>
                      <option value="no">Pending Verification</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Account Access</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(Number(e.target.value))}
                      className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Suspended / Inactive</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Designation</label>
                    <input
                      type="text"
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 tracking-wider mb-1 block">CONTACT PHONE</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Availability Status</label>
                    <select
                      value={editIsAvailable}
                      onChange={(e) => setEditIsAvailable(Number(e.target.value))}
                      className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    >
                      <option value={1}>Online & Free</option>
                      <option value={0}>Offline / Busy</option>
                    </select>
                  </div>
                </>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
