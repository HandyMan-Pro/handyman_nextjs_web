'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, Plus, ArrowRight, ShieldCheck, Edit3, Trash2
} from 'lucide-react';

interface CMSPageItem {
  slug: string;
  title: string;
  language: string;
  status: boolean;
}

export default function CMSPagesListPage() {
  const router = useRouter();
  const [pages, setPages] = useState<CMSPageItem[]>([
    { slug: 'terms-and-conditions', title: 'Terms & Conditions', language: 'English', status: true },
    { slug: 'privacy-policy', title: 'Privacy Policy', language: 'English', status: true },
    { slug: 'about-us', title: 'About Us', language: 'English', status: true },
    { slug: 'refund-policy', title: 'Refund Policy', language: 'English', status: false }
  ]);

  const [newSlug, setNewSlug] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlug.trim()) return;
    const formattedSlug = newSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newPage: CMSPageItem = {
      slug: formattedSlug,
      title: newTitle || newSlug,
      language: 'English',
      status: true
    };
    setPages([...pages, newPage]);
    setNewSlug('');
    setNewTitle('');
    setShowAddForm(false);
    router.push(`/dashboard/admin/system/pages/${formattedSlug}`);
  };

  const tabs = [
    { name: 'Help Desk', href: '/dashboard/admin/system/helpdesk', active: false },
    { name: 'CMS Pages', href: '/dashboard/admin/system/pages', active: true },
    { name: 'Plans', href: '/dashboard/admin/system/plans', active: false },
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
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white text-xs font-bold transition-all shadow-md shadow-[#5E5CE6]/20"
          >
            <Plus className="w-4 h-4" />
            Add New Page
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
        <form onSubmit={handleCreatePage} className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-xl max-w-md space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Create Custom Page</h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 font-bold block mb-1">Page Title</label>
              <input
                type="text"
                placeholder="e.g. Terms and Conditions"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (!newSlug) setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#5E5CE6]"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold block mb-1">URL Slug</label>
              <input
                type="text"
                placeholder="e.g. terms-and-conditions"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#5E5CE6]"
                required
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] font-bold text-zinc-400 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-[10px] font-bold text-white rounded"
            >
              Create & Edit
            </button>
          </div>
        </form>
      )}

      {/* Pages List */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#5E5CE6]/90 text-[11px] font-bold text-white uppercase tracking-wider">
              <th className="py-3 px-4 rounded-tl-xl">Page Title</th>
              <th className="py-3 px-4">URL Slug</th>
              <th className="py-3 px-4">Default Language</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 rounded-tr-xl text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50 text-xs">
            {pages.map((page) => (
              <tr key={page.slug} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                <td className="py-4 px-4 font-bold text-zinc-200">{page.title}</td>
                <td className="py-4 px-4 text-zinc-500 font-mono text-[11px]">/{page.slug}</td>
                <td className="py-4 px-4 text-zinc-400">{page.language}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    page.status
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-zinc-750 text-zinc-500 border border-zinc-800'
                  }`}>
                    {page.status ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => router.push(`/dashboard/admin/system/pages/${page.slug}`)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 rounded text-[10px] text-zinc-300 transition-colors font-bold uppercase"
                  >
                    <Edit3 className="w-3 h-3" />
                    Configure Editor
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
