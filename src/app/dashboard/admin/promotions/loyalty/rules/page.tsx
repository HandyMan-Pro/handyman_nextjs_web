'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../../lib/apiClient';
import {
  Award, Loader2, AlertCircle, Plus, Save, ToggleLeft, ToggleRight
} from 'lucide-react';

interface LoyaltyRule {
  id: string;
  loyalty_type: 'earn' | 'redeem' | 'referral';
  service_type: string;
  min_amount: number;
  max_amount: number;
  points: number;
  expire_days: number;
  stackable: boolean;
  status: boolean;
}

const swrCache: { [key: string]: any } = {};

function useSimpleSWR<T>(key: string | null, fetcher: (url: string) => Promise<T>) {
  const [data, setData] = useState<T | undefined>(key ? swrCache[key] : undefined);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!data);

  useEffect(() => {
    if (!key) return;
    let active = true;
    setIsLoading(true);
    fetcher(key)
      .then((res) => {
        if (active) {
          swrCache[key] = res;
          setData(res);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err);
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [key, fetcher]);

  return { data, setData, error, isLoading };
}

export default function LoyaltyRulesPage() {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<'earn' | 'redeem' | 'referral'>('earn');
  
  // Rule creation state
  const [showAddForm, setShowAddForm] = useState(false);
  const [serviceType, setServiceType] = useState('All');
  const [minAmount, setMinAmount] = useState<number>(0);
  const [maxAmount, setMaxAmount] = useState<number>(1000);
  const [points, setPoints] = useState<number>(10);
  const [expireDays, setExpireDays] = useState<number>(365);
  const [stackable, setStackable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rulesFetcher = useCallback(async (url: string) => {
    const res = await apiClient.get(url);
    return res.data as LoyaltyRule[];
  }, []);

  const { data: rules = [], setData: setRules, error: fetchError, isLoading } = useSimpleSWR<LoyaltyRule[]>(
    '/admin/promotions/loyalty/rules',
    rulesFetcher
  );

  const filteredRules = useMemo(() => {
    return rules.filter(r => r.loyalty_type === activeSubTab);
  }, [rules, activeSubTab]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await apiClient.post('/admin/promotions/loyalty/rules', {
        loyalty_type: activeSubTab,
        service_type: serviceType,
        min_amount: Number(minAmount),
        max_amount: Number(maxAmount),
        points: Number(points),
        expire_days: Number(expireDays),
        stackable,
        status: true
      });
      
      setRules([...rules, res.data]);
      setShowAddForm(false);
      // Reset form
      setServiceType('All');
      setMinAmount(0);
      setMaxAmount(1000);
      setPoints(10);
      setExpireDays(365);
      setStackable(false);
    } catch (err) {
      alert('Failed to create loyalty rule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { name: 'Promotional Banners', href: '/dashboard/admin/promotions/banners', active: false },
    { name: 'Coupons', href: '/dashboard/admin/promotions/coupons/list', active: false },
    { name: 'Loyalty Rules', href: '/dashboard/admin/promotions/loyalty/rules', active: true },
    { name: 'Loyalty History', href: '/dashboard/admin/promotions/loyalty/history', active: false },
    { name: 'Sliders', href: '/dashboard/admin/promotions/sliders/list', active: false },
  ];

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Award className="w-5.5 h-5.5 text-[#5E5CE6]" />
            Referral & Loyalty points
          </h1>
          <p className="text-zinc-550 text-xs mt-0.5">
            Configure system-wide earn rates, redemption policies, and referral bonuses.
          </p>
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

      {/* Sub tabs layout (Earn / Redeem / Referral) */}
      <div className="flex border-b border-zinc-800/60 pb-1 gap-2">
        <button
          onClick={() => { setActiveSubTab('earn'); setShowAddForm(false); }}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'earn'
              ? 'bg-[#5E5CE6]/10 text-white border border-[#5E5CE6]/20'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Earn Rules
        </button>
        <button
          onClick={() => { setActiveSubTab('redeem'); setShowAddForm(false); }}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'redeem'
              ? 'bg-[#5E5CE6]/10 text-white border border-[#5E5CE6]/20'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Redeem Rules
        </button>
        <button
          onClick={() => { setActiveSubTab('referral'); setShowAddForm(false); }}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'referral'
              ? 'bg-[#5E5CE6]/10 text-white border border-[#5E5CE6]/20'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Referral Rules
        </button>
      </div>

      {/* Rule Creator section */}
      {showAddForm ? (
        <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-md">
          <h3 className="font-bold text-white text-xs mb-4 uppercase tracking-wider">
            Add {activeSubTab === 'earn' ? 'Earning' : activeSubTab === 'redeem' ? 'Redemption' : 'Referral'} Rule
          </h3>
          <form onSubmit={handleCreateRule} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Service Category Type</label>
              <input
                type="text"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg px-3 py-1.5 text-white"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Min booking amount</label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(Number(e.target.value))}
                className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg px-3 py-1.5 text-white"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Max booking amount</label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(Number(e.target.value))}
                className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg px-3 py-1.5 text-white"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Points Value</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg px-3 py-1.5 text-white"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Validity duration (Days)</label>
              <input
                type="number"
                value={expireDays}
                onChange={(e) => setExpireDays(Number(e.target.value))}
                className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg px-3 py-1.5 text-white"
                required
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="stackable-checkbox"
                checked={stackable}
                onChange={(e) => setStackable(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-800 bg-zinc-950"
              />
              <label htmlFor="stackable-checkbox" className="font-bold text-white text-[10px] uppercase cursor-pointer">Stackable Rule</label>
            </div>
            
            <div className="col-span-1 md:col-span-3 flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded border border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 disabled:opacity-50 text-white font-bold"
              >
                <Save className="w-3.5 h-3.5" />
                Save Rule
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>
      )}

      {/* Rules list */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
            <span className="text-xs text-zinc-550">Fetching loyalty rules...</span>
          </div>
        ) : fetchError ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs">Failed to load rules.</span>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No rules set for this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5E5CE6]/90 text-white text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Service Category</th>
                  <th className="py-3 px-4">Booking limits</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4">Expiry</th>
                  <th className="py-3 px-4">Stackable</th>
                  <th className="py-3 px-4 rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-zinc-850/20 transition-colors">
                    <td className="py-4 px-4 font-bold text-white">{rule.service_type}</td>
                    <td className="py-4 px-4 text-zinc-400">
                      ${rule.min_amount} - ${rule.max_amount}
                    </td>
                    <td className="py-4 px-4 font-bold text-green-400">+{rule.points} pts</td>
                    <td className="py-4 px-4 text-zinc-500">{rule.expire_days} Days</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${rule.stackable ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                        {rule.stackable ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {rule.status ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-550 border border-zinc-700">Paused</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
