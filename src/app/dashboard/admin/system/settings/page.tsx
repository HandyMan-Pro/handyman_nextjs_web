'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../lib/apiClient';
import {
  Settings, Loader2, AlertCircle, Save, ShieldCheck
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Settings State
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [supportEmail, setSupportEmail] = useState('support@handymanpro.com');
  const [paymentGatewayMode, setPaymentGatewayMode] = useState('sandbox');
  const [smsGatewayProvider, setSmsGatewayProvider] = useState('twilio');

  useEffect(() => {
    setIsLoading(true);
    apiClient.get('/admin/system/settings')
      .then((res) => {
        if (res.data) {
          setCommissionRate(res.data.commission_rate ?? 10);
          setSupportEmail(res.data.support_email ?? 'support@handymanpro.com');
          setPaymentGatewayMode(res.data.payment_gateway_mode ?? 'sandbox');
          setSmsGatewayProvider(res.data.sms_gateway_provider ?? 'twilio');
        }
        setFetchError(null);
      })
      .catch((err) => {
        console.error('Error fetching global settings:', err);
        setFetchError('Failed to fetch global application settings.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.put('/admin/system/settings', {
        commission_rate: commissionRate,
        support_email: supportEmail,
        payment_gateway_mode: paymentGatewayMode,
        sms_gateway_provider: smsGatewayProvider
      });
      alert('Global configuration settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { name: 'Help Desk', href: '/dashboard/admin/system/helpdesk', active: false },
    { name: 'CMS Pages', href: '/dashboard/admin/system/pages', active: false },
    { name: 'Plans', href: '/dashboard/admin/system/plans', active: false },
    { name: 'Taxes', href: '/dashboard/admin/system/taxes', active: false },
    { name: 'KYC Documents', href: '/dashboard/admin/system/documents', active: false },
    { name: 'Blogs', href: '/dashboard/admin/system/blogs', active: false },
    { name: 'Templates', href: '/dashboard/admin/system/templates', active: false },
    { name: 'Settings', href: '/dashboard/admin/system/settings', active: true },
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

      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
          <span className="text-xs text-zinc-500">Loading global settings...</span>
        </div>
      ) : fetchError ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3 text-red-400">
          <AlertCircle className="w-8 h-8" />
          <span className="text-xs">{fetchError}</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="max-w-2xl bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-6 space-y-6 backdrop-blur-md">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#5E5CE6]" />
              Global Settings Configuration
            </h3>
          </div>

          <div className="space-y-4">
            {/* Commission Rate */}
            <div>
              <label className="text-[10px] text-zinc-450 uppercase font-black tracking-wider block mb-1">
                Admin Commission Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                className="w-full max-w-xs bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5E5CE6] transition-colors"
                required
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Percentage cut taken by the platform on completed bookings.
              </p>
            </div>

            {/* Support Contact Email */}
            <div>
              <label className="text-[10px] text-zinc-455 uppercase font-black tracking-wider block mb-1">
                Support Escalation Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5E5CE6] transition-colors"
                required
              />
            </div>

            {/* Payment Gateway Mode */}
            <div>
              <label className="text-[10px] text-zinc-455 uppercase font-black tracking-wider block mb-1">
                Payment Gateway Mode
              </label>
              <select
                value={paymentGatewayMode}
                onChange={(e) => setPaymentGatewayMode(e.target.value)}
                className="w-full max-w-xs bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5E5CE6] transition-colors"
              >
                <option value="sandbox">Sandbox / Testing Mode</option>
                <option value="production">Live / Production Mode</option>
              </select>
            </div>

            {/* SMS Provider */}
            <div>
              <label className="text-[10px] text-zinc-455 uppercase font-black tracking-wider block mb-1">
                SMS Gateway Provider
              </label>
              <select
                value={smsGatewayProvider}
                onChange={(e) => setSmsGatewayProvider(e.target.value)}
                className="w-full max-w-xs bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5E5CE6] transition-colors"
              >
                <option value="twilio">Twilio SMS Gateway</option>
                <option value="vonage">Vonage (Nexmo)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-[#5E5CE6]/20"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save Configuration
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
