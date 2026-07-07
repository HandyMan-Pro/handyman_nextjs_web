'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../../lib/apiClient';
import {
  Tag, ArrowLeft, Loader2, Save, Calendar, Check
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
}

export default function AddCouponPage() {
  const router = useRouter();
  
  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discount, setDiscount] = useState<number>(10);
  const [expireDate, setExpireDate] = useState('');
  const [serviceId, setServiceId] = useState<string>('');
  
  // UI states
  const [services, setServices] = useState<Service[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Services for linkage dropdown
  useEffect(() => {
    apiClient.get('/admin/services')
      .then(res => {
        if (Array.isArray(res.data)) {
          setServices(res.data.map((s: any) => ({
            id: s.id || s._id,
            name: s.name
          })));
        }
      })
      .catch(() => {
        // Silent catch fallback
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMessage('Coupon Code is required.');
      return;
    }
    if (discount <= 0) {
      setErrorMessage('Discount must be a positive number.');
      return;
    }
    if (!expireDate) {
      setErrorMessage('Expiration date is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await apiClient.post('/admin/promotions/coupons', {
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        discount: Number(discount),
        expire_date: new Date(expireDate).toISOString(),
        service_id: serviceId || null,
        status: true
      });
      router.push('/dashboard/admin/promotions/coupons/list');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to create coupon. Code might already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-zinc-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/dashboard/admin/promotions/coupons/list')}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#5E5CE6]" />
              Create Coupon
            </h1>
            <p className="text-zinc-550 text-[10px]">
              Add a new promotional coupon code to apply system-wide or to a specific service.
            </p>
          </div>
        </div>
      </div>

      {/* Main glassmorphic card */}
      <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-400 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Coupon Code Input */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-white uppercase tracking-wider text-[10px]">Coupon Code (Uppercase)</label>
            <input
              type="text"
              placeholder="e.g. SUMMER50"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg px-4 py-2 text-xs text-white placeholder-zinc-550 focus:outline-none focus:border-[#5E5CE6] transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Discount Type */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-white uppercase tracking-wider text-[10px]">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5E5CE6] transition-colors"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-white uppercase tracking-wider text-[10px]">Discount Value</label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-[#5E5CE6] transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expiry Date */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-white uppercase tracking-wider text-[10px]">Expiration Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={expireDate}
                  onChange={(e) => setExpireDate(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-zinc-800/60 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-[#5E5CE6] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Linked Service */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-white uppercase tracking-wider text-[10px]">Link to Specific Service (Optional)</label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5E5CE6] transition-colors"
              >
                <option value="">Apply System-Wide (All Services)</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/60 mt-6">
            <button
              type="button"
              onClick={() => router.push('/dashboard/admin/promotions/coupons/list')}
              className="px-4 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 disabled:opacity-50 text-white font-bold transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Coupon
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
