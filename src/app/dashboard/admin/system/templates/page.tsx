'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../lib/apiClient';
import {
  Mail, MessageSquare, Loader2, AlertCircle, ShieldCheck
} from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  channels: string[]; // e.g. ["email", "sms", "push"]
  variables: string[];
  status: boolean;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/admin/system/templates');
      setTemplates(res.data || []);
      setFetchError(null);
    } catch (err) {
      console.error(err);
      setFetchError('Failed to fetch notification templates.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleToggleStatus = async (templateId: string) => {
    try {
      const res = await apiClient.put(`/admin/system/templates/${templateId}/toggle`);
      setTemplates(prev =>
        prev.map(t => (t.id === templateId ? { ...t, status: res.data.status } : t))
      );
    } catch (err) {
      console.error('Failed to toggle template status:', err);
    }
  };

  const tabs = [
    { name: 'Help Desk', href: '/dashboard/admin/system/helpdesk', active: false },
    { name: 'CMS Pages', href: '/dashboard/admin/system/pages', active: false },
    { name: 'Plans', href: '/dashboard/admin/system/plans', active: false },
    { name: 'Taxes', href: '/dashboard/admin/system/taxes', active: false },
    { name: 'KYC Documents', href: '/dashboard/admin/system/documents', active: false },
    { name: 'Blogs', href: '/dashboard/admin/system/blogs', active: false },
    { name: 'Templates', href: '/dashboard/admin/system/templates', active: true },
    { name: 'Settings', href: '/dashboard/admin/system/settings', active: false },
    { name: 'Push Notifications', href: '/dashboard/admin/system/push-notifications', active: false },
  ];

  return (
    <div className="p-6 space-y-8 relative min-h-screen text-zinc-100">
      {/* Background ambient glows */}
      <div className="fixed top-0 left-[20%] w-[600px] h-[600px] bg-[#5E5CE6]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      {/* Header section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[#5E5CE6]" />
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

      {/* Templates List Table */}
      <div className="bg-[#0a0a0c]/60 border border-white/5 backdrop-blur-2xl rounded-[28px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] relative z-10">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
            <span className="text-xs text-zinc-500">Loading templates...</span>
          </div>
        ) : fetchError ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs">{fetchError}</span>
          </div>
        ) : templates.length === 0 ? (
          <div className="p-16 text-center text-zinc-400 font-medium text-sm bg-[#0a0a0c]/40">
            No notification templates configured.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-white text-[11px] font-extrabold uppercase tracking-widest">
                <th className="py-3 px-4 rounded-tl-xl">Template Name</th>
                <th className="py-3 px-4">Subject Line / Default Content</th>
                <th className="py-3 px-4">Active Channels</th>
                <th className="py-3 px-4">Placeholders</th>
                <th className="py-3 px-4 rounded-tr-xl text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-xs">
              {templates.map((tpl) => (
                <tr key={tpl.id} className="hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0 hover:shadow-lg">
                  <td className="py-4 px-4 font-bold text-zinc-200">{tpl.name}</td>
                  <td className="py-4 px-4 text-zinc-400 italic max-w-xs truncate">{tpl.subject || 'N/A'}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {(tpl.channels || []).map((ch) => (
                        <span key={ch} className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-400 font-mono text-[9px] uppercase tracking-wider">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1 flex-wrap max-w-xs">
                      {(tpl.variables || []).map((v) => (
                        <span key={v} className="px-1 py-0.5 rounded bg-[#5E5CE6]/10 text-[#8C8AFF] text-[9px] font-mono">
                          {"{" + v + "}"}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(tpl.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        tpl.status
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                      }`}
                    >
                      {tpl.status ? 'Active' : 'Inactive'}
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
