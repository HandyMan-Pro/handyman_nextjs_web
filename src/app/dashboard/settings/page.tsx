'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { getUserData } from '../../../lib/auth';
import UserProfilePage from '../profile/page';
import {
  Settings, Save, RefreshCw, X, Loader2, Info, HelpCircle,
  Percent, ShieldCheck, Mail, Phone, IndianRupee, Globe
} from 'lucide-react';

interface SystemSettings {
  app_name: string;
  commission_rate: number;
  currency_symbol: string;
  support_email: string;
  support_phone: string;
  min_payout_amount: number;
  tax_percentage: number;
  advance_payment_enabled: boolean;
  advance_payment_percentage: number;
  cancellation_charge_enabled: boolean;
  cancellation_charge_percentage: number;
  cancellation_hours: number;
  master_upi_id: string;
  terms_and_conditions: string;
  contact_email: string;
  contact_phone: string;
}

export default function SettingsPage() {
  const [role, setRole] = useState<'admin' | 'provider' | 'handyman'>('admin');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getUserData();
    if (user?.user_type === 'provider' || user?.user_type === 'handyman') {
      setRole(user.user_type as any);
      setLoading(false);
    } else {
      setRole('admin');
      fetchSettings();
    }
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/settings');
      setSettings(res.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof SystemSettings, val: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [key]: val
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await apiClient.put('/admin/settings', settings);
      setSuccessMsg('System configuration saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchSettings();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save system configurations');
    } finally {
      setSaving(false);
    }
  };

  if (role === 'provider' || role === 'handyman') {
    return <UserProfilePage />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Control pricing, cancellation rules, UPI routing, support, and legal information.</p>
        </div>
        <button
          onClick={fetchSettings}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Settings
        </button>
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

      {settings && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* General settings */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2 text-zinc-200">
              <Globe className="w-5 h-5 text-primary" />
              General Platform Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Application Name</label>
                <input
                  type="text"
                  required
                  value={settings.app_name}
                  onChange={(e) => handleChange('app_name', e.target.value)}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Currency Symbol</label>
                <input
                  type="text"
                  required
                  value={settings.currency_symbol}
                  onChange={(e) => handleChange('currency_symbol', e.target.value)}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Pricing settings */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2 text-zinc-200">
              <IndianRupee className="w-5 h-5 text-primary" />
              Commission, Taxes & Payout Limits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Admin Commission (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={settings.commission_rate}
                  onChange={(e) => handleChange('commission_rate', Number(e.target.value))}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Tax Percentage (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={settings.tax_percentage}
                  onChange={(e) => handleChange('tax_percentage', Number(e.target.value))}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Min Provider Payout (₹)</label>
                <input
                  type="number"
                  required
                  value={settings.min_payout_amount}
                  onChange={(e) => handleChange('min_payout_amount', Number(e.target.value))}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* UPI Routing */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2 text-zinc-200">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Direct UPI Intent Settings
            </h2>
            <div>
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Master UPI ID (VPA)</label>
              <input
                type="text"
                required
                value={settings.master_upi_id}
                onChange={(e) => handleChange('master_upi_id', e.target.value)}
                placeholder="e.g. platformname@ybl"
                className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">All booking payments and top-ups route directly to this UPI address.</span>
            </div>
          </div>

          {/* Prepayment & Cancellations */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2 text-zinc-200">
              <Percent className="w-5 h-5 text-primary" />
              Advance Booking & Cancellation Charge
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Advance Booking */}
              <div className="space-y-3 bg-zinc-850/30 border border-zinc-800 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">Advance Prepayment Required</span>
                  <input
                    type="checkbox"
                    checked={settings.advance_payment_enabled}
                    onChange={(e) => handleChange('advance_payment_enabled', e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 accent-primary"
                  />
                </div>
                {settings.advance_payment_enabled && (
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Prepayment Percentage (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.advance_payment_percentage}
                      onChange={(e) => handleChange('advance_payment_percentage', Number(e.target.value))}
                      className="w-full h-10 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Cancellation */}
              <div className="space-y-3 bg-zinc-850/30 border border-zinc-800 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">Cancellation Charge Enabled</span>
                  <input
                    type="checkbox"
                    checked={settings.cancellation_charge_enabled}
                    onChange={(e) => handleChange('cancellation_charge_enabled', e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 accent-primary"
                  />
                </div>
                {settings.cancellation_charge_enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Charge Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.cancellation_charge_percentage}
                        onChange={(e) => handleChange('cancellation_charge_percentage', Number(e.target.value))}
                        className="w-full h-10 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Buffer Window (hrs)</label>
                      <input
                        type="number"
                        value={settings.cancellation_hours}
                        onChange={(e) => handleChange('cancellation_hours', Number(e.target.value))}
                        className="w-full h-10 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Support Contacts */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2 text-zinc-200">
              <Mail className="w-5 h-5 text-primary" />
              Support & Helpdesk Contact Info
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Support Email</label>
                <input
                  type="email"
                  required
                  value={settings.support_email}
                  onChange={(e) => handleChange('support_email', e.target.value)}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Support Phone Number</label>
                <input
                  type="text"
                  required
                  value={settings.support_phone}
                  onChange={(e) => handleChange('support_phone', e.target.value)}
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Legal / Terms */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2 text-zinc-200">
              <Info className="w-5 h-5 text-primary" />
              Legal & Terms of Conditions
            </h2>
            <div>
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Terms & Conditions</label>
              <textarea
                value={settings.terms_and_conditions}
                onChange={(e) => handleChange('terms_and_conditions', e.target.value)}
                rows={6}
                className="w-full p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="h-11 px-6 bg-primary hover:bg-primary/95 text-zinc-950 font-semibold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/35"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Configuration Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
