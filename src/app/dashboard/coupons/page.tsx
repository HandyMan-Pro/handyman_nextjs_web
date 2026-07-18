'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import {
  Tag, Percent, Plus, Edit2, Trash2, Search, X, Check,
  AlertTriangle, RefreshCw, Loader2, Calendar, DollarSign
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
  expiry_date?: string;
  usage_limit?: number;
  used_count?: number;
  status: number; // 1 = Active, 0 = Inactive
  created_at?: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Add/Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [expiry, setExpiry] = useState('');
  const [limit, setLimit] = useState('');
  const [statusVal, setStatusVal] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/coupons');
      setCoupons(res.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const openAddModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percent');
    setDiscountValue('');
    setMinOrder('0');
    setMaxDiscount('');
    setExpiry('');
    setLimit('');
    setStatusVal(1);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discount_type);
    setDiscountValue(String(c.discount_value));
    setMinOrder(String(c.min_order_amount));
    setMaxDiscount(c.max_discount ? String(c.max_discount) : '');
    setExpiry(c.expiry_date ? c.expiry_date.split('T')[0] : '');
    setLimit(c.usage_limit ? String(c.usage_limit) : '');
    setStatusVal(c.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      code: code.toUpperCase().trim(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_order_amount: Number(minOrder || 0),
      max_discount: maxDiscount ? Number(maxDiscount) : undefined,
      expiry_date: expiry ? `${expiry}T23:59:59` : undefined,
      usage_limit: limit ? Number(limit) : undefined,
      status: statusVal
    };

    try {
      if (editingCoupon) {
        await apiClient.put(`/admin/coupons/${editingCoupon.id}`, payload);
        showSuccess(`Coupon "${code}" updated successfully!`);
      } else {
        await apiClient.post('/admin/coupons', payload);
        showSuccess(`Coupon "${code}" created successfully!`);
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await apiClient.delete(`/admin/coupons/${id}`);
      showSuccess('Coupon deleted successfully.');
      fetchCoupons();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete coupon');
    }
  };

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons & Offers</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Manage promotional codes, flat/percent discounts, and expiry limits.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCoupons}
            className="flex items-center justify-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 h-10 px-4 bg-primary hover:bg-primary/95 text-zinc-950 font-semibold rounded-xl text-xs shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Coupon
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm flex justify-between items-center">
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
            placeholder="Search coupons by code..."
            className="w-full h-10 pl-9 pr-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
          />
        </div>
      </div>

      {/* Coupon Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-zinc-900/50 border border-zinc-800/30 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((c) => (
            <div key={c.id} className="bg-zinc-900/60 border border-zinc-800/50 hover:bg-zinc-900/90 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between gap-4 relative overflow-hidden">
              {/* Corner decorative tag */}
              <div className="absolute top-0 right-0 bg-primary/10 text-primary border-b border-l border-zinc-800 px-3 py-1 rounded-bl-xl text-[10px] font-bold tracking-wider uppercase">
                {c.discount_type === 'percent' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
              </div>

              <div>
                <h3 className="font-mono text-lg font-extrabold tracking-wide text-zinc-100 flex items-center gap-1.5 mt-1">
                  <Tag className="w-4 h-4 text-primary shrink-0" />
                  {c.code}
                </h3>
                <div className="space-y-1.5 mt-3 text-xs text-zinc-400">
                  <p>Min. Order: <strong className="text-zinc-200">₹{c.min_order_amount}</strong></p>
                  {c.max_discount && <p>Max Discount: <strong className="text-zinc-200">₹{c.max_discount}</strong></p>}
                  {c.expiry_date && (
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      Expires: {new Date(c.expiry_date).toLocaleDateString()}
                    </p>
                  )}
                  <p>Usage: <strong className="text-zinc-200">{c.used_count || 0} / {c.usage_limit || '∞'}</strong></p>
                </div>
              </div>

              <div className="border-t border-zinc-800/40 pt-3 flex items-center justify-between gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  c.status === 1 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-850 text-zinc-500 border-zinc-800'
                }`}>
                  {c.status === 1 ? 'Active' : 'Disabled'}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(c)}
                    className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="w-7 h-7 rounded-lg bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredCoupons.length === 0 && (
            <div className="col-span-full text-center py-16 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl">
              <Tag className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No coupon codes currently active.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                {editingCoupon ? 'Modify Offer Coupon' : 'Create Promotional Coupon'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FESTIVE50"
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm font-mono text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Cash (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Discount Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Min Order Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    placeholder="0"
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Max Cash Limit (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Expiry Date</label>
                  <input
                    type="date"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-150 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    placeholder="Unlimited"
                    className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Coupon Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Disabled</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-11 bg-primary hover:bg-primary/95 text-zinc-950 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
