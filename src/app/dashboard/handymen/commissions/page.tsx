'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/apiClient';
import { HandymenTabs } from '../HandymenTabs';
import {
  Search, Loader2, Plus, X, Trash2
} from 'lucide-react';

interface CommissionRule {
  id: string;
  name: string;
  commission_value: number;
  commission_type: string; // 'Percent' or 'Fixed'
  status: number;
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<CommissionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('No Action');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    commission_value: 0,
    commission_type: 'Percent',
  });

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/provider/handymen/commissions');
      setCommissions(res.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch commissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.commission_value <= 0) {
      alert('Please fill out all fields correctly.');
      return;
    }
    setModalLoading(true);
    setError('');
    try {
      await apiClient.post('/provider/handymen/commissions', {
        name: form.name.trim(),
        commission_value: Number(form.commission_value),
        commission_type: form.commission_type,
      });
      setSuccess('Commission rule created successfully!');
      setIsModalOpen(false);
      setForm({ name: '', commission_value: 0, commission_type: 'Percent' });
      fetchCommissions();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create commission rule');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this commission rule?')) return;
    try {
      await apiClient.delete(`/provider/handymen/commissions/${id}`);
      setSuccess('Commission rule deleted successfully!');
      fetchCommissions();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete commission rule');
    }
  };

  // Bulk Apply Action
  const handleApplyAction = () => {
    if (selectedIds.length === 0) {
      alert('Please select entries to apply action.');
      return;
    }
    if (selectedAction === 'Delete Selected') {
      if (confirm(`Delete ${selectedIds.length} selected commission rules?`)) {
        Promise.all(selectedIds.map(id => apiClient.delete(`/provider/handymen/commissions/${id}`)))
          .then(() => {
            setSuccess('Selected rules deleted successfully.');
            setSelectedIds([]);
            fetchCommissions();
          })
          .catch(err => setError(err.message));
      }
    } else {
      alert(`Action "${selectedAction}" triggered for selected rows.`);
    }
  };

  // Search logic
  const filtered = commissions.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      setSelectedIds(currentEntries.map(c => c.id));
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
          <h1 className="text-2xl font-bold tracking-tight text-white">Handyman Commission Rules</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Configure default and custom job commission rates for your handyman team.
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 h-10 px-5 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20 text-sm"
          >
            <Plus className="w-4 h-4" />
            + New
          </button>
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
            <option>Delete Selected</option>
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
          <table className="w-full min-w-[700px] border-collapse">
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
                <th className="text-[11px] font-bold text-white uppercase tracking-wider px-6 py-4">Commission</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-[11px] font-bold text-white uppercase tracking-wider px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-sm text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#5E5CE6]" />
                    Loading commission settings...
                  </td>
                </tr>
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-sm text-zinc-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                currentEntries.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/25 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => toggleSelectOne(c.id)}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-[#5E5CE6] focus:ring-0 focus:ring-offset-0"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      {c.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300 font-medium">
                      {c.commission_type === 'Percent' ? `${c.commission_value}%` : `$${c.commission_value.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4">
                      {c.status !== undefined ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800/50">
                          Active
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {c.id ? (
                        <button
                          onClick={() => handleDelete(c.id)}
                          title="Delete Rule"
                          className="w-7 h-7 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 transition-colors inline-flex items-center justify-center border border-red-900/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
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

      {/* Create Commission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Create Commission Rule</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Rule Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Freelance Team Rate"
                  className="w-full h-10 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#5E5CE6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.commission_value || ''}
                    onChange={(e) => setForm({ ...form, commission_value: Number(e.target.value) })}
                    placeholder="10"
                    className="w-full h-10 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#5E5CE6]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Type</label>
                  <select
                    value={form.commission_type}
                    onChange={(e) => setForm({ ...form, commission_type: e.target.value })}
                    className="w-full h-10 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#5E5CE6]"
                  >
                    <option value="Percent">Percent (%)</option>
                    <option value="Fixed">Fixed ($)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 h-10 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {modalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
