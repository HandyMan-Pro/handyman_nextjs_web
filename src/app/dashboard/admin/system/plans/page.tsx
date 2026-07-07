'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../lib/apiClient';
import {
  CreditCard, Plus, Loader2, AlertCircle, Edit3, Trash2, ShieldCheck, Check
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  title: string;
  type: string;
  level: string;
  amount: number;
  status: boolean;
}

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('monthly');
  const [level, setLevel] = useState('basic');
  const [amount, setAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/admin/system/plans');
      setPlans(res.data || []);
      setFetchError(null);
    } catch (err) {
      console.error(err);
      setFetchError('Failed to fetch plans.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleToggleStatus = async (planId: string) => {
    try {
      const res = await apiClient.put(`/admin/system/plans/${planId}/toggle`);
      setPlans(prev =>
        prev.map(p => (p.id === planId ? { ...p, status: res.data.status } : p))
      );
    } catch (err) {
      console.error('Failed to toggle plan status:', err);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this subscription plan?')) return;
    try {
      await apiClient.delete(`/admin/system/plans/${planId}`);
      setPlans(prev => prev.filter(p => p.id !== planId));
    } catch (err) {
      console.error('Failed to delete plan:', err);
    }
  };

  const handleEditClick = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setTitle(plan.title);
    setType(plan.type);
    setLevel(plan.level);
    setAmount(plan.amount);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount < 0) return;
    setIsSubmitting(true);

    const payload = { title, type, level, amount };

    try {
      if (editingPlanId) {
        const res = await apiClient.put(`/admin/system/plans/${editingPlanId}`, payload);
        setPlans(prev => prev.map(p => (p.id === editingPlanId ? res.data : p)));
      } else {
        const res = await apiClient.post('/admin/system/plans', payload);
        setPlans(prev => [...prev, res.data]);
      }
      // reset form
      setTitle('');
      setType('monthly');
      setLevel('basic');
      setAmount(0);
      setEditingPlanId(null);
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to save plan:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { name: 'Help Desk', href: '/dashboard/admin/system/helpdesk', active: false },
    { name: 'CMS Pages', href: '/dashboard/admin/system/pages', active: false },
    { name: 'Plans', href: '/dashboard/admin/system/plans', active: true },
    { name: 'Taxes', href: '/dashboard/admin/system/taxes', active: false },
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
              setEditingPlanId(null);
              setTitle('');
              setType('monthly');
              setLevel('basic');
              setAmount(0);
              setShowAddForm(!showAddForm);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white text-xs font-bold transition-all shadow-md shadow-[#5E5CE6]/20"
          >
            <Plus className="w-4 h-4" />
            Add Subscription Plan
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
            {editingPlanId ? 'Edit Plan' : 'Create Subscription Plan'}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 font-bold block mb-1">Plan Title</label>
              <input
                type="text"
                placeholder="e.g. Standard Handyman Monthly"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-[#5E5CE6]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold block mb-1">Billing Interval</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5E5CE6]"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold block mb-1">Level Tier</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5E5CE6]"
                >
                  <option value="basic">Basic Tier</option>
                  <option value="premium">Premium Tier</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold block mb-1">Amount (USD)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 19.99"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5E5CE6]"
                required
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingPlanId(null);
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
              {isSubmitting ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </form>
      )}

      {/* Plans List Table */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
            <span className="text-xs text-zinc-500">Loading plans...</span>
          </div>
        ) : fetchError ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs">{fetchError}</span>
          </div>
        ) : plans.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No subscription plans found. Create one above to get started.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#5E5CE6]/90 text-[11px] font-bold text-white uppercase tracking-wider">
                <th className="py-3 px-4 rounded-tl-xl">Plan Title</th>
                <th className="py-3 px-4">Billing Cycle</th>
                <th className="py-3 px-4">Tier Level</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-tr-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-xs">
              {plans.map((plan) => (
                <tr key={plan.id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="py-4 px-4 font-bold text-zinc-200">{plan.title}</td>
                  <td className="py-4 px-4 uppercase text-zinc-400 font-semibold tracking-wider text-[10px]">{plan.type}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      plan.level === 'premium' 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                        : 'bg-zinc-850 text-zinc-400 border border-zinc-800'
                    }`}>
                      {plan.level}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-white">${plan.amount.toFixed(2)}</td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleStatus(plan.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        plan.status
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                      }`}
                    >
                      {plan.status ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleEditClick(plan)}
                      className="px-2 py-1 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 rounded text-[10px] text-zinc-300 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
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
