'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import {
  Megaphone, Send, RefreshCw, X, Loader2, Info,
  Users, Briefcase, Hammer, Clock, MessageSquare, AlertCircle
} from 'lucide-react';

interface NotificationLog {
  id: string;
  title: string;
  message: string;
  user_type: string; // all | user | provider | handyman
  recipient_count: number;
  sent: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userType, setUserType] = useState('all'); // all | user | provider | handyman
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchNotificationLogs();
  }, []);

  const fetchNotificationLogs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/notification-logs');
      setLogs(res.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch notification logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setSending(true);
    try {
      const res = await apiClient.post('/admin/send-notification', {
        title,
        message,
        user_type: userType
      });
      setSuccessMsg(res.data.message || 'Bulk push notification sent successfully!');
      setTitle('');
      setMessage('');
      fetchNotificationLogs();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send bulk notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Push Notifications</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Send real-time bulk alerts & announcements to mobile application users.</p>
        </div>
        <button
          onClick={fetchNotificationLogs}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Log
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Broadcast form */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            Send Bulk Alert
          </h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Target Audience</label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value="all">All Users & Partners</option>
                <option value="user">Customers Only</option>
                <option value="provider">Service Providers Only</option>
                <option value="handyman">Handymen Only</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Notification Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Festival Season discount!"
                className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Message Description</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Write your push notification message details here..."
                className="w-full p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 hover:shadow-primary/35"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Broadcast Push
            </button>
          </form>
        </div>

        {/* History log */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 shadow-xl lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2 text-zinc-200">
            <Clock className="w-5 h-5 text-primary" />
            Broadcast Log History
          </h2>
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="bg-zinc-800/30 border border-zinc-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-zinc-200">{log.title}</h4>
                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                      log.user_type === 'all' ? 'bg-primary/10 text-primary border-primary/20' :
                      log.user_type === 'user' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      log.user_type === 'provider' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    }`}>
                      {log.user_type}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{log.message}</p>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1">
                    Sent to {log.recipient_count} recipients • {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="shrink-0 self-end sm:self-auto">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    log.sent ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {log.sent ? 'Dispatched' : 'Queued/Failed'}
                  </span>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center py-20">
                <MessageSquare className="w-10 h-10 text-zinc-650 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">No push notification broadcasts sent yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
