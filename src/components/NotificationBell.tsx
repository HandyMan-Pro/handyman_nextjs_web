'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, Check, X, ExternalLink, Loader2 } from 'lucide-react';
import { useNotificationStore, Notification } from '../store/useNotificationStore';

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function getNotifTypeStyle(type: string): string {
  switch (type) {
    case 'booking': return 'bg-blue-500/20 text-blue-400';
    case 'system': return 'bg-amber-500/20 text-amber-400';
    case 'assignment': return 'bg-purple-500/20 text-purple-400';
    case 'id_verification': return 'bg-emerald-500/20 text-emerald-400';
    case 'id_verification_result': return 'bg-teal-500/20 text-teal-400';
    default: return 'bg-zinc-700/40 text-zinc-400';
  }
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications = useNotificationStore(s => s.notifications);
  const unreadCount = useNotificationStore(s => s.unreadCount);
  const loading = useNotificationStore(s => s.loading);
  const markAllAsRead = useNotificationStore(s => s.markAllAsRead);
  const markAsRead = useNotificationStore(s => s.markAsRead);
  const fetchNotifications = useNotificationStore(s => s.fetchNotifications);

  // Fetch on first open
  useEffect(() => {
    if (open && notifications.length === 0) {
      fetchNotifications();
    }
  }, [open]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recentNotifs = notifications.slice(0, 8);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all"
        aria-label="Notifications"
      >
        <Bell className={`w-[18px] h-[18px] transition-transform ${open ? 'scale-110' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-zinc-950 px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-[380px] max-h-[480px] bg-zinc-900/98 border border-zinc-800/60 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
            <h3 className="text-sm font-bold text-zinc-200">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[380px]">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : recentNotifs.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Bell className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">No notifications yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/40">
                {recentNotifs.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (!n.is_read) markAsRead(n.id);
                    }}
                    className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-zinc-800/30 ${
                      !n.is_read ? 'bg-zinc-800/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Unread indicator */}
                      <div className="mt-1.5 shrink-0">
                        {!n.is_read ? (
                          <span className="block w-2 h-2 rounded-full bg-primary shadow-md shadow-primary/30" />
                        ) : (
                          <span className="block w-2 h-2 rounded-full bg-zinc-700" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-bold truncate ${!n.is_read ? 'text-zinc-100' : 'text-zinc-400'}`}>
                            {n.title}
                          </p>
                          <span className="text-[9px] text-zinc-600 shrink-0 font-medium">
                            {timeAgo(n.created_at)}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <span className={`inline-block mt-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getNotifTypeStyle(n.type)}`}>
                          {n.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 8 && (
            <div className="border-t border-zinc-800/50 px-4 py-2.5 text-center">
              <button
                onClick={() => setOpen(false)}
                className="text-[10px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 mx-auto"
              >
                <ExternalLink className="w-3 h-3" />
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
