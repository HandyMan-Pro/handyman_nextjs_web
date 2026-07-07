'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../lib/apiClient';
import {
  Send, Loader2, AlertCircle, ShieldCheck, BellRing
} from 'lucide-react';

export default function PushNotificationsPage() {
  const router = useRouter();
  const [recipientType, setRecipientType] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setIsSending(true);

    try {
      await apiClient.post('/admin/system/push-notifications', {
        recipient_type: recipientType,
        title,
        message
      });
      alert('Push notification broadcast dispatched successfully!');
      setTitle('');
      setMessage('');
    } catch (err) {
      console.error('Error sending broadcast:', err);
      alert('Failed to send broadcast. Please check backend logs.');
    } finally {
      setIsSending(false);
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
    { name: 'Settings', href: '/dashboard/admin/system/settings', active: false },
    { name: 'Push Notifications', href: '/dashboard/admin/system/push-notifications', active: true },
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

      {/* Broadcaster form */}
      <form onSubmit={handleBroadcast} className="max-w-2xl bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-6 space-y-6 backdrop-blur-md">
        <div className="border-b border-zinc-800 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[#5E5CE6]" />
            Push Notification Broadcast Dispatcher
          </h3>
        </div>

        <div className="space-y-4">
          {/* Target Audience */}
          <div>
            <label className="text-[10px] text-zinc-450 uppercase font-black tracking-wider block mb-1">
              Target Audience
            </label>
            <select
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value)}
              className="w-full max-w-xs bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5E5CE6] transition-colors"
            >
              <option value="all">All registered accounts</option>
              <option value="customer">Customers Only</option>
              <option value="provider">Service Providers Only</option>
              <option value="handyman">Handyman Only</option>
            </select>
          </div>

          {/* Broadcast Title */}
          <div>
            <label className="text-[10px] text-zinc-450 uppercase font-black tracking-wider block mb-1">
              Alert Title
            </label>
            <input
              type="text"
              placeholder="e.g. Schedule Maintenance Notice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5E5CE6] transition-colors"
              required
            />
          </div>

          {/* Broadcast Message Body */}
          <div>
            <label className="text-[10px] text-zinc-455 uppercase font-black tracking-wider block mb-1">
              Alert Body Content
            </label>
            <textarea
              placeholder="Type notification text to be delivered instantly to device trays..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full min-h-[120px] bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5E5CE6] transition-colors resize-none leading-relaxed"
              required
            />
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-[#5E5CE6]/20"
          >
            {isSending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Broadcast Alert
          </button>
        </div>
      </form>
    </div>
  );
}
