'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/apiClient';
import {
  Package, Plus, Edit2, Trash2, HelpCircle, Search,
  X, Loader2, AlertCircle, CheckCircle, User
} from 'lucide-react';

interface CatalogItem {
  id: string;
  provider_id: string;
  name: string;
  description?: string;
  type: string;
  price_type: string;
  price: number;
  included_services: string[];
  status: number; // 1: Active, 0: Inactive
  created_at: string;
  updated_at: string;
}

export default function PackagesPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Table Selection & Filters
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [entriesCount, setEntriesCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState(0.0);
  const [formIncludedServicesStr, setFormIncludedServicesStr] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/provider/catalog/package');
      setItems(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch packages.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setFormName('');
    setFormDesc('');
    setFormPrice(0.0);
    setFormIncludedServicesStr('');
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Package name is required.');
      return;
    }
    
    const includedServices = formIncludedServicesStr
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    if (includedServices.length < 2) {
      setFormError('A service package must include at least 2 service IDs.');
      return;
    }

    setFormSaving(true);
    const payload = {
      name: formName.trim(),
      description: formDesc.trim() || undefined,
      type: 'package',
      price_type: 'Fixed',
      price: Number(formPrice),
      included_services: includedServices,
      status: 1
    };

    try {
      await apiClient.post('/provider/catalog/', payload);
      setSuccess('Package created successfully!');
      setModalOpen(false);
      fetchItems();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || err.message || 'Failed to save package.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleToggleStatus = async (item: CatalogItem) => {
    const newStatus = item.status === 1 ? 0 : 1;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));

    try {
      await apiClient.put(`/provider/catalog/${item.id}/status`, { status: newStatus });
      setSuccess('Package status updated successfully!');
    } catch (err: any) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: item.status } : i));
      setError(err.response?.data?.detail || err.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this package?')) {
      return;
    }

    try {
      await apiClient.delete(`/provider/catalog/${itemId}`);
      setSuccess('Package deleted successfully.');
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete package.');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.status === 1) ||
      (statusFilter === 'inactive' && item.status === 0);

    return matchesSearch && matchesStatus;
  });

  const totalEntries = filteredItems.length;
  const totalPages = Math.ceil(totalEntries / entriesCount) || 1;
  const paginatedItems = filteredItems.slice((currentPage - 1) * entriesCount, currentPage * entriesCount);

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Package className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Packages
          </h1>
          <p className="text-zinc-550 text-xs mt-0.5">
            Manage bundled service packages offered to customers.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="h-9 px-4 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs shadow-md shadow-[#5E5CE6]/10"
        >
          <Plus className="w-4 h-4" />
          New
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
              <tr className="bg-[#5E5CE6]/90 border-b border-zinc-850">
                <th className="py-3 px-4 text-left w-12">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredItems.length > 0 && selectedIds.length === filteredItems.length}
                    className="accent-[#5E5CE6]"
                  />
                </th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white uppercase tracking-wider">
                  Provider
                </th>
                <th className="py-3 px-4 text-left text-[11px] font-bold text-white uppercase tracking-wider">
                  Price
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
                    <td className="py-4 px-4"><div className="h-4 bg-zinc-800 rounded w-4" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-zinc-800 rounded w-28" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-zinc-800 rounded w-32" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-zinc-800 rounded w-16" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-zinc-800 rounded w-10" /></td>
                    <td className="py-4 px-4 text-right"><div className="h-4 bg-zinc-800 rounded w-12 ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-zinc-550">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedItems.map(item => (
                  <tr key={item.id} className="border-b border-zinc-850 hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                        className="accent-[#5E5CE6]"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>
                        <p>{item.name}</p>
                        <p className="text-[10px] text-zinc-550 mt-0.5">
                          Includes {item.included_services.length} services
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-850">
                          <User className="w-3.5 h-3.5 text-zinc-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-300">Test Provider</p>
                          <p className="text-[10px] text-zinc-550">test.provider@handyman.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-white">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 focus:outline-none ${
                          item.status === 1 ? 'bg-[#5E5CE6]' : 'bg-zinc-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                          item.status === 1 ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 hover:text-blue-400 text-zinc-500 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 hover:text-rose-500 text-zinc-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1 hover:text-zinc-300 text-zinc-550 transition-colors">
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1c1c1e] border border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-zinc-300">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-850 bg-[#121214]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4.5 h-4.5 text-[#5E5CE6]" />
                Create Bundle Package
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-white w-7 h-7 rounded-full hover:bg-zinc-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-4">
              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-2.5 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                  Package Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Living Room Cleaning Combo"
                  className="w-full h-10 px-3 bg-[#2c2c2e] border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                  Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-[#2c2c2e] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                  Included Service IDs * (Comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={formIncludedServicesStr}
                  onChange={(e) => setFormIncludedServicesStr(e.target.value)}
                  placeholder="e.g. 60d5ec48f..., 60d5ec49f..."
                  className="w-full h-10 px-3 bg-[#2c2c2e] border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-650 focus:outline-none"
                />
                <span className="text-[10px] text-zinc-550 block mt-1">
                  Enter at least 2 MongoDB Object IDs of your single services.
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Package description..."
                  className="w-full p-3 bg-[#2c2c2e] border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-850 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-9 px-4 border border-zinc-800 text-zinc-450 hover:text-white font-bold text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="h-9 px-5 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  {formSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
