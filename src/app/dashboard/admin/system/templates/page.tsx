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

      {/* Templates List Table */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md rounded-xl overflow-hidden">
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
          <div className="p-12 text-center text-zinc-500 text-xs">
            No notification templates configured.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#5E5CE6]/90 text-[11px] font-bold text-white uppercase tracking-wider">
                <th className="py-3 px-4 rounded-tl-xl">Template Name</th>
                <th className="py-3 px-4">Subject Line / Default Content</th>
                <th className="py-3 px-4">Active Channels</th>
                <th className="py-3 px-4">Placeholders</th>
                <th className="py-3 px-4 rounded-tr-xl text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-xs">
              {templates.map((tpl) => (
                <tr key={tpl.id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="py-4 px-4 font-bold text-zinc-200">{tpl.name}</td>
                  <td className="py-4 px-4 text-zinc-400 italic max-w-xs truncate">{tpl.subject || 'N/A'}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {tpl.channels.map((ch) => (
                        <span key={ch} className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-400 font-mono text-[9px] uppercase tracking-wider">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1 flex-wrap max-w-xs">
                      {tpl.variables.map((v) => (
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
