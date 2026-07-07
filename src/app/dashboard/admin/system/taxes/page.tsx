'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../lib/apiClient';
import {
  Percent, Plus, Loader2, AlertCircle, Edit3, Trash2, ShieldCheck
} from 'lucide-react';

interface TaxRule {
  id: string;
  title: string;
  value: number;
  type: string; // "percent" | "flat"
  status: boolean;
}

export default function TaxesPage() {
  const router = useRouter();
  const [taxes, setTaxes] = useState<TaxRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTaxId, setEditingTaxId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState<number>(0);
  const [type, setType] = useState('percent');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTaxes = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/admin/system/taxes');
      setTaxes(res.data || []);
      setFetchError(null);
    } catch (err) {
      console.error(err);
      setFetchError('Failed to fetch tax rules.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const handleToggleStatus = async (taxId: string) => {
    try {
      const res = await apiClient.put(`/admin/system/taxes/${taxId}/toggle`);
      setTaxes(prev =>
        prev.map(t => (t.id === taxId ? { ...t, status: res.data.status } : t))
      );
    } catch (err) {
      console.error('Failed to toggle tax status:', err);
    }
  };

  const handleDeleteTax = async (taxId: string) => {
    if (!confirm('Are you sure you want to delete this tax rule?')) return;
    try {
      await apiClient.delete(`/admin/system/taxes/${taxId}`);
      setTaxes(prev => prev.filter(t => t.id !== taxId));
    } catch (err) {
      console.error('Failed to delete tax:', err);
    }
  };

  const handleEditClick = (tax: TaxRule) => {
    setEditingTaxId(tax.id);
    setTitle(tax.title);
    setValue(tax.value);
    setType(tax.type);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || value < 0) return;
    setIsSubmitting(true);

    const payload = { title, value, type };

    try {
      if (editingTaxId) {
        const res = await apiClient.put(`/admin/system/taxes/${editingTaxId}`, payload);
        setTaxes(prev => prev.map(t => (t.id === editingTaxId ? res.data : t)));
      } else {
        const res = await apiClient.post('/admin/system/taxes', payload);
        setTaxes(prev => [...prev, res.data]);
      }
      // reset form
      setTitle('');
      setValue(0);
      setType('percent');
      setEditingTaxId(null);
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to save tax rule:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { name: 'Help Desk', href: '/dashboard/admin/system/helpdesk', active: false },
    { name: 'CMS Pages', href: '/dashboard/admin/system/pages', active: false },
    { name: 'Plans', href: '/dashboard/admin/system/plans', active: false },
    { name: 'Taxes', href: '/dashboard/admin/system/taxes', active: true },
    { name: 'KYC Documents', href: '/dashboard/admin/system/documents', active: false },
    { name: 'Blogs', href: '/dashboard/admin/system/blogs', active: false },
    { name: 'Templates', href: '/dashboard/admin/system/templates', active: false },
    { name: 'Settings', href: '/dashboard/admin/system/settings', active: false },
    { name: 'Push Notifications', href: '/dashboard/admin/system/push-notifications', active: false },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#09090b] min-h-screen text-zinc-100">
      {/* Header section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#5E5CE6]" />
              SYSTEM MANAGEMENT
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Configure global application parameters, CMS pages, support, plans, and notifications.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingTaxId(null);
              setTitle('');
              setValue(0);
              setType('percent');
              setShowAddForm(!showAddForm);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white text-xs font-bold transition-all shadow-md shadow-[#5E5CE6]/20"
          >
            <Plus className="w-4 h-4" />
            Add Tax Rule
          </button>
        </div>

        {/* Tab Row */}
        <div className="flex border-b border-zinc-800/80 overflow-x-auto whitespace-nowrap scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.name}
              onClick={() => router.push(t.href)}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
                t.active
                  ? 'border-[#5E5CE6] text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-xl max-w-md space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {editingTaxId ? 'Edit Tax Rule' : 'Create Tax Rule'}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 font-bold block mb-1">Tax Title / Label</label>
              <input
                type="text"
                placeholder="e.g. Service VAT"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-[#5E5CE6]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold block mb-1">Tax Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5E5CE6]"
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat Rate ($)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold block mb-1">Rate Value</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 15"
                  value={value}
                  onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5E5CE6]"
                  required
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingTaxId(null);
              }}
              className="px-3 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] font-bold text-zinc-400 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 disabled:opacity-50 text-[10px] font-bold text-white rounded"
            >
              {isSubmitting ? 'Saving...' : 'Save Tax Rule'}
            </button>
          </div>
        </form>
      )}

      {/* Taxes List Table */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
            <span className="text-xs text-zinc-500">Loading tax rules...</span>
          </div>
        ) : fetchError ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs">{fetchError}</span>
          </div>
        ) : taxes.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No tax rules configured. Create one above to get started.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#5E5CE6]/90 text-[11px] font-bold text-white uppercase tracking-wider">
                <th className="py-3 px-4 rounded-tl-xl">Tax Title</th>
                <th className="py-3 px-4">Rate Value</th>
                <th className="py-3 px-4">Calculation Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-tr-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-xs">
              {taxes.map((tax) => (
                <tr key={tax.id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="py-4 px-4 font-bold text-zinc-200">{tax.title}</td>
                  <td className="py-4 px-4 font-bold text-white">
                    {tax.type === 'percent' ? `${tax.value}%` : `$${tax.value.toFixed(2)}`}
                  </td>
                  <td className="py-4 px-4 capitalize text-zinc-400 font-semibold tracking-wider text-[10px]">
                    {tax.type === 'percent' ? 'Percentage-based' : 'Flat-rate value'}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleStatus(tax.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        tax.status
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                      }`}
                    >
                      {tax.status ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleEditClick(tax)}
                      className="px-2 py-1 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 rounded text-[10px] text-zinc-300 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTax(tax.id)}
                      className="px-2 py-1 bg-red-950/40 hover:bg-red-950/60 border border-red-900/50 rounded text-[10px] text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
