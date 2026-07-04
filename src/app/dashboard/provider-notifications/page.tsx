'use client';

import { useEffect, useState } from 'react';
import {
  Bell, Calendar, Tag, CheckCircle2,
  RefreshCw, X, MessageSquare
} from 'lucide-react';
import { useNotificationStore } from '../../../store/useNotificationStore';

export default function ProviderNotificationsPage() {
  const notifications = useNotificationStore(state => state.notifications);
  const loading = useNotificationStore(state => state.loading);
  const storeError = useNotificationStore(state => state.error);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(storeError);
  }, [storeError]);

  const fetchNotifications = useNotificationStore(state => state.fetchNotifications);
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const markAllAsRead = useNotificationStore(state => state.markAllAsRead);

  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    setSuccessMsg('Notification marked as read.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setSuccessMsg('All notifications marked as read.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'booking':
        return <Calendar className="w-5 h-5 text-primary" />;
      case 'promo':
        return <Tag className="w-5 h-5 text-emerald-400" />;
      case 'review':
        return <MessageSquare className="w-5 h-5 text-amber-400" />;
      default:
        return <Bell className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getFormatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Partner Notifications
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">Stay updated with new service requests, cancellations, and earnings.</p>
        </div>
        <div className="flex gap-2">
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center justify-center gap-1.5 h-10 px-4 bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Mark all as read
            </button>
          )}
          <button
            onClick={fetchNotifications}
            className="flex items-center justify-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 text-zinc-350 hover:text-white rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4 text-primary" />
            Refresh
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-2.5 text-xs animate-fade-in">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-zinc-900/40 border border-zinc-850 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl divide-y divide-zinc-850 overflow-hidden shadow-lg">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkAsRead(n.id)}
              className={`p-5 flex items-start gap-4 transition-all duration-150 cursor-pointer ${
                n.is_read ? 'opacity-70 hover:bg-zinc-800/10' : 'bg-primary/5 hover:bg-primary/10'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-855 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
                    {n.title}
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    )}
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                    {getFormatDate(n.created_at)}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="py-16 text-center space-y-2">
              <Bell className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-zinc-500 text-sm font-medium">No partner notifications at the moment.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
