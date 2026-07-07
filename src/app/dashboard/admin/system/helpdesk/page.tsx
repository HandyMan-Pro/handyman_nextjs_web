'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../lib/apiClient';
import {
  MessageSquare, Loader2, AlertCircle, Search, RefreshCw, CheckCircle, Clock, AlertTriangle, ShieldCheck
} from 'lucide-react';

interface AuthorInfo {
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface HelpdeskTicket {
  id: string;
  title: string;
  message: string;
  category: string;
  status: string;
  created_at: string;
  author: AuthorInfo;
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

export default function HelpdeskPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);

  const fetcher = useCallback(async (url: string) => {
    const res = await apiClient.get(url);
    return res.data as HelpdeskTicket[];
  }, []);

  const { data: tickets = [], setData: setTickets, error: fetchError, isLoading } = useSimpleSWR<HelpdeskTicket[]>(
    '/admin/system/helpdesk',
    fetcher
  );

  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const query = searchQuery.toLowerCase();
    return tickets.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.message.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.author.name.toLowerCase().includes(query) ||
      t.author.email.toLowerCase().includes(query)
    );
  }, [tickets, searchQuery]);

  const handleToggleStatus = async (ticketId: string) => {
    if (isTogglingId) return;
    setIsTogglingId(ticketId);
    try {
      const res = await apiClient.put(`/admin/system/helpdesk/${ticketId}/status`);
      const newStatus = res.data.status;
      setTickets(prev =>
        prev.map(t => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setIsTogglingId(null);
    }
  };

  const tabs = [
    { name: 'Help Desk', href: '/dashboard/admin/system/helpdesk', active: true },
    { name: 'CMS Pages', href: '/dashboard/admin/system/pages', active: false },
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

      {/* Filter / Search Bar */}
      <div className="p-3 bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md rounded-xl flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search support tickets by author, title, content, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950/60 border border-zinc-800/60 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5E5CE6] transition-colors"
          />
        </div>
      </div>

      {/* Main Glassmorphic Table Container */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-md rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" />
            <span className="text-xs text-zinc-500">Fetching tickets...</span>
          </div>
        ) : fetchError ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs">Failed to load support tickets.</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No support tickets found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5E5CE6]/90 text-[11px] font-bold text-white uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-tl-xl">Author</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Ticket Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 rounded-tr-xl text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="bg-[#18181b] border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    {/* Author Details */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border border-zinc-700">
                          {ticket.author.avatar ? (
                            <img src={ticket.author.avatar} alt={ticket.author.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">
                              {ticket.author.name ? ticket.author.name.substring(0, 2) : '??'}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{ticket.author.name || 'Anonymous'}</div>
                          <div className="text-zinc-500 text-[10px] mt-0.5">{ticket.author.email || 'no-email@test.com'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        ticket.author.role === 'provider'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : ticket.author.role === 'handyman'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {ticket.author.role || 'user'}
                      </span>
                    </td>

                    {/* Ticket Details */}
                    <td className="py-4 px-4 max-w-sm">
                      <div className="font-bold text-zinc-200 text-xs">{ticket.title}</div>
                      <div className="text-zinc-400 text-[11px] mt-1 line-clamp-2 leading-relaxed">{ticket.message}</div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50 text-[10px] font-medium">
                        {ticket.category}
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="py-4 px-4 text-zinc-400 text-[11px]">
                      {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A'}
                    </td>

                    {/* Status Badge Toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(ticket.id)}
                        disabled={isTogglingId === ticket.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          ticket.status === 'Open'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                        }`}
                      >
                        {isTogglingId === ticket.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : ticket.status === 'Open' ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {ticket.status || 'Open'}
                      </button>
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
